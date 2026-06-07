-- Plus-addressing auth emails (GoTrue rejects "::" in local part).
-- Run on existing DBs: docker compose exec db psql -U postgres -f /docker-entrypoint-initdb.d/migrations/99-sites-auth-email-plus.sql
-- Or paste in DBeaver.

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
