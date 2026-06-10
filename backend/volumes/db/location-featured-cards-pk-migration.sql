-- Multi-site PK for location_featured_cards (older stacks used location_id only).
-- Backend VPS:
--   docker compose exec -T db psql -U postgres < volumes/db/location-featured-cards-pk-migration.sql
--   docker compose restart rest

alter table public.location_featured_cards drop constraint if exists location_featured_cards_pkey;

create unique index if not exists location_featured_cards_site_location_idx
  on public.location_featured_cards (site_id, location_id);

alter table public.location_featured_cards
  add constraint location_featured_cards_pkey primary key using index location_featured_cards_site_location_idx;

notify pgrst, 'reload schema';
