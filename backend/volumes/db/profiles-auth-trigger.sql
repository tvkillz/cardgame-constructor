-- Creates profile + site_members rows when a user signs up (auth.users insert).
-- Safe to re-run on existing DBs (installs trigger + backfills missing rows).
--
-- VPS:
--   cd backend
--   docker compose exec -T db psql -U postgres < volumes/db/profiles-auth-trigger.sql

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

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_site on auth.users;
create trigger on_auth_user_created_site
  after insert on auth.users
  for each row execute function public.handle_new_site_user();

-- Backfill site_members for users created before this trigger existed.
insert into public.site_members (user_id, site_id)
select
  u.id,
  public.auth_email_site_id(u.email)
from auth.users u
where public.auth_email_site_id(u.email) is not null
  and exists (select 1 from public.sites s where s.id = public.auth_email_site_id(u.email))
  and not exists (
    select 1 from public.site_members sm
    where sm.user_id = u.id and sm.site_id = public.auth_email_site_id(u.email)
  )
on conflict do nothing;

-- Backfill profiles for users created before this trigger existed.
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
