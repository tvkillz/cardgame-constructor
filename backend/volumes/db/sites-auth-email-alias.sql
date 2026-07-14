-- Map public auth email suffixes to internal sites.id (when they differ).
-- Example: user+komorebi@… → site iyashikei (manifest authEmailSuffix).
-- Run on API VPS after adding a new alias:
--   docker compose exec -T db psql -U postgres < volumes/db/sites-auth-email-alias.sql

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
