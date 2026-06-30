# Auth email — sendmail hook + registration confirmation

Confirmation, password reset, and magic-link emails are sent by the **send-email hook** → HTTP relay on staging (`sendmail/`), not direct GoTrue SMTP from the API VPS.

## Current setup (staging relay)

| Component | Value |
|-----------|--------|
| Relay | `https://staging.voidborn.fun/api/sendmail` |
| GoTrue hook | `POST …/hook` (Standard Webhooks) |
| SMTP | sendmail → `mail.voidborn.fun:465` (from staging VPS) |
| Verify links | `https://api.voidborn.fun/auth/v1/verify?...` |
| After confirm | `https://staging.voidborn.fun/auth/callback` (staging deploy) or `voidborn.fun` (production) |

## Required `backend/.env`

```env
ENABLE_EMAIL_SIGNUP=true
ENABLE_EMAIL_AUTOCONFIRM=false
GOTRUE_MAILER_EMAIL_BACKGROUND_SENDING=true

GOTRUE_HOOK_SEND_EMAIL_ENABLED=true
GOTRUE_HOOK_SEND_EMAIL_URI=https://staging.voidborn.fun/api/sendmail/hook
GOTRUE_HOOK_SEND_EMAIL_SECRETS=v1,whsec_...   # same as sendmail SEND_EMAIL_HOOK_SECRET
```

`SMTP_*` vars remain in `.env` for reference but are **not used** for auth mail while the hook is enabled.

Redirects (already configured):

- `SITE_URL=https://voidborn.fun`
- `ADDITIONAL_REDIRECT_URLS` includes `https://staging.voidborn.fun/**` and `https://voidborn.fun/**`

## Deploy on API VPS (Utah)

After syncing `backend/.env` and `docker-compose.yml` (including `PROXY_DOMAIN=api.voidborn.fun`):

```bash
cd ~/constructor-files/backend
docker compose up -d nginx kong auth --force-recreate
docker compose logs nginx --tail 80
```

If HTTPS fails for `api.voidborn.fun`, expand the cert inside the nginx container — see `backend/API-DOMAIN.md`.

```bash
docker compose logs auth --tail 80
```

Also recreate **kong** if CORS origins changed: `docker compose up -d kong --force-recreate`

## Staging sendmail VPS

Relay must be running (`pm2 voidborn-sendmail`), nginx `location /api/sendmail/` with `auth_basic off`, and `BASE_PATH` **empty** when nginx strips the path prefix.

Verify:

```bash
curl -s https://staging.voidborn.fun/api/sendmail/health
```

Sync `sendmail/` after code changes and `pm2 restart voidborn-sendmail`.

## Test registration flow

1. Open **https://staging.voidborn.fun** (basic auth `dev`/`dev`).
2. Register a **new** email (not an already-confirmed account).
3. UI should show “check your email” (no session until confirmed).
4. Click link in email → `/auth/callback` → signed in.
5. `pm2 logs voidborn-sendmail` should show hook handling; `docker compose logs auth` should not show SMTP timeout.

Password reset uses the same hook (`email_action_type: recovery`).

## Checkout invoice email (admin test payment)

After **Payment success (test)** on checkout, the `commerce` edge function calls sendmail `POST /invoice` (portal HTML + PDF).

Add to **`backend/.env`** (injected into the `functions` service via `docker-compose.yml`):

```env
# Public URL of sendmail on the frontend VPS (no trailing slash)
SENDMAIL_URL=https://staging.voidborn.fun/api/sendmail
MAIL_API_KEY=<same as sendmail MAIL_API_KEY>

INVOICE_COMPANY_NAME=Test LTD
INVOICE_COMPANY_NUMBER=00000000
INVOICE_COMPANY_ADDRESS=123 Example Street, Testville, TE1 1ST, United Kingdom
INVOICE_COMPANY_EMAIL=support@voidborn.fun
```

On the **API VPS**, after syncing `backend/`:

```bash
cd ~/constructor-files/backend
docker compose up -d functions --force-recreate
docker compose logs functions --tail 50
```

On the **frontend VPS**, ensure sendmail has `pdfkit` installed (`npm install` in `sendmail/`) and is running.

**Demo flow:** sign in as admin → checkout → fill required billing fields → **Payment success (test)** → success page + invoice in the account email.

Preview invoice without checkout:

```bash
curl -X POST "$SENDMAIL_URL/test" \
  -H "Authorization: Bearer $MAIL_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"template":"invoice"}'
```

## Production (later)

When cPanel limits allow, deploy `sendmail/` to `https://voidborn.fun/api/sendmail` and update:

```env
GOTRUE_HOOK_SEND_EMAIL_URI=https://voidborn.fun/api/sendmail/hook
```

Recreate auth on the API VPS.

## Troubleshooting

| Issue | Fix |
|-------|-----|
| No email | `pm2 logs voidborn-sendmail`; `docker compose logs auth` |
| Hook 401 | `GOTRUE_HOOK_SEND_EMAIL_SECRETS` must match sendmail `SEND_EMAIL_HOOK_SECRET` exactly |
| CORS + slow signup | `GOTRUE_MAILER_EMAIL_BACKGROUND_SENDING=true`; recreate kong + auth |
| Redirect blocked | Add site URL to `ADDITIONAL_REDIRECT_URLS` |
| Instant login after register | `ENABLE_EMAIL_AUTOCONFIRM` still `true` |
| `Cannot GET /health` on relay | `BASE_PATH` / nginx prefix mismatch — see `sendmail/CPANEL.md` |

## cPanel DNS

Enable **SPF** and **DKIM** for `voidborn.fun` to reduce spam folder delivery.
