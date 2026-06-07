# Card art on a new backend VPS

Storage is **not** in Postgres — moving servers means an **empty** `cards` bucket until you upload.

From `frontend/` (needs `.env.admin` with `SERVICE_ROLE_KEY` + API URL):

```bash
npm run upload:all
# or per site:
PROJECT=voidborn npm run upload:site
PROJECT=project2 npm run upload:site
```

Then rebuild each site (bakes `NEXT_PUBLIC_SUPABASE_URL` and fresh bundles):

```bash
PROJECT=voidborn npm run build
PROJECT=project2 npm run build
pm2 restart voidborn-prod project2-prod
```

Verify one image in browser (note `{siteId}/` prefix on object path):

`https://sportsydeals.com/storage/v1/object/public/cards/voidborn/cards/terra/terra_card_01_granite_warden.png`

Legacy DB rows may lack the prefix — run on backend (adds `cards.site_id`, fixes paths, backfills `site_members`):

```bash
docker compose exec -T db psql -U postgres < volumes/db/sites-bootstrap.sql
docker compose restart rest functions
```

Re-run is idempotent. If you previously saw `column "site_id" does not exist` on `cards`, sync the latest `sites-bootstrap.sql` first.

**Cards table — realm ids on `location_id`:** `domain` stays `terra`/`aqua`/… (elemental). Realm ids (`kronos`, …) go in `location_id`. Run:

```bash
docker compose exec -T db psql -U postgres < volumes/db/locations-id-migration.sql
docker compose restart rest
```

Then `PROJECT=voidborn npm run upload:site` on the frontend VPS to re-sync card rows from `projects/voidborn/game/cards.json` + `locations.json`.
