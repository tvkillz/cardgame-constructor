# Universal site constructor

Content packs live in `projects/`; the Next.js engine lives in `frontend/`.

Binary assets (domains, cities, cards, brand) belong in **`projects/{id}/assets/`** — not in `frontend/src` or `frontend/public` (those are compile outputs).

## Quick start

```bash
cd frontend
npm install
PROJECT=voidborn npm run compile
npm run dev:host                    # single site
# or multi-site pm2:
pm2 start ecosystem.config.cjs --only voidborn-dev
```

Production (per site):

```bash
PROJECT=voidborn npm run build
pm2 start ecosystem.config.cjs --only voidborn-prod
```

**Multi-site:** see [frontend/VERIFICATION.md](frontend/VERIFICATION.md). Demo second site: `project2` (ports 3001 / 3101).

**Production VPS:** [frontend/deploy/README.md](frontend/deploy/README.md) — nginx, TLS, backend API URL.

## Add a new game/site

1. Copy `projects/voidborn/` → `projects/your-game/`
2. Edit JSON files (manifest, theme, copy, game data)
3. Add assets under `projects/your-game/assets/` or `cursor_assets/your-game/`
4. Register in `projects/registry.json`
5. Build with `PROJECT=your-game npm run compile`

## Architecture

```
projects/{id}/          ← source of truth (outside src/public)
  manifest.json
  theme/
  copy/
  game/
  assets_metadata.json
  assets/

frontend/
  scripts/compile-project.mjs   ← compiler
  src/generated/                ← compiled bundle (gitignored, run compile)
  public/assets/                ← copied binaries at compile time
  public/data/                  ← card catalogs at compile time
```

See `projects/voidborn/README.md` for content pack layout.
