# API domain — api.voidborn.fun

Primary API host for voidborn. `sportsydeals.com` remains as `PROXY_DOMAIN_EXTRA` for project2 until migrated.

## DNS

| Record | Points to |
|--------|-----------|
| `api.voidborn.fun` A | Utah backend VPS IP (same as `sportsydeals.com`) |

## `backend/.env` (Platform URLs)

```env
SUPABASE_PUBLIC_URL=https://api.voidborn.fun
API_EXTERNAL_URL=https://api.voidborn.fun
PROXY_DOMAIN=api.voidborn.fun
PROXY_DOMAIN_EXTRA=sportsydeals.com
CERTBOT_EMAIL=admin@voidborn.fun
GOTRUE_MAILER_EXTERNAL_HOSTS=api.voidborn.fun,sportsydeals.com
```

Frontend voidborn builds:

```env
NEXT_PUBLIC_SUPABASE_URL=https://api.voidborn.fun
```

Sendmail (staging/cPanel):

```env
AUTH_VERIFY_BASE_URL=https://api.voidborn.fun
```

## Deploy on Utah API VPS

After syncing repo files:

```bash
cd ~/constructor-files/backend
docker compose up -d nginx kong auth --force-recreate
docker compose logs nginx --tail 80
```

TLS is issued **inside** the `supabase-nginx` container (not host `certbot`). Nginx `server_name` includes both `api.voidborn.fun` and `sportsydeals.com`.

If HTTPS fails for the new host, expand the cert inside the container:

```bash
docker compose exec nginx certbot certonly --webroot \
  -w /var/www/certbot \
  -d api.voidborn.fun \
  -d sportsydeals.com \
  --expand \
  -m admin@voidborn.fun \
  --agree-tos \
  --non-interactive
docker compose restart nginx
```

## Verify

```bash
curl -sI https://api.voidborn.fun/auth/v1/health
curl -sI https://sportsydeals.com/auth/v1/health
```

### CORS / market cards empty

If the browser console shows `accept-profile is not allowed` on `/rest/v1/cards`, recreate Kong after syncing `volumes/api/kong-entrypoint.sh`:

```bash
docker compose up -d kong --force-recreate
```

PostgREST (supabase-js) sends `Accept-Profile` / `Content-Profile` headers; they must be in Kong’s global CORS allowlist.

## Frontend VPS (voidborn)

```bash
cd ~/constructor-files/frontend
# edit .env.production → NEXT_PUBLIC_SUPABASE_URL=https://api.voidborn.fun
PROJECT=voidborn npm run build
pm2 restart voidborn-prod
```

Staging deploy from local: `bash frontend/deploy/scripts/deploy-from-local.sh --site voidborn`

## Sendmail VPS (staging)

```bash
cd ~/constructor-files/sendmail
# AUTH_VERIFY_BASE_URL=https://api.voidborn.fun in .env
pm2 restart voidborn-sendmail --update-env
```

Confirm emails should link to `https://api.voidborn.fun/auth/v1/verify?...` (not sportsydeals.com).
