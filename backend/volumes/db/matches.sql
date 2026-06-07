-- Active PvE matches (hero vs villain). Game logic runs in the match edge function.

create type public.match_mode as enum ('casual', 'ranked', 'tutorial');
create type public.match_status as enum ('active', 'completed', 'abandoned');
create type public.match_phase as enum ('hero_main', 'villain_main', 'combat', 'ended');
create type public.match_side as enum ('hero', 'villain');

create table public.matches (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users (id) on delete cascade,
  player_deck_id  uuid references public.player_decks (id) on delete set null,
  mode            public.match_mode not null default 'casual',
  status          public.match_status not null default 'active',
  turn            smallint not null default 1 check (turn >= 1),
  phase           public.match_phase not null default 'hero_main',
  winner          public.match_side,
  state           jsonb not null,
  revision        bigint not null default 1,
  rng_seed        bigint not null default (floor(random() * 9223372036854775807)::bigint),
  last_combat     jsonb,
  villain_plays   jsonb,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  completed_at    timestamptz,
  constraint matches_winner_when_completed check (
    status <> 'completed' or winner is not null
  )
);

create index matches_user_active_idx
  on public.matches (user_id, updated_at desc)
  where status = 'active';

create index matches_user_id_idx on public.matches (user_id);

alter table public.matches enable row level security;

create policy "Users read own matches"
  on public.matches for select
  using (auth.uid() = user_id);

create policy "Users insert own matches"
  on public.matches for insert
  with check (auth.uid() = user_id);

create policy "Users update own matches"
  on public.matches for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users delete own matches"
  on public.matches for delete
  using (auth.uid() = user_id);

-- Abandon any other active matches when starting a new one (called from edge function with service role).
create or replace function public.match_abandon_others(p_user_id uuid, p_keep_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.matches
  set status = 'abandoned', updated_at = now()
  where user_id = p_user_id
    and status = 'active'
    and id <> p_keep_id;
end;
$$;

grant execute on function public.match_abandon_others(uuid, uuid) to service_role;
