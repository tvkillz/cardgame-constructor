-- Align cards table with projects/{site}/game/ domain ids + shop pricing.
-- domain: text id from game/domains.json (kronos, terra, … per site — not a global enum).
-- location_id: realm id from game/locations.json (via location.domainId).
-- price_cents: optional shop price; store_products may also reference card_id.
--
-- Backend VPS:
--   docker compose exec -T db psql -U postgres < volumes/db/cards-schema-migration.sql
--   docker compose restart rest
-- Then from local machine:
--   PROJECT=voidborn npm run upload:site
-- After upload (or for rows still missing prices):
--   docker compose exec -T db psql -U postgres < volumes/db/cards-random-prices-migration.sql

alter table public.cards add column if not exists price_cents integer
  check (price_cents is null or price_cents >= 0);

-- Legacy voidborn enum → project domain ids (text).
do $$
begin
  if exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'public' and t.typname = 'card_domain'
  ) then
    alter table public.cards alter column domain type text using domain::text;
    drop type public.card_domain;
  elsif exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'cards'
      and column_name = 'domain'
      and udt_name != 'text'
  ) then
    alter table public.cards alter column domain type text using domain::text;
  end if;
end $$;

notify pgrst, 'reload schema';
