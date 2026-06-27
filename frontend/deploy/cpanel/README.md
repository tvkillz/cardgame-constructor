# cPanel production deploy (FTP via rclone)

Production for **voidborn.fun** lives on cPanel (no SSH). Staging is on the VPS at **staging.voidborn.fun**.

## One-time setup

### 1. FTP account (cPanel)

Create an FTP account jailed to `voidborn-cpanel/` (you did: `sync@voidborn.fun`).

### 2. Local config

```bash
cp deploy/cpanel.local.env.example deploy/cpanel.local.env
# edit deploy/cpanel.local.env — FTP host, user, password
```

`cpanel.local.env` is gitignored.

### 3. rclone

Install rclone on your PC (`apt install rclone` / brew). No remote config file needed — the upload script passes FTP flags inline.

### 4. cPanel Node.js app

Application root: `voidborn-cpanel`, startup: `server.js`, Node 20, env vars (`NEXT_PUBLIC_SUPABASE_URL`, etc.).

## Deploy production (after staging approved)

```bash
cd frontend
cp deploy/env.production.example .env.production   # first time
PROJECT=voidborn npm run deploy:cpanel
```

This runs `build:cpanel` then **rclone sync** to FTP.

- Uploads `dist-cpanel/voidborn-cpanel/` (no `node_modules`)
- Creates `voidborn-cpanel-build.zip` (`.build` only, optional manual extract)
- Prints **Run NPM Install** if `package.json` dependencies changed

Then on cPanel: **Restart** (and **Run NPM Install** if prompted).

### Commands

| Command | What |
|---------|------|
| `npm run build:cpanel` | Build only |
| `npm run upload:cpanel` | FTP sync existing build |
| `npm run deploy:cpanel` | Build + FTP sync |
| `npm run upload:cpanel -- --dry-run` | Preview changes |

## Staging → production workflow

```
1. bash deploy/scripts/deploy-from-local.sh --site voidborn
   → https://staging.voidborn.fun (VPS, basic auth)

2. QA / approve

3. PROJECT=voidborn npm run deploy:cpanel
   → https://voidborn.fun (cPanel)
```

## Upload layout on server

```
/home/voidborn/voidborn-cpanel/
  server.js
  package.json
  _next-server.js
  .build/voidborn/
    .next/
    data/card-thumbs/
    data/card-full/
    assets/
    play/
    generated/
```

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `rclone: command not found` | Install rclone |
| FTP login failed | Check host (may be server hostname, not domain), user, FTPS toggle |
| Zip blocked by AV | Use `deploy:cpanel` FTP sync instead |
| Landing cards black | Full `.build` uploaded; paths under `data/card-thumbs/` |
| `Cannot find module` | Run NPM Install on cPanel |
