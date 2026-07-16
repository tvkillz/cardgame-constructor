-- Migrate Komorebi auth emails: +komorebi → +iyashikei
--
-- Run on API VPS (preview first, then apply):
--   docker compose exec -T db psql -U postgres < volumes/db/migrate-komorebi-auth-suffix.sql
--
-- After this, frontend must use only +iyashikei (manifest authEmailSuffix removed).
-- Keep sites-auth-email-alias.sql mapping so any leftover +komorebi still resolves
-- to site iyashikei until you drop the alias later.

begin;

-- ---------------------------------------------------------------------------
-- 1) Preview (also printed via RAISE NOTICE during apply)
-- ---------------------------------------------------------------------------
do $$
declare
  r record;
  n_komorebi int;
  n_conflict int;
  n_rename int;
begin
  select count(*) into n_komorebi
  from auth.users
  where email ~* '\+komorebi@';

  select count(*) into n_conflict
  from auth.users k
  where k.email ~* '\+komorebi@'
    and exists (
      select 1
      from auth.users i
      where lower(i.email) = lower(regexp_replace(k.email, '\+komorebi@', '+iyashikei@', 'i'))
    );

  n_rename := n_komorebi - n_conflict;

  raise notice 'migrate-komorebi-auth-suffix: +komorebi users=% rename=% delete_duplicate=%',
    n_komorebi, n_rename, n_conflict;

  for r in
    select k.id, k.email,
           regexp_replace(k.email, '\+komorebi@', '+iyashikei@', 'i') as new_email,
           exists (
             select 1 from auth.users i
             where lower(i.email) = lower(regexp_replace(k.email, '\+komorebi@', '+iyashikei@', 'i'))
           ) as has_iyashikei
    from auth.users k
    where k.email ~* '\+komorebi@'
    order by k.created_at
  loop
    if r.has_iyashikei then
      raise notice 'DUPLICATE keep iyashikei, delete komorebi: % → would clash with %', r.email, r.new_email;
    else
      raise notice 'RENAME % → %', r.email, r.new_email;
    end if;
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- 2) Delete +komorebi users that already have a +iyashikei twin (same display)
--    Cascades site_members / profiles / decks for the duplicate row only.
-- ---------------------------------------------------------------------------
delete from auth.users k
where k.email ~* '\+komorebi@'
  and exists (
    select 1
    from auth.users i
    where lower(i.email) = lower(regexp_replace(k.email, '\+komorebi@', '+iyashikei@', 'i'))
  );

-- ---------------------------------------------------------------------------
-- 3) Rename remaining +komorebi → +iyashikei (auth.users + email identities)
-- ---------------------------------------------------------------------------
with renamed as (
  update auth.users u
  set
    email = regexp_replace(u.email, '\+komorebi@', '+iyashikei@', 'i'),
    email_change = case
      when u.email_change ~* '\+komorebi@'
        then regexp_replace(u.email_change, '\+komorebi@', '+iyashikei@', 'i')
      else u.email_change
    end,
    updated_at = now()
  where u.email ~* '\+komorebi@'
  returning u.id, u.email
)
update auth.identities idn
set
  provider_id = r.email,
  identity_data = jsonb_set(
    coalesce(idn.identity_data, '{}'::jsonb),
    '{email}',
    to_jsonb(r.email),
    true
  ),
  updated_at = now()
from renamed r
where idn.user_id = r.id
  and idn.provider = 'email';

-- ---------------------------------------------------------------------------
-- 4) Align profiles.display_email is unchanged (display side); site_id stays iyashikei
-- ---------------------------------------------------------------------------
update public.profiles p
set
  site_id = 'iyashikei',
  updated_at = now()
where p.id in (
  select id from auth.users where email ~* '\+iyashikei@'
)
and (p.site_id is distinct from 'iyashikei');

commit;

-- Verify:
--   select id, email from auth.users where email ~* '\+(komorebi|iyashikei)@' order by email;
