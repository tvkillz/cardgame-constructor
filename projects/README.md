# Content packs (multi-site)

Each subdirectory is one frontend site (`voidborn`, `project2`, …). The global list lives in `registry.json`.

## Per-site layout

```
projects/{id}/
  manifest.json          # siteUrl, brand, routes
  theme/                 # colors, ui
  copy/                  # descriptions, seo, dominions
  portal/                # portal sections
  game/
    domains.json         # elemental domains (terra, aqua, ignis, zephyr)
    locations.json       # **source of truth** for realm ids/names (kronos, thalassa, …)
    featured-cards.json  # deprecated mirror; compile uses locations.json featuredCardSlug
    keywords.json        # keyword glossary (split metadata)
    scenes.json          # domain + city background assets
    cards.json           # card stats, abilities, art paths
  assets/                # binary files referenced by scenes/cards/manifest
  assets_metadata.json   # legacy monolith (optional after split)
```

**Preferred metadata:** split files under `game/` (`keywords.json`, `scenes.json`, `cards.json`). The compiler merges them automatically. Legacy `assets_metadata.json` still works.

**SEO:** `copy/seo.json` — page title, meta description, Open Graph / Twitter fields. Optional `image` path (e.g. `brand/og-image.jpg`); otherwise compile generates `og-image.jpg` from `manifest.brand.logo`. Favicon and apple-touch icon are also generated from the logo at compile time.

**Dominions (landing):** `copy/dominions.json` — section title + lead. Cards use `game/locations.json`, `game/scenes.json` (art paths), and **`game/cities.json`** (city name + description per slide). Glow colors from `game/domains.json`.

Location **lore and wiring** stay in `game/locations.json`. `scenes.json` only lists background image paths for domains and cities.

### Realm ids vs domain ids (voidborn)

| Domain (cards) | Realm location id | Display name |
|----------------|-------------------|--------------|
| `terra` | `kronos` | Kronos |
| `aqua` | `thalassa` | Thalassa |
| `ignis` | `infernus` | Infernus |
| `zephyr` | `anemos` | Anemos |

Never use domain ids (`terra`, `aqua`, …) as realm **location** ids in Postgres or featured mappings. Each row in `locations.json` needs `id`, `name`, `domainId`, and `featuredCardSlug`.

**`cards` table:** `domain` = elemental type (`terra`, `aqua`, …) for mechanics and art paths. `location_id` = realm id (`kronos`, `thalassa`, …) from `locations.json` via `domainId`. Run `backend/volumes/db/locations-id-migration.sql` on existing DBs, then `PROJECT=voidborn npm run upload:site` to refresh rows from projects.

## Site management scripts

Run from repo root or via `npm run` from `frontend/`:

| Command | Purpose |
|---------|---------|
| `npm run site:list` | List sites, URLs, pm2 ports, metadata source |
| `npm run site:url -- --project=voidborn --url=https://new.domain.com` | Change public URL |
| `npm run site:url -- --project=voidborn --url=... --nginx` | Change URL + regenerate nginx config |
| `npm run site:add -- --id=site3 --url=https://site3.com` | Scaffold new site from `project2` |
| `npm run site:sync` | Print backend redirect URLs + `sites.sql` insert hints |

Direct:

```bash
node projects/scripts/site-list.mjs
node projects/scripts/site-url.mjs --project=project2 --url=https://demo.example.com
node projects/scripts/site-add.mjs --id=site3 --url=https://site3.com --from=voidborn
node projects/scripts/site-sync-hints.mjs
```

## Compile & upload (per site)

From `frontend/`:

```bash
npm run metadata:split              # assets_metadata.json → game/*.json (all sites)
PROJECT=voidborn npm run compile    # build .build/voidborn/
npm run compile:all                 # all registry sites
npm run upload:site                 # upload cards for PROJECT (default voidborn)
PROJECT=project2 npm run upload:site
npm run upload:all                  # upload every site
```

Card art uploads to Supabase storage under **`{siteId}/cards/...`** and **`{siteId}/thumbs/...`** so sites never overwrite each other's files.

**New backend server:** storage is empty until you run `npm run upload:all` — see `notes/storage-upload.md`.

**Auth emails** use plus-addressing: `user+voidborn@domain` (not `::`). Rebuild all pm2 sites after changing auth code.

Requires admin API creds: `frontend/.env.admin` on the frontend VPS (copy from `backend/.env` `SERVICE_ROLE_KEY`), or `backend/.env` when mounted locally. See `frontend/.env.admin.example`.

## Adding a site (checklist)

1. `npm run site:add -- --id=newsie --url=https://newsie.example.com`
2. Edit `projects/newsie/` content
3. `npm run compile:all && PROJECT=newsie npm run build`
4. `pm2 start frontend/ecosystem.config.cjs --only newsie-prod`
5. `npm run deploy:nginx` → reload nginx on frontend VPS
6. `npm run site:sync` → update `backend/.env` redirects + `sites.sql`
7. `PROJECT=newsie npm run upload:site` → card images to storage
