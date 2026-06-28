# cPanel static deploy (public_html)

Production static export for **voidborn.fun** — no Node.js app on cPanel.

## Build

```bash
cd frontend
cp deploy/env.production.example .env.production   # first time
PROJECT=voidborn npm run build:cpanel-static
```

Output: `dist-cpanel-static/voidborn-static/` — upload this folder's **contents** to `public_html`.

Includes `.htaccess` for `/play/` SPA routing.

## Deploy

```bash
PROJECT=voidborn npm run deploy:cpanel-static
```

Uses `deploy/cpanel.local.env`. With `sync@` jailed to `public_html`, set `CPANEL_STATIC_FTP_REMOTE_DIR=.` (account root = docroot).

| Command | What |
|---------|------|
| `npm run build:cpanel-static` | Build only |
| `npm run upload:cpanel-static` | FTP sync existing build |
| `npm run deploy:cpanel-static` | Build + FTP sync |
| `npm run upload:cpanel-static -- --dry-run` | Preview changes |

## vs Node deploy (`deploy:cpanel`)

| | Static (`deploy:cpanel-static`) | Node (`deploy:cpanel`) |
|---|---|---|
| Server | Apache only | cPanel Node.js app |
| Upload target | `public_html` | `voidborn-cpanel/` |
| After deploy | Nothing | Restart (+ NPM Install if deps changed) |
| Env vars | Baked at build time | `NEXT_PUBLIC_*` in cPanel panel |

Staging stays on the VPS (`staging.voidborn.fun`) with pm2/nginx.

## Upload layout on server

```
public_html/
  index.html
  portal/market/index.html
  auth/callback/index.html
  _next/static/...
  assets/
  data/
  play/
    index.html
    assets/
  .htaccess
```

## Troubleshooting

| Issue | Fix |
|-------|-----|
| 404 on `/portal/market` | Ensure `trailingSlash` export uploaded; paths end with `/` or use `index.html` folders |
| `/play` black screen | Check `play/index.html` and `play/assets/` uploaded; verify `.htaccess` present |
| Landing cards black | Ensure `data/card-thumbs/` uploaded |
| 553 Can't open that file | `CPANEL_STATIC_FTP_REMOTE_DIR` wrong — use `.` when FTP account root is `public_html` |
