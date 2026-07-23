-- Multi-tenant sites (one row per content pack / frontend deployment).
-- Auth uses site-suffixed emails: jane+voidborn@example.com (see frontend lib/auth/site-email.ts).

create table public.sites (
  id          text primary key,
  name        text not null,
  domain      text not null,
  status      text not null default 'live' check (status in ('live', 'demo', 'disabled')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index sites_domain_idx on public.sites (domain);

insert into public.sites (id, name, domain, status) values
  ('voidborn', 'VOIDBORN', 'voidborn.fun', 'live'),
  ('project2', 'PROJECT TWO', 'project2.example.com', 'demo'),
  ('iyashikei', 'KOMOREBI', 'komorebi.voidborn.fun', 'demo'),
  ('helix', 'HELIX', 'helix.voidborn.fun', 'demo')
on conflict (id) do update set
  name = excluded.name,
  domain = excluded.domain,
  status = excluded.status,
  updated_at = now();

-- Explicit membership (one auth.users row is already site-scoped via email prefix; this is for audits and JWT checks).
create table public.site_members (
  user_id    uuid not null references auth.users (id) on delete cascade,
  site_id    text not null references public.sites (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, site_id)
);

create index site_members_site_idx on public.site_members (site_id);

alter table public.sites enable row level security;
alter table public.site_members enable row level security;

create policy "Sites are readable by everyone"
  on public.sites for select
  using (true);

create policy "Users read own site memberships"
  on public.site_members for select
  using (auth.uid() = user_id);

-- Parse site id from auth email local part: display+siteId@domain
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

-- Extend profiles for multi-site (table may already exist from dev seed).
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

-- Drop global username unique if present; use per-site uniqueness.
alter table public.profiles drop constraint if exists profiles_username_key;
alter table public.profiles drop constraint if exists username_length;
create unique index if not exists profiles_site_username_idx
  on public.profiles (site_id, username)
  where username is not null;

alter table public.profiles enable row level security;

drop policy if exists "Public profiles are viewable by the owner." on public.profiles;
drop policy if exists "Users can insert their own profile." on public.profiles;
drop policy if exists "Users can update own profile." on public.profiles;

create policy "Users read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create or replace function public.auth_email_resolve_site_id(p_suffix text)
returns text
language sql
immutable
as $$
  select case p_suffix
    when 'komorebi' then 'iyashikei'
    else p_suffix
  end
$$;

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
  v_site_id := public.auth_email_resolve_site_id(public.auth_email_site_id(new.email));
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

grant select on public.sites to anon, authenticated;
grant select on public.site_members to authenticated;
