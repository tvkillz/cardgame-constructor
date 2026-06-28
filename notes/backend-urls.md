# Backend VPS — API URL

All URL vars are grouped at the top of `backend/.env` under **Platform URLs**.

## Primary API — api.voidborn.fun (voidborn)

```env
SUPABASE_PUBLIC_URL=https://api.voidborn.fun
API_EXTERNAL_URL=https://api.voidborn.fun
PROXY_DOMAIN=api.voidborn.fun
PROXY_DOMAIN_EXTRA=sportsydeals.com
CERTBOT_EMAIL=admin@voidborn.fun
GOTRUE_MAILER_EXTERNAL_HOSTS=api.voidborn.fun,sportsydeals.com
```

Then on the **frontend VPS** `.env.production`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://api.voidborn.fun
```

Rebuild frontend, restart backend:

```bash
# backend VPS
cd ~/constructor-files/backend
docker compose up -d nginx kong auth --force-recreate

# frontend VPS
cd ~/constructor-files/frontend
PROJECT=voidborn npm run build
pm2 restart voidborn-prod
```

See `backend/API-DOMAIN.md` for TLS / certbot inside Docker.

## Frontend site domains (auth redirects)

Not the API URL — public site hostnames (`voidborn.fun`, `staging.voidborn.fun`, …):

```env
SITE_URL=https://voidborn.fun
ADDITIONAL_REDIRECT_URLS=https://voidborn.fun/**,https://www.voidborn.fun/**,...
```

Regenerate from frontend:

```bash
cd frontend && npm run site:sync
```

Paste output into `ADDITIONAL_REDIRECT_URLS`, then recreate auth on the backend VPS.

## Sendmail confirm links

```env
AUTH_VERIFY_BASE_URL=https://api.voidborn.fun
```

On staging sendmail VPS: `pm2 restart voidborn-sendmail --update-env`
