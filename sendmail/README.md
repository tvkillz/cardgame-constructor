# VOIDBORN sendmail — cPanel relay

HTTP mail relay on **voidborn.fun** so GoTrue on the Utah API VPS never opens SMTP port 587/465 to cPanel. The relay sends via local cPanel mail (`mail.voidborn.fun`).

## Routes (BASE_PATH=/api/sendmail)

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/health` | — | Service up |
| GET | `/smtp-health` | Bearer `MAIL_API_KEY` | Verify SMTP login |
| POST | `/test` | Bearer | Send test email |
| POST | `/send` | Bearer | Generic HTML email |
| POST | `/hook` | Standard Webhooks signature | **GoTrue send-email hook** |

Public URL: `https://voidborn.fun/api/sendmail/...`

## Quick start (local)

```bash
cd sendmail
cp .env.example .env
# edit SMTP_* and run:
npm install
npm run generate-secrets    # prints MAIL_API_KEY + SEND_EMAIL_HOOK_SECRET
# paste generated lines into .env

npm run test:smtp           # direct SMTP verify (+ send if SEND_TEST_TO set)
npm run dev                 # PORT=6001, BASE_PATH empty locally
npm run test:api            # hits http://127.0.0.1:6001
```

Local dev without `BASE_PATH` — routes are `/health`, `/test`, etc. On cPanel set `BASE_PATH=/api/sendmail`.

## cPanel deploy

See [CPANEL.md](./CPANEL.md).

```bash
npm run build:cpanel
# upload dist-cpanel/sendmail-cpanel/ → ~/sendmail-cpanel/
# cPanel: Run NPM Install, set env vars, Restart
curl https://voidborn.fun/api/sendmail/health
```

With FTP config:

```bash
cp deploy/cpanel.local.env.example deploy/cpanel.local.env
npm run deploy:cpanel
```

## Wire GoTrue (registration / reset / magic link)

On the **API VPS** `backend/.env` (staging relay today):

```env
GOTRUE_HOOK_SEND_EMAIL_ENABLED=true
GOTRUE_HOOK_SEND_EMAIL_URI=https://staging.voidborn.fun/api/sendmail/hook
GOTRUE_HOOK_SEND_EMAIL_SECRETS=v1,whsec_<same as SEND_EMAIL_HOOK_SECRET>
```

`docker-compose.yml` passes these into the `auth` service. Then on the API VPS:

```bash
cd ~/constructor-files/backend
docker compose up -d auth --force-recreate
```

When the hook is enabled, GoTrue **does not** use `SMTP_*` for auth emails.

See `backend/MAIL-SETUP.md` for the full test flow.

Set on the relay (staging or cPanel):

```env
AUTH_VERIFY_BASE_URL=https://api.voidborn.fun
```

Confirm/reset links in emails use that host (`/auth/v1/verify?...`), not the frontend domain.

## POST /send body

```json
{
  "recipients": ["user@example.com"],
  "cc": ["optional@example.com"],
  "subject": "Subject",
  "body": "<p>HTML</p>",
  "text": "Plain fallback"
}
```

## POST /test body (optional)

```json
{ "recipients": ["you@example.com"] }
```

If omitted, uses `TEST_EMAIL_RECIPIENTS` from env.
