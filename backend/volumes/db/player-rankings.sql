-- Competitive (ranked) ladder ratings per site. Casual matches do not affect ratings.

create table public.player_rankings (
  user_id       uuid not null references auth.users (id) on delete cascade,
  site_id       text not null references public.sites (id) on delete cascade,
  rating        integer not null default 1000 check (rating >= 0),
  wins          integer not null default 0 check (wins >= 0),
  losses        integer not null default 0 check (losses >= 0),
  games_played  integer not null default 0 check (games_played >= 0),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  primary key (user_id, site_id)
);

create index player_rankings_site_ladder_idx
  on public.player_rankings (site_id, rating desc, updated_at asc);

alter table public.player_rankings enable row level security;

create policy "Rankings are readable by everyone"
  on public.player_rankings for select
  using (true);

-- Default ladder row (rating 1000) for real players. Seed bots are excluded via is_bot metadata.
create or replace function public.ensure_player_ranking(
  p_user_id uuid,
  p_site_id text
)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if p_site_id is null then
    return;
  end if;

  if exists (
    select 1
    from auth.users u
    where u.id = p_user_id
      and coalesce(u.raw_user_meta_data ->> 'is_bot', 'false') = 'true'
  ) then
    return;
  end if;

  insert into public.player_rankings (
    user_id, site_id, rating, wins, losses, games_played, created_at, updated_at
  )
  values (p_user_id, p_site_id, 1000, 0, 0, 0, now(), now())
  on conflict (user_id, site_id) do nothing;
end;
$$;

grant execute on function public.ensure_player_ranking(uuid, text) to service_role;

create or replace function public.sync_profile_player_ranking()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if new.site_id is not null then
    perform public.ensure_player_ranking(new.id, new.site_id);
  end if;
  return new;
end;
$$;

drop trigger if exists on_profile_player_ranking_sync on public.profiles;
create trigger on_profile_player_ranking_sync
  after insert or update of site_id on public.profiles
  for each row execute function public.sync_profile_player_ranking();

-- Rank position: 1 = highest rating.
create or replace function public.player_rank_position(
  p_site_id text,
  p_user_id uuid
)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  with viewer as (
    select rating, updated_at
    from public.player_rankings
    where site_id = p_site_id
      and user_id = p_user_id
  )
  select case
    when not exists (select 1 from viewer) then null
    else (
      select count(*)::integer + 1
      from public.player_rankings pr, viewer v
      where pr.site_id = p_site_id
        and (
          pr.rating > v.rating
          or (pr.rating = v.rating and pr.updated_at < v.updated_at)
        )
    )
  end;
$$;

grant execute on function public.player_rank_position(text, uuid) to service_role;

-- Idempotency: only apply ladder changes once per completed ranked match.
alter table public.matches
  add column if not exists rank_applied boolean not null default false;
