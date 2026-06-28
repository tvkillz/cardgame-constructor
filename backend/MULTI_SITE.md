# Multi-tenant platform backend

Single Supabase Docker stack serves **all** frontend sites. API URL: `https://voidborn.fun` (or `SUPABASE_PUBLIC_URL`).

## Site isolation

| Layer | Mechanism |
|-------|-----------|
| Auth | Site-suffixed email: `jane+voidborn@example.com` vs `jane+project2@example.com` (UI shows `jane@example.com`) |
| Membership | `site_members` + trigger on `auth.users` insert |
| Catalog | `cards.site_id`, `location_featured_cards.site_id` |
| Edge functions | `X-Site-Id` header from frontend |

Same display email can register on **both** voidborn and project2 with **different passwords** (separate `auth.users` rows).

## Env (backend `.env`)

```env
SUPABASE_PUBLIC_URL=https://voidborn.fun
API_EXTERNAL_URL=https://voidborn.fun
PROXY_DOMAIN=voidborn.fun

# Allow OAuth redirects from every frontend domain
ADDITIONAL_REDIRECT_URLS=https://voidborn.fun/**,https://www.voidborn.fun/**,https://project2.example.com/**
```

CORS: Kong global plugin — `volumes/api/cors-origins.txt` (sync with `frontend/deploy/output/cors-origins.txt`).

## SQL

- `volumes/db/sites.sql` — sites, site_members, auth trigger (init)
- `volumes/db/sites-multitenant.sql` — migration for existing DBs

Seed sites match `projects/registry.json` ids (`voidborn`, `project2`, …).

## Nginx

`supabase-nginx.conf.tpl` is **API-only** (no frontend proxy). Frontends use `frontend/deploy/` on their VPS.

## Frontend

All sites share in `.env.production`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://voidborn.fun
```

Site identity comes from compiled `siteId` in the content pack (not the API URL).
