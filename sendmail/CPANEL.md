# cPanel Node.js — sendmail at voidborn.fun/api/sendmail

## 1. Build & upload

```bash
cd sendmail
npm run build:cpanel
```

Upload `dist-cpanel/sendmail-cpanel/` to the account home, e.g. `/home/voidborn/sendmail-cpanel/`.

Or with rclone (reuse frontend FTP creds):

```bash
cp deploy/cpanel.local.env.example deploy/cpanel.local.env
npm run deploy:cpanel
```

## 2. Create Node.js application

cPanel → **Setup Node.js App**:

| Field | Value |
|-------|--------|
| Node version | 20+ |
| Application mode | Production |
| Application root | `sendmail-cpanel` |
| Application URL | `api/sendmail` |
| Application startup file | `server.js` |

Click **Create**.

## 3. Environment variables

Paste from `.env.example` (use values from `npm run generate-secrets`):

| Variable | Example |
|----------|---------|
| `BASE_PATH` | `/api/sendmail` |
| `SMTP_HOST` | `mail.voidborn.fun` |
| `SMTP_PORT` | `465` |
| `SMTP_USER` | `no-reply@voidborn.fun` |
| `SMTP_PASS` | mailbox password |
| `SMTP_ADMIN_EMAIL` | `no-reply@voidborn.fun` |
| `SMTP_FROM_NAME` | `VOIDBORN` |
| `MAIL_API_KEY` | from `generate-secrets` |
| `SEND_EMAIL_HOOK_SECRET` | from `generate-secrets` |
| `AUTH_VERIFY_BASE_URL` | `https://api.voidborn.fun` |
| `TEST_EMAIL_RECIPIENTS` | `andrewmalewski@gmail.com,tocytrus@inbox.lv` |

**Run NPM Install** → **Restart**.

## 4. Verify

```bash
curl -s https://voidborn.fun/api/sendmail/health
curl -s -H "Authorization: Bearer YOUR_MAIL_API_KEY" \
  https://voidborn.fun/api/sendmail/smtp-health

curl -s -X POST -H "Authorization: Bearer YOUR_MAIL_API_KEY" \
  -H "Content-Type: application/json" \
  https://voidborn.fun/api/sendmail/test \
  -d '{}'
```

From your PC (after deploy):

```bash
SENDMAIL_URL=https://voidborn.fun/api/sendmail MAIL_API_KEY=... npm run test:api
```

## 5. Enable GoTrue hook (API VPS)

```env
GOTRUE_HOOK_SEND_EMAIL_ENABLED=true
GOTRUE_HOOK_SEND_EMAIL_URI=https://voidborn.fun/api/sendmail/hook
GOTRUE_HOOK_SEND_EMAIL_SECRETS=<same as SEND_EMAIL_HOOK_SECRET>
```

```bash
docker compose up -d auth --force-recreate
```

## Troubleshooting

| Issue | Fix |
|-------|-----|
| 404 on `/api/sendmail/health` | Check Application URL; try `BASE_PATH=/api/sendmail` **or** empty `BASE_PATH` if cPanel strips the prefix (hit `/health` externally at the same URL) |
| 401 on `/test` | `MAIL_API_KEY` mismatch |
| 401 on `/hook` | `SEND_EMAIL_HOOK_SECRET` must match `GOTRUE_HOOK_SEND_EMAIL_SECRETS` |
| SMTP verify fails | Wrong password; try port `587` with `requireTLS` (app handles both) |
| GoTrue still times out | Hook not enabled or wrong URI; check `docker compose logs auth` |

## Apache note

cPanel Node.js Selector usually proxies `api/sendmail` to your app. If you use manual `.htaccess` instead, proxy to the Passenger/socket port cPanel assigns — prefer the built-in Node app UI.
