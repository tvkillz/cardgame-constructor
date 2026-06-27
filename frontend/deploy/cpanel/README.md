# cPanel shared hosting deploy (no SSH)

Upload-ready Node.js app for **Setup Node.js App** in cPanel. No pm2 — `server.js` is the startup file.

## 1. Build locally

From `frontend/` on your machine (needs Node 20+):

```bash
npm install
cp deploy/env.production.example .env.production   # first time
PROJECT=voidborn npm run build:cpanel
```

Output:

- `frontend/dist-cpanel/voidborn-cpanel/` — full folder (`server.js`, `package.json`, `_next-server.js`, `.build/`)
- `frontend/dist-cpanel/voidborn-cpanel-build.zip` — **only `.build/`** (extract into app root)

Landing showcase webp: `.build/voidborn/data/card-thumbs/` + `card-full/` (12 cards).

## 2. Create the app folder in cPanel File Manager

Create `voidborn-cpanel` (or `voidborn-app`) in your home directory — not inside `public_html`.

## 3. Upload files

**Step 1 — app entry files** (upload via File Manager, no zip)

From `dist-cpanel/voidborn-cpanel/` upload into your app root (`voidborn-cpanel/` or `voidborn-app/`):

- `server.js`
- `package.json`
- `_next-server.js`

**Step 2 — `.build` zip**

1. Upload `voidborn-cpanel-build.zip` into the **same app root**
2. Extract — you should get `.build/voidborn/...` (not nested twice)
3. Confirm `.build/voidborn/.next/BUILD_ID` and `.build/voidborn/data/card-thumbs/` exist

**FTP alternative** — upload the whole `voidborn-cpanel/` folder without zips.

Disable zip: `CPANEL_NO_ZIP=1 PROJECT=voidborn npm run build:cpanel`

Final layout:

```
/home/voidborn/voidborn-app/
  server.js
  package.json
  _next-server.js
  .build/voidborn/
    .next/
    data/card-thumbs/    ← 12 showcase thumbs
    data/card-full/      ← 12 showcase full art
    assets/
    play/
    generated/
```

There is no `node_modules/` yet — install on the server (step 6).

## 4. Create the Node.js application

**Setup Node.js App → CREATE APPLICATION**

| Field | Value |
|-------|--------|
| Node.js version | **20.x** |
| Application mode | **Production** |
| Application root | `voidborn-app` |
| Application URL | `voidborn.fun` |
| Application startup file | `server.js` |

## 5. Environment variables

| Name | Value |
|------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Platform API URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable key |
| `PROJECT` | `voidborn` (optional) |

## 6. Install dependencies and start

1. **CREATE** / **SAVE**
2. **Run NPM Install**
3. **Restart**

## 7. Verify

- `/` — landing (4 hero + 8 collection cards with local webp)
- `/play` — game
- `/portal` — cards from API / Storage

## What's omitted from the upload

- `node_modules/` — **Run NPM Install** on cPanel
- `assets/cards/` — source PNGs (not needed on server)
- Full catalog card art — Supabase Storage only

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Zip blocked as virus | Don’t use zip — FTP upload the folder |
| 503 | Check `.build/voidborn/.next/BUILD_ID`; restart app |
| `Cannot find module` | Run **NPM Install** |
| Missing landing cards | Rebuild locally; confirm `data/card-thumbs/` uploaded |
| Missing portal cards | Supabase Storage / API — not the landing webp set |
