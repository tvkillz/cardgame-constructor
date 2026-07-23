-- Idempotent multi-site tables + auth email helpers. Safe to re-run on existing DBs.
-- Backend VPS: docker compose exec -T db psql -U postgres < volumes/db/sites-bootstrap.sql
-- Then: docker compose restart rest

create table if not exists public.sites (
  id          text primary key,
  name        text not null,
  domain      text not null,
  status      text not null default 'live' check (status in ('live', 'demo', 'disabled')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists sites_domain_idx on public.sites (domain);

insert into public.sites (id, name, domain, status) values
  ('voidborn', 'VOIDBORN', 'voidborn.fun', 'live'),
  ('project2', 'PROJECT TWO', 'test.sportsydeals.com', 'demo'),
  ('iyashikei', 'KOMOREBI', 'komorebi.voidborn.fun', 'demo'),
  ('helix', 'HELIX', 'helix.voidborn.fun', 'demo')
on conflict (id) do update set
  name = excluded.name,
  domain = excluded.domain,
  status = excluded.status,
  updated_at = now();

create table if not exists public.site_members (
  user_id    uuid not null references auth.users (id) on delete cascade,
  site_id    text not null references public.sites (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, site_id)
);

create index if not exists site_members_site_idx on public.site_members (site_id);

create table if not exists public.profiles (
  id uuid references auth.users not null primary key,
  updated_at timestamptz,
  username text,
  avatar_url text,
  website text
);

alter table public.profiles add column if not exists site_id text references public.sites (id);
alter table public.profiles add column if not exists display_email text;
alter table public.profiles add column if not exists is_admin boolean not null default false;

alter table public.profiles drop constraint if exists profiles_username_key;
create unique index if not exists profiles_site_username_idx
  on public.profiles (site_id, username)
  where username is not null;

alter table public.sites enable row level security;
alter table public.site_members enable row level security;
alter table public.profiles enable row level security;

drop policy if exists "Sites are readable by everyone" on public.sites;
create policy "Sites are readable by everyone"
  on public.sites for select using (true);

drop policy if exists "Users read own site memberships" on public.site_members;
create policy "Users read own site memberships"
  on public.site_members for select using (auth.uid() = user_id);

drop policy if exists "Users read own profile" on public.profiles;
drop policy if exists "Users insert own profile" on public.profiles;
drop policy if exists "Users update own profile" on public.profiles;

create policy "Users read own profile"
  on public.profiles for select using (auth.uid() = id);

create policy "Users insert own profile"
  on public.profiles for insert with check (auth.uid() = id);

create policy "Users update own profile"
  on public.profiles for update using (auth.uid() = id);

create or replace function public.auth_email_site_id(p_email text)
returns text
language sql
immutable
as $$
  select nullif(
    (regexp_match(lower(split_part(p_email, '@', 1)), '\+([^+]+)$'))[1],
    ''
  )
$$;

create or replace function public.auth_email_display(p_email text)
returns text
language sql
immutable
as $$
  select case
    when lower(split_part(p_email, '@', 1)) ~ '\+[^+]+$' then
      regexp_replace(split_part(p_email, '@', 1), '\+[^+]+$', '') || '@' || split_part(p_email, '@', 2)
    else p_email
  end
$$;

-- Auto-create profiles + site_members on signup (see volumes/db/profiles-auth-trigger.sql).
create or replace function public.handle_new_site_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_site_id text;
  v_display_email text;
  v_username text;
begin
  v_site_id := public.auth_email_site_id(new.email);
  if v_site_id is null or not exists (select 1 from public.sites s where s.id = v_site_id) then
    raise exception 'invalid_site_auth_email';
  end if;

  v_display_email := coalesce(
    nullif(trim(new.raw_user_meta_data ->> 'display_email'), ''),
    public.auth_email_display(new.email)
  );
  v_username := coalesce(
    nullif(trim(new.raw_user_meta_data ->> 'username'), ''),
    split_part(v_display_email, '@', 1)
  );

  insert into public.site_members (user_id, site_id)
  values (new.id, v_site_id)
  on conflict do nothing;

  insert into public.profiles (id, site_id, display_email, username, updated_at)
  values (new.id, v_site_id, v_display_email, v_username, now())
  on conflict (id) do update set
    site_id = excluded.site_id,
    display_email = excluded.display_email,
    username = coalesce(public.profiles.username, excluded.username),
    updated_at = now();

  perform public.ensure_wallet(new.id);
  perform public.ensure_test_deck(new.id, v_site_id);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_site on auth.users;
create trigger on_auth_user_created_site
  after insert on auth.users
  for each row execute function public.handle_new_site_user();

-- Per-site scoping on play data (match edge function requires matches.site_id).
alter table public.matches add column if not exists site_id text references public.sites (id);
update public.matches m
set site_id = sm.site_id
from public.site_members sm
where m.user_id = sm.user_id and m.site_id is null;
update public.matches set site_id = 'voidborn' where site_id is null;
alter table public.matches alter column site_id set default 'voidborn';
create index if not exists matches_site_user_idx on public.matches (site_id, user_id);

alter table public.player_decks add column if not exists site_id text references public.sites (id);
update public.player_decks d
set site_id = sm.site_id
from public.site_members sm
where d.user_id = sm.user_id and d.site_id is null;
update public.player_decks set site_id = 'voidborn' where site_id is null;
alter table public.player_decks alter column site_id set default 'voidborn';

grant select on public.sites to anon, authenticated;
grant select on public.site_members to authenticated;
grant all on public.site_members to service_role;
grant all on public.profiles to service_role;
grant all on public.matches to service_role;
grant all on public.player_decks to service_role;

-- Per-site card catalog (required before path backfill below).
alter table public.cards add column if not exists site_id text references public.sites (id);
update public.cards set site_id = 'voidborn' where site_id is null;
alter table public.cards alter column site_id set default 'voidborn';
alter table public.cards alter column site_id set not null;

alter table public.cards drop constraint if exists cards_slug_key;
create unique index if not exists cards_site_slug_idx on public.cards (site_id, slug);
create index if not exists cards_site_idx on public.cards (site_id);

alter table public.cards add column if not exists location_id text;
create index if not exists cards_site_location_idx on public.cards (site_id, location_id);

update public.cards set location_id = 'kronos'
where site_id = 'voidborn' and domain = 'terra' and location_id is null;
update public.cards set location_id = 'thalassa'
where site_id = 'voidborn' and domain = 'aqua' and location_id is null;
update public.cards set location_id = 'infernus'
where site_id = 'voidborn' and domain = 'ignis' and location_id is null;
update public.cards set location_id = 'anemos'
where site_id = 'voidborn' and domain = 'zephyr' and location_id is null;
update public.cards set location_id = 'emerald'
where site_id = 'project2' and domain = 'terra' and location_id is null;
update public.cards set location_id = 'tidepool'
where site_id = 'project2' and domain = 'aqua' and location_id is null;

drop policy if exists "Published cards are readable by everyone" on public.cards;
create policy "Published cards are readable by everyone"
  on public.cards for select
  using (published = true);

alter table public.location_featured_cards add column if not exists site_id text references public.sites (id);
update public.location_featured_cards l
set site_id = c.site_id
from public.cards c
where l.card_id = c.id and l.site_id is null;
update public.location_featured_cards set site_id = 'voidborn' where site_id is null;
alter table public.location_featured_cards alter column site_id set not null;
create index if not exists location_featured_cards_site_idx on public.location_featured_cards (site_id);

alter table public.location_featured_cards drop constraint if exists location_featured_cards_pkey;
create unique index if not exists location_featured_cards_site_location_idx
  on public.location_featured_cards (site_id, location_id);
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'location_featured_cards_pkey'
      and conrelid = 'public.location_featured_cards'::regclass
  ) then
    alter table public.location_featured_cards
      add constraint location_featured_cards_pkey
      primary key using index location_featured_cards_site_location_idx;
  end if;
end $$;

-- Legacy card paths: thumbs/domain/file → {site_id}/thumbs/domain/file
update public.cards
set storage_path = site_id || '/' || storage_path
where site_id is not null
  and storage_path is not null
  and storage_path not like site_id || '/%';

update public.cards
set thumb_storage_path = site_id || '/' || thumb_storage_path
where site_id is not null
  and thumb_storage_path is not null
  and thumb_storage_path not like site_id || '/%';

-- Backfill site_members from +suffix auth emails (when trigger/migrate skipped rows)
insert into public.site_members (user_id, site_id)
select
  u.id,
  (regexp_match(lower(split_part(u.email, '@', 1)), '\+([^+]+)$'))[1]
from auth.users u
where u.email ~ '\+[^+]+@'
  and (regexp_match(lower(split_part(u.email, '@', 1)), '\+([^+]+)$'))[1] is not null
  and exists (
    select 1 from public.sites s
    where s.id = (regexp_match(lower(split_part(u.email, '@', 1)), '\+([^+]+)$'))[1]
  )
on conflict do nothing;

-- Backfill profiles for users created before handle_new_site_user trigger existed.
insert into public.profiles (id, site_id, display_email, username, updated_at)
select
  u.id,
  public.auth_email_site_id(u.email),
  coalesce(
    nullif(trim(u.raw_user_meta_data ->> 'display_email'), ''),
    public.auth_email_display(u.email)
  ),
  coalesce(
    nullif(trim(u.raw_user_meta_data ->> 'username'), ''),
    split_part(
      coalesce(
        nullif(trim(u.raw_user_meta_data ->> 'display_email'), ''),
        public.auth_email_display(u.email)
      ),
      '@',
      1
    )
  ),
  coalesce(u.created_at, now())
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null
  and public.auth_email_site_id(u.email) is not null
  and exists (select 1 from public.sites s where s.id = public.auth_email_site_id(u.email))
on conflict (id) do nothing;

notify pgrst, 'reload schema';
