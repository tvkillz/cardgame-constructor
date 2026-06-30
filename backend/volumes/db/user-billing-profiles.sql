-- Per-user billing / receipt details (written from the browser via Supabase client).

create table if not exists public.user_billing_profiles (
  user_id         uuid not null references auth.users (id) on delete cascade,
  site_id         text not null references public.sites (id),
  first_name      text not null default '',
  last_name       text not null default '',
  address_line1   text not null default '',
  address_line2   text not null default '',
  city            text not null default '',
  state_province  text not null default '',
  postal_code     text not null default '',
  country         text not null default '',
  phone           text not null default '',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  primary key (user_id, site_id)
);

create index if not exists user_billing_profiles_site_idx
  on public.user_billing_profiles (site_id);

alter table public.user_billing_profiles enable row level security;

drop policy if exists "Users read own billing profile" on public.user_billing_profiles;
create policy "Users read own billing profile"
  on public.user_billing_profiles for select
  using (auth.uid() = user_id);

drop policy if exists "Users insert own billing profile" on public.user_billing_profiles;
create policy "Users insert own billing profile"
  on public.user_billing_profiles for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users update own billing profile" on public.user_billing_profiles;
create policy "Users update own billing profile"
  on public.user_billing_profiles for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

grant select, insert, update on public.user_billing_profiles to authenticated;
grant all on public.user_billing_profiles to service_role;
