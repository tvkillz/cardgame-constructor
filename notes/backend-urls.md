# Backend VPS — API URL

All URL vars are grouped at the top of `backend/.env` under **Platform URLs**.

## Change the API domain (e.g. → sportsydeals.com)

Edit these four to the **same** host:

```env
SUPABASE_PUBLIC_URL=https://sportsydeals.com
API_EXTERNAL_URL=https://sportsydeals.com
PROXY_DOMAIN=sportsydeals.com
CERTBOT_EMAIL=admin@sportsydeals.com
```

Then on the **frontend VPS** `.env.production`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://sportsydeals.com
```

Rebuild frontend, restart backend:

```bash
# backend VPS
sh run.sh restart
```

## Frontend site domains (auth redirects)

Not the API URL — these are the public site hostnames (`voidborn.fun`, `test.sportsydeals.com`, …):

```env
SITE_URL=https://voidborn.fun
ADDITIONAL_REDIRECT_URLS=https://voidborn.fun/**,https://www.voidborn.fun/**,...
```

Regenerate from frontend:

```bash
cd frontend && npm run site:sync
```

Paste output into `ADDITIONAL_REDIRECT_URLS`, then `sh run.sh restart` on backend.
