-- Assign random market prices to cards missing price_cents (or zero).
-- credits displayed in UI = price_cents (1:1). Range: 1000 ($10) … 100000 ($1000) inclusive.
--
-- Backend VPS:
--   docker compose exec -T db psql -U postgres < volumes/db/cards-random-prices-migration.sql
--   docker compose restart rest
--
-- Re-run safe: only updates rows where price_cents is null or 0.
-- Run after cards-schema-migration.sql and upload:site.

update public.cards
set
  price_cents = floor(random() * (100000 - 1000 + 1) + 1000)::integer,
  updated_at = now()
where price_cents is null or price_cents = 0;

notify pgrst, 'reload schema';
