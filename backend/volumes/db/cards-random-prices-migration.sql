-- Assign random market prices to cards missing price_cents (or zero).
-- Range: 100 (€1.00) … 100000 (€1000.00) inclusive.
--
-- Backend VPS:
--   docker compose exec -T db psql -U postgres < volumes/db/cards-random-prices-migration.sql
--   docker compose restart rest
--
-- Re-run safe: only updates rows where price_cents is null or 0.

update public.cards
set
  price_cents = floor(random() * (100000 - 100 + 1) + 100)::integer,
  updated_at = now()
where price_cents is null or price_cents = 0;

notify pgrst, 'reload schema';
