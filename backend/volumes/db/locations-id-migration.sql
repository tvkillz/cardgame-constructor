-- Cards: link each row to a realm location id (kronos, thalassa, …) from projects/{site}/game/locations.json.
--
-- IMPORTANT: cards.domain stays terra/aqua/ignis/zephyr — that is the elemental type (art paths,
-- slugs, game rules). location_id is the realm name id shown on the landing (Kronos, Thalassa, …).
--
-- Safe to re-run. Does NOT touch location_featured_cards.
--
-- Backend VPS:
--   docker compose exec -T db psql -U postgres < volumes/db/locations-id-migration.sql
--   docker compose restart rest
-- Then frontend VPS:
--   PROJECT=voidborn npm run upload:site

alter table public.cards add column if not exists location_id text;

create index if not exists cards_site_location_idx on public.cards (site_id, location_id);

-- voidborn (domain → realm)
update public.cards set location_id = 'kronos'
where site_id = 'voidborn' and domain = 'terra';

update public.cards set location_id = 'thalassa'
where site_id = 'voidborn' and domain = 'aqua';

update public.cards set location_id = 'infernus'
where site_id = 'voidborn' and domain = 'ignis';

update public.cards set location_id = 'anemos'
where site_id = 'voidborn' and domain = 'zephyr';

-- project2
update public.cards set location_id = 'emerald'
where site_id = 'project2' and domain = 'terra';

update public.cards set location_id = 'tidepool'
where site_id = 'project2' and domain = 'aqua';

-- Drop mistaken rows that used domain id as card slug (legacy “location as card” seed)
delete from public.cards c
where c.slug in ('terra', 'aqua', 'ignis', 'zephyr')
  and not exists (
    select 1 from public.player_deck_cards pdc where pdc.card_id = c.id
  )
  and not exists (
    select 1 from public.location_featured_cards lfc where lfc.card_id = c.id
  );

notify pgrst, 'reload schema';
