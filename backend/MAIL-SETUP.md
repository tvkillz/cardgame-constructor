# Auth email — sendmail hook + registration confirmation

Confirmation, password reset, and magic-link emails are sent by the **send-email hook** → per-site HTTP relay on frontend VPS hosts (`sendmail/`), not direct GoTrue SMTP from the API VPS.

**Multi-site routing:** GoTrue calls one edge function; it forwards to voidborn (SMTP) or komorebi (Brevo) by site id. See [notes/guides/sendmail-multi-site.md](../notes/guides/sendmail-multi-site.md).

## Current setup (production relay)

| Component | Value |
|-----------|--------|
| GoTrue hook | `POST …/functions/v1/send-email-hook` (edge router) |
| Central relay (recommended) | `https://voidborn.fun/api/sendmail` — one pm2 sendmail, per-site SMTP in `.env` |
| Legacy per-site relays | Separate URLs per domain (optional) |
| Verify links | `https://api.voidborn.fun/auth/v1/verify?...` |
| After confirm | `{site}/auth/callback` (e.g. `https://komorebi.club/auth/callback`) |

## Required `backend/.env`

```env
ENABLE_EMAIL_SIGNUP=true
ENABLE_EMAIL_AUTOCONFIRM=false
GOTRUE_MAILER_EMAIL_BACKGROUND_SENDING=true

GOTRUE_HOOK_SEND_EMAIL_ENABLED=true
GOTRUE_HOOK_SEND_EMAIL_URI=https://api.voidborn.fun/functions/v1/send-email-hook
GOTRUE_HOOK_SEND_EMAIL_SECRETS=v1,whsec_...
SEND_EMAIL_HOOK_SECRET=v1,whsec_...   # same value — used by edge router + every sendmail instance

# Centralized relay — both sites hit the same sendmail endpoint
SENDMAIL_RELAYS={"voidborn":{"url":"https://voidborn.fun/api/sendmail","apiKey":"..."},"iyashikei":{"url":"https://voidborn.fun/api/sendmail","apiKey":"..."}}
SENDMAIL_URL=https://voidborn.fun/api/sendmail
```

Use the **same** `url` and `apiKey` for both entries when one sendmail instance handles all sites.
`SENDMAIL_URL` is legacy fallback; keep it set to the same common endpoint.

Legacy single-relay fallback (voidborn only):

```env
SENDMAIL_URL=https://voidborn.fun/api/sendmail
MAIL_API_KEY=<same as sendmail MAIL_API_KEY>
```

`SMTP_*` vars remain in `.env` for reference but are **not used** for auth mail while the hook is enabled.

Redirects:

- `SITE_URL=https://voidborn.fun`
- `ADDITIONAL_REDIRECT_URLS` includes every frontend domain (`https://komorebi.club/**`, …)

## Deploy on API VPS

After syncing `backend/.env` and `docker-compose.yml`:

```bash
cd ~/constructor-files/backend
docker compose up -d nginx kong auth functions --force-recreate
docker compose logs auth --tail 80
docker compose logs functions --tail 80
```

## Frontend VPS (sendmail)

Same `sendmail/` code on each VPS; `.env` selects transport.

**voidborn VPS** — `MAIL_TRANSPORT=smtp`, pm2 `voidborn-sendmail`, nginx `/api/sendmail/` → `:6001`.

**Centralized (recommended):** one sendmail on voidborn VPS with `SMTP_*` (voidborn) + `SMTP_IYASHIKEI_*` (komorebi).

Shared on the relay:

```env
SEND_EMAIL_HOOK_SECRET=v1,whsec_<same as API VPS>
AUTH_VERIFY_BASE_URL=https://api.voidborn.fun
BASE_PATH=
```

Per VPS:

```env
SITE_URL=https://voidborn.fun   # or https://komorebi.club
MAIL_API_KEY=<matches SENDMAIL_RELAYS entry for that site>
```

Verify:

```bash
curl -s https://voidborn.fun/api/sendmail/health
curl -s https://komorebi.club/api/sendmail/health
```

Sync `sendmail/` after code changes and `pm2 restart …-sendmail --update-env` on each host.

## Test registration flow

1. Open **https://komorebi.club** (or voidborn.fun)
2. Register a **new** email (not an already-confirmed account).
3. UI should show “check your email” (no session until confirmed).
4. Click link in email → `/auth/callback` → signed in.
5. `pm2 logs komorebi-sendmail` (or voidborn) should show hook handling.

Password reset uses the same hook (`email_action_type: recovery`).

## Checkout invoice email (admin test payment)

Commerce uses `SENDMAIL_RELAYS` to pick the relay by order site id.

Add to **`backend/.env`** (injected into the `functions` service):

```env
SENDMAIL_RELAYS={"voidborn":{...},"iyashikei":{...}}
SENDMAIL_URL=https://voidborn.fun/api/sendmail

# voidborn seller (default)
INVOICE_COMPANY_NAME=Baltius, UAB
INVOICE_COMPANY_NUMBER=307485071
INVOICE_COMPANY_ADDRESS=Klaipėdos g. 4A, Jokūbavo k., LT-97210 Kretingos r., LITHUANIA
INVOICE_COMPANY_EMAIL=support@voidborn.fun

# iyashikei / komorebi seller override
INVOICE_COMPANY_IYASHIKEI_NAME=Test LTD
INVOICE_COMPANY_IYASHIKEI_NUMBER=00000000
INVOICE_COMPANY_IYASHIKEI_ADDRESS=123 Example Street, Testville, TE1 1ST, United Kingdom
INVOICE_COMPANY_IYASHIKEI_EMAIL=support@komorebi.example.com
```

Commerce picks seller block by order `site_id` (`voidborn` vs `iyashikei`).

**Demo flow:** sign in as admin → checkout → **Payment success (test)** → invoice email via the site’s relay.

Preview invoice without checkout:

```bash
curl -X POST "https://komorebi.club/api/sendmail/test" \
  -H "Authorization: Bearer $MAIL_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"template":"invoice","site":"iyashikei"}'
```

## Troubleshooting

| Issue | Fix |
|-------|-----|
| No email | `pm2 logs …-sendmail`; `docker compose logs functions` (router) |
| Hook 401 | `GOTRUE_HOOK_SEND_EMAIL_SECRETS` / `SEND_EMAIL_HOOK_SECRET` must match every relay |
| Wrong brand / relay | Check `redirect_to`, `+komorebi@` suffix, `SENDMAIL_RELAYS` keys |
| CORS + slow signup | `GOTRUE_MAILER_EMAIL_BACKGROUND_SENDING=true`; recreate kong + auth |
| Brevo 401 | `BREVO_API_KEY` + verified sender domain on komorebi VPS |
| `Cannot GET /health` on relay | `BASE_PATH` / nginx prefix mismatch — see `sendmail/README.md` |

## DNS

Enable **SPF** and **DKIM** for each sending domain (`voidborn.fun`, `komorebi.club`).
