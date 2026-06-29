# Voidborn content pack

External data for the universal site engine. Edit files here — not `frontend/src`.

## Layout

- `manifest.json` — project id, site URL, routes, brand asset paths
- `theme/` — colors, fonts, navigation, play modes
- `copy/` — all UI strings
- `portal/` — portal section definitions
- `game/` — domains, locations, categories, featured cards
- `assets_metadata.json` — card stats, keywords, asset index
- `assets/` — **binary source of truth** (domains, cities, cards, brand)

```
assets/
  domains/
  cities/
  cards/
  brand/          gamelogo.png, header.png, favicon.svg, main.mp4 (favicon png + og-image from gamelogo at compile)
  _variants/      optional alternates
```

## Compile

From `frontend/`:

```bash
npm run compile              # one-shot
npm run compile:watch        # watch projects/ (auto in npm run dev)
npm run compile:upload       # + Supabase Storage + Postgres
PROJECT=other-game npm run compile
```

Outputs (per project): `frontend/.build/{PROJECT}/`

- `generated/` — project-bundle.json, game-config.json
- `assets/` — domains, cities, cards, brand (served via Next rewrites)
- `data/` — cards-catalog.json, landing-cards.json
- `.next/` — Next cache (dev/prod)
- `play/` — Vite hybrid bundle (prod)

Multi-site pm2: see `frontend/VERIFICATION.md`
