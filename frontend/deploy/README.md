# Frontend VPS deploy

nginx runs as a **systemd service** (`systemctl enable nginx`). This folder generates config from `projects/registry.json` and each site's `manifest.json` `siteUrl`.

## Architecture

```
Browser → https://voidborn.fun     ─nginx:443─→ pm2 voidborn-prod  :3100
Browser → https://project2.example ─nginx:443─→ pm2 project2-prod  :3101

Browser → https://api.your-platform.com  (Supabase/Kong on backend VPS — typically https://voidborn.fun)
```

Frontend nginx only proxies to local pm2 ports. **CORS is configured on the backend**, not here. After `generate-nginx.mjs`, see `deploy/output/cors-origins.txt` for the origin list to allow.

## Fresh VPS setup

```bash
# 1. Clone repo, install deps, build sites
cd frontend
npm install
npm run compile:all
cp deploy/env.production.example .env.production
# edit .env.production — NEXT_PUBLIC_SUPABASE_URL must be the platform API (e.g. https://voidborn.fun), not the frontend domain

PROJECT=voidborn npm run build
PROJECT=project2 npm run build

# 2. pm2 prod apps (bind localhost only — nginx is public)
pm2 start ecosystem.config.cjs --only voidborn-prod,project2-prod
pm2 save && pm2 startup

# 3. nginx + HTTP (as root)
sudo bash deploy/scripts/setup-vps.sh install
sudo bash deploy/scripts/setup-vps.sh configure

# 4. DNS: A record each site domain → VPS IP

# 5. TLS
sudo CERTBOT_EMAIL=you@example.com bash deploy/scripts/setup-vps.sh ssl
```

## Regenerate after adding a site

1. `npm run site:add -- --id=newsite --url=https://newsite.example.com` (or edit `registry.json` + manifest manually)
2. `npm run compile:all` + `PROJECT=newsite npm run build`
3. `pm2 start ecosystem.config.cjs --only newsite-prod`
4. `sudo bash deploy/scripts/setup-vps.sh reload`
5. `sudo CERTBOT_EMAIL=… bash deploy/scripts/setup-vps.sh ssl` (adds cert for new domain)
6. `npm run site:sync` — update backend redirects + `sites.sql`

See `projects/README.md` for site URL changes, metadata split, and per-site card uploads.

## Manual / preview

```bash
node deploy/scripts/generate-nginx.mjs              # writes deploy/output/frontend-sites.conf
node deploy/scripts/generate-nginx.mjs --http-only  # before certs exist
node deploy/scripts/generate-nginx.mjs --cors-origins # only cors-origins.txt
```

Port formula: prod `3100 + registry index` (override with `PM2_PROD_PORT_BASE`).

Optional registry override:

```json
{ "id": "voidborn", "domain": "voidborn.fun", "path": "./voidborn" }
```

## Backend URL

All sites share one API URL in `.env.production`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://voidborn.fun
```

Per-site public URL stays in each content pack's `manifest.json` `siteUrl`. Site identity for auth/API is compiled as `siteId` in the bundle.

## Card catalog (not deployed)

`deploy-from-local.sh` does **not** sync card catalog assets to the frontend VPS:

- `assets/cards/`
- `data/card-thumbs/`, `data/card-full/`
- `data/cards-catalog.json`, `data/landing-cards.json`

Portal and play load card art from **Supabase Storage** via the API (`cards` table). Seed/upload cards separately (`npm run seed:cards:upload`, `compile:upload`, etc.) on the backend host.

Landing showcase cards in the JS bundle may still reference `/data/card-*` paths from a local compile; run `npm run compile:upload` before deploy if the homepage needs storage URLs baked in.
