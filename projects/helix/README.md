# Helix

Soft-sci-fi content pack — **HELIX** brand, project id `helix` (same — no alias split).

Staging: `https://helix.voidborn.fun` (HTTP basic auth `dev` / `dev` via nginx staging vhost).

## World

Four lab **domains** aboard the generation ship Spire. Engine categories stay `earth` / `water` / `fire` / `air`; names and art are **not** classical elements (unlike voidborn Kronos/Thalassa/…).

| Domain | Id | Element folder | Category label | Mood |
|--------|-----|----------------|----------------|------|
| Atrium | `atrium` | `hab` | Hab | Hydroponic halls, root-cables, canopy light |
| Reservoir | `reservoir` | `cryo` | Cryo | Frost glass, coolant rivers, cryo vaults |
| Core | `core` | `forge` | Reactor | Reactor rings, plasma conduits, amber instruments |
| Antenna | `antenna` | `relay` | Relay | Observation spines, void dishes, signal mist |

Lore hooks:

- **Static** — noise that corrupts Frames and the Relay Grid
- **Signal** — coherent link operators fight to keep

Stats display as **Signal** / **Integrity** (stored as `attack` / `health`). Rarity tiers: **Chassis**, **Calibrated**, **Prime**, **Singularity**, **Helix**.

## Status

- [x] Copy layer (`copy/*.json`, legal stubs retargeted)
- [x] Game metadata (`domains`, `locations`, `cities`, `scenes` with image prompts)
- [x] Theme tokens (`colors.json`, `ui.json` — Orbitron + Rajdhani; light lab HUD palette)
- [x] Generation specs (`contentgen.json`, `cardgen.json`)
- [x] Registry entry (`stagingDomain`: `helix.voidborn.fun`)
- [x] Sites bootstrap row (`helix` / `HELIX` / `helix.voidborn.fun`)
- [ ] **Landing assets** — run contentgen below (you approve art; agent does not auto-generate)
- [ ] **Brand files** — `header.png`, `gamelogo.png`, `favicon.ico`, `play-lobby.png` (**you** supply logo / header)
- [ ] **Showcase cards** — 12 slugs wired; run cardgen showcase flow below
- [ ] **Frontend theming** — step 3 later (landing / portal / game CSS), not yet

## Cardgen showcase (landing Frames)

12 slugs are wired (3 per domain):

| Domain | Featured (`_01`) | Collection (`_02`, `_03`) |
|--------|------------------|---------------------------|
| Atrium | `atrium_card_01_hab_tender` | `root_cable_walker`, `canopy_drone` |
| Reservoir | `reservoir_card_01_cryo_tender` | `frost_glass_drone`, `coolant_runner` |
| Core | `core_card_01_ring_keeper` | `conduit_frame`, `amber_pilot` |
| Antenna | `antenna_card_01_relay_ghost` | `dish_walker`, `signal_mist_frame` |

```bash
cd cardgen
npm run generate-showcase -- --project=helix --force
# follow printed validate → approve → generate-images → apply
```

Or art-only after `cards.json` has entries + `image_prompt`:

```bash
npm run generate-images-showcase -- --project=helix
```

## Contentgen (landing + domains + cities — no cards)

Prompts live in `game/scenes.json` + `contentgen.json`. Expected outputs:

| Kind | Count | Paths |
|------|-------|--------|
| Domain backgrounds | 4 | `assets/domains/{hab,cryo,forge,relay}_domain.png` |
| City / zone art | 12 | `assets/cities/{hab,cryo,forge,relay}/*.png` |
| Pathway CTA tiles | 6 | `assets/cta1/*.webp` |
| Gamemodel pillars | 3 | `assets/gamemodel/*.webp` |
| Rarity emblems | 3 | `assets/card_types/{uncommon,rare,epic}.webp` |

From `contentgen/`:

```bash
# 1) Build prompt manifest only (safe, no Gemini)
npm run manifest -- --project=helix

# 2) Generate images when you are ready to review
npm run generate-images -- --project=helix

# 3) Copy approved staging files into assets/
npm run apply -- --project=helix
```

Staging WIP lands in `assets/_staging/contentgen/`.

**Logo:** drop your own `assets/brand/header.png` (and preferably `gamelogo.png` / favicon / `play-lobby.png`) — not part of contentgen.

## Cardgen (full catalog rounds — after showcase)

`cardgen.json` is ready (Signal/Integrity, Frame flavor, photoreal prompts).
Use `generate-round` for the larger pool after landing showcase is done.

## Staging HTTP auth + DNS (Frontend VPS — you run)

Registry already sets `stagingDomain` to `helix.voidborn.fun` (basic auth via shared `/etc/nginx/constructor-htpasswd`, default `dev`/`dev`).

```bash
# DNS A record: helix.voidborn.fun → frontend VPS IP
cd /path/to/frontend
npm run deploy:nginx
sudo bash deploy/scripts/setup-vps.sh reload
# issue TLS if needed (certbot) for helix.voidborn.fun
```

## API site row (API VPS — when you enable auth / uploads)

```bash
cd /root/constructor-files/backend   # or your path
docker compose exec -T db psql -U postgres < volumes/db/sites-bootstrap.sql
docker compose restart rest functions
```

Auth emails: `player+helix@example.com` (suffix = site id). No alias SQL needed.

## SEO (sitemap, robots, icons)

Helix uses the same Next.js SEO pipeline as voidborn / komorebi:

| Route | Source |
|-------|--------|
| `/sitemap.xml` | `copy/sitemap.json` → `src/app/sitemap.ts` |
| `/robots.txt` | `copy/sitemap.json` `robots.disallow` → `src/app/robots.ts` |
| `/icon`, `/favicon.ico`, `/favicon.png` | compile → `.build/helix/` |
| `/apple-icon`, `/apple-touch-icon.png` | compile → `apple-touch-icon.png` |
| `/og-image.jpg` | compile from `copy/seo.json` `image` (or brand logo) |

Metadata (title, description, Open Graph, Twitter, Apple touch) comes from `copy/seo.json` + `src/lib/seo/siteMetadata.ts`.

After changing SEO/brand assets:

```bash
cd frontend
PROJECT=helix npm run compile
# then production build + pm2 restart on the frontend VPS
```

Verify locally or on host:

```bash
curl -s https://helix.voidborn.fun/robots.txt
curl -s https://helix.voidborn.fun/sitemap.xml | head -40
curl -sI https://helix.voidborn.fun/apple-touch-icon.png
curl -sI https://helix.voidborn.fun/og-image.jpg
```

When you add a dedicated square `brand/gamelogo.png`, set `manifest.brand.logo` back to it for tighter favicon / apple-touch crops.

## Later (step 3 — not now)

- `sendmail` / `DOMAIN_TO_SITE` brand entry
- Card upload: `PROJECT=helix npm run upload:site`
