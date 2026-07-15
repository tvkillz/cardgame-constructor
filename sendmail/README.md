# VOIDBORN sendmail — HTTP mail relay (VPS)

HTTP mail relay so GoTrue on the API VPS never opens SMTP directly. Runs on **each frontend VPS** (pm2); source is in `sendmail/` — same code, **transport chosen in `.env`** (`smtp` or `brevo`).

**Multi-site:** voidborn VPS → SMTP; komorebi VPS → Brevo API. API edge function `send-email-hook` routes auth mail by site. See [notes/guides/sendmail-multi-site.md](../notes/guides/sendmail-multi-site.md).

**Not a cPanel deploy.** Legacy `CPANEL.md` / `build:cpanel` scripts are historical reference only unless you explicitly use them elsewhere.

## Routes (BASE_PATH empty when nginx strips `/api/sendmail`)

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/health` | — | Service up (+ `transport`) |
| GET | `/smtp-health` | Bearer `MAIL_API_KEY` | Verify SMTP or Brevo |
| POST | `/test` | Bearer | Send test email |
| POST | `/send` | Bearer | Generic HTML email |
| POST | `/invoice` | Bearer | Order invoice — portal HTML + PDF attachment |
| POST | `/hook` | Standard Webhooks signature | **GoTrue send-email hook** |

Public URL examples: `https://voidborn.fun/api/sendmail/...`, `https://komorebi.club/api/sendmail/...`

## Transport modes

| `MAIL_TRANSPORT` | VPS | Outbound |
|------------------|-----|----------|
| `smtp` (default) | voidborn | Mailbox SMTP (465/587) |
| `brevo` | komorebi | Brevo REST API (`BREVO_API_KEY`, port 443) |

```bash
npm run test:smtp    # SMTP mode
npm run test:brevo   # Brevo mode
```

## Quick start (local)

```bash
cd sendmail
cp .env.example .env
# voidborn: MAIL_TRANSPORT=smtp + SMTP_*
# komorebi: MAIL_TRANSPORT=brevo + BREVO_*
npm install
npm run generate-secrets
npm run test:smtp    # or test:brevo
npm run dev
```

Local dev without `BASE_PATH` — routes are `/health`, `/test`, etc.

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

On the **API VPS** `backend/.env` — hook targets the **edge router**, not a single frontend:

```env
GOTRUE_HOOK_SEND_EMAIL_ENABLED=true
GOTRUE_HOOK_SEND_EMAIL_URI=https://api.voidborn.fun/functions/v1/send-email-hook
GOTRUE_HOOK_SEND_EMAIL_SECRETS=v1,whsec_<shared secret>
SEND_EMAIL_HOOK_SECRET=v1,whsec_<same>

SENDMAIL_RELAYS={"voidborn":{"url":"https://voidborn.fun/api/sendmail","apiKey":"..."},"iyashikei":{"url":"https://komorebi.club/api/sendmail","apiKey":"..."}}
```

Each frontend VPS sendmail uses the **same** `SEND_EMAIL_HOOK_SECRET`; `MAIL_API_KEY` may differ per site (stored in `SENDMAIL_RELAYS`).

```bash
cd ~/constructor-files/backend
docker compose up -d auth functions --force-recreate
```

When the hook is enabled, GoTrue **does not** use `SMTP_*` for auth emails.

See `backend/MAIL-SETUP.md` and `notes/guides/sendmail-multi-site.md`.

Set on the relay (frontend VPS pm2):

```env
SITE_URL=https://voidborn.fun
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
{ "recipients": ["you@example.com"], "template": "signup", "site": "iyashikei" }
```

`template` values:

| Value | Sends |
|-------|--------|
| `signup` (default) | Registration / activation preview |
| `recovery` | Password reset preview |
| `invoice` | Invoice email + PDF preview (Test LTD seller data) |

`site` (optional): `voidborn` (default) or `iyashikei` — picks branded auth email template. The live GoTrue hook auto-detects site from `redirect_to`, `user_metadata.site_id`, or `+site` email suffix.

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
