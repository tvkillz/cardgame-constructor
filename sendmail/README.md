# VOIDBORN sendmail — HTTP mail relay (VPS)

HTTP mail relay so GoTrue on the API VPS never opens SMTP directly. Runs on the **frontend VPS** (pm2); source is in `sendmail/` and is rclone-mounted in this repo via `mount-voidborn.sh`.

**Not a cPanel deploy.** Legacy `CPANEL.md` / `build:cpanel` scripts are historical reference only unless you explicitly use them elsewhere.

## Routes (BASE_PATH=/api/sendmail)

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/health` | — | Service up |
| GET | `/smtp-health` | Bearer `MAIL_API_KEY` | Verify SMTP login |
| POST | `/test` | Bearer | Send test email |
| POST | `/send` | Bearer | Generic HTML email |
| POST | `/invoice` | Bearer | Order invoice — portal HTML + PDF attachment |
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
{ "recipients": ["you@example.com"], "template": "signup" }
```

`template` values:

| Value | Sends |
|-------|--------|
| `signup` (default) | Registration / activation preview |
| `recovery` | Password reset preview |
| `invoice` | Invoice email + PDF preview (Test LTD seller data) |

## POST /invoice body

Called by the commerce edge function after a successful payment. See `frontend/src/lib/commerce/INVOICE.md`.

```json
{
  "recipient": "player@example.com",
  "paymentMethod": "Test payment",
  "order": { "id": "uuid", "paidAt": "ISO", "totalCents": 1000, "currency": "eur" },
  "lineItems": [{ "title": "VOIDBORN Credits", "quantity": 1000, "unitPriceCents": 1000 }],
  "buyer": { "firstName": "Ada", "lastName": "Lovelace", "city": "London", "postalCode": "SW1A 1AA", "country": "UK" },
  "seller": { "companyName": "Test LTD", "companyNumber": "00000000", "address": "...", "email": "support@voidborn.fun" }
}
```

If `recipients` is omitted on `/test`, uses `TEST_EMAIL_RECIPIENTS` from env.
