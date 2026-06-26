-- Backfill ladder rows for existing players and fix indexes/functions on live DBs.
-- Run after player-rankings.sql.

drop index if exists player_rankings_site_ladder_idx;
create index if not exists player_rankings_site_ladder_idx
  on public.player_rankings (site_id, rating desc, updated_at asc);

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

-- Existing real players: default rating 1000, no ranked games yet.
insert into public.player_rankings (
  user_id, site_id, rating, wins, losses, games_played, created_at, updated_at
)
select distinct src.user_id, src.site_id, 1000, 0, 0, 0, now(), now()
from (
  select user_id, site_id from public.site_members
  union
  select id as user_id, site_id from public.profiles where site_id is not null
) src
where not exists (
  select 1
  from auth.users u
  where u.id = src.user_id
    and coalesce(u.raw_user_meta_data ->> 'is_bot', 'false') = 'true'
)
on conflict (user_id, site_id) do nothing;

-- Fire trigger logic for any profile that still lacks a row (e.g. site_id set before trigger existed).
do $$
declare
  v_profile record;
begin
  for v_profile in
    select p.id, p.site_id
    from public.profiles p
    where p.site_id is not null
      and not exists (
        select 1
        from public.player_rankings pr
        where pr.user_id = p.id and pr.site_id = p.site_id
      )
  loop
    perform public.ensure_player_ranking(v_profile.id, v_profile.site_id);
  end loop;
end;
$$;
