# Komorebi (iyashikei)

Iyashikei-themed content pack — **KOMOREBI** brand, project id `iyashikei`.

## World

Four pastoral **wards** (realm locations), each with a matching domain id:

| Ward | Id | Element folder | Mood |
|------|-----|----------------|------|
| Shinrin | `shinrin` | `mori` | Cedar forest, moss shrines, tea terraces |
| Naminami | `naminami` | `umi` | Calm coast, fishing piers, tidal gardens |
| Akari | `akari` | `hi` | Golden hearth, harvest hills, festival lanterns |
| Takane | `takane` | `kaze` | Highland breeze, windmills, chime summits |

Lore hooks (replaces voidborn's Aether Bleed / Null Zones):

- **Haru-kaze** — restless spring wind eroding countryside calm
- **Shizukesa** — sacred stillness that ward keepers must tend

Card keywords use pastoral mechanics (`Shelter`, `Bloom`, `Mist`, `Breeze`, …) — see `game/keywords.json`. Stats display as **Spirit** / **Calm** (stored as `attack` / `health`). Rarity tiers: **Humble**, **Gentle**, **Radiant**, **Sacred**, **Komorebi** — see `game/rarities.json`.

## Status (step 1 complete)

- [x] Copy layer (`copy/*.json`, legal stubs)
- [x] Game metadata (`domains`, `locations`, `cities`, `scenes` with image prompts)
- [x] Theme (`colors.json`, `ui.json` — Shippori Mincho + Zen Kaku Gothic)
- [x] Generation specs (`cardgen.json`, `contentgen.json`)
- [ ] **Landing assets** — `cd contentgen && npm run manifest && npm run generate-images && npm run apply`
- [x] **Showcase cards** — `game/cards.json` (14 slugs) + PNG art under `assets/cards/{shinrin,naminami,akari,takane}/`
- [x] **Brand files** — `header.png`, `gamelogo.png`, `favicon.ico`, `play-lobby.png` (Shinrin moss shrine lobby)

## Upload cards to Supabase (market / play / test deck)

Portal and market read the **full catalog from Postgres + Storage**, not baked frontend assets. Until you upload, the UI falls back to the small showcase bundle in `.build/iyashikei/`.

### 1. Local admin creds (one-time)

```bash
cd frontend
cp .env.admin.example .env.admin
# SERVICE_ROLE_KEY from API VPS backend/.env
# NEXT_PUBLIC_SUPABASE_URL=https://api.voidborn.fun
```

### 2. Upload all cards from `game/cards.json`

```bash
cd frontend
PROJECT=iyashikei npm run upload:site
```

This uploads WebP full art + thumbs to Storage (`iyashikei/cards/…`, `iyashikei/thumbs/{domain}/…`) and upserts every row in `public.cards`.

Verify one URL:

`https://api.voidborn.fun/storage/v1/object/public/cards/iyashikei/cards/shinrin/shinrin_card_01_kodama_keeper.webp`

### 3. Backend site row + test deck (API VPS)

```bash
cd backend
docker compose exec -T db psql -U postgres < volumes/db/sites-bootstrap.sql
docker compose exec -T db psql -U postgres < volumes/db/sites-auth-email-alias.sql
docker compose exec -T db psql -U postgres < volumes/db/decks-test-deck-small-catalog.sql
docker compose exec -T db psql -U postgres < volumes/db/cards-random-prices-migration.sql
docker compose restart rest functions
```

`price_cents` = **credits** shown in market (1:1). Random range when not set in `cards.json`: **1000–100000** ($10–$1000). New uploads assign random prices automatically; the migration backfills any rows still at `null` or `0`.

`ensure_test_deck` grants **all published cards** when a site has ≤20 cards (all 14 showcase cards for iyashikei). New sign-ups get them automatically; existing users with an empty Test Deck get them on next portal load.

To reset a partial Test Deck after upload:

```sql
-- replace USER_UUID
delete from public.player_deck_cards
where deck_id in (
  select id from public.player_decks
  where user_id = 'USER_UUID' and site_id = 'iyashikei' and name = 'Test Deck'
);
select public.ensure_test_deck('USER_UUID', 'iyashikei');
```

### 4. Frontend deploy (showcase / landing only)

Upload does **not** require a frontend redeploy for market/play. Redeploy when landing showcase slugs or site code changed:

```bash
PROJECT=iyashikei npm run compile
PROJECT=iyashikei npm run build
# pm2 restart iyashikei-prod on frontend VPS
```

## Other next steps

1. **Landing backgrounds:** `cd contentgen && npm install && npm run manifest -- --project=iyashikei` then `generate-images` + `apply`
2. **More card art:** `cd cardgen && npm run generate-images-showcase -- --project=iyashikei` then re-run `upload:site`
3. `FRONTEND_SHOWCASE_ONLY=1 PROJECT=iyashikei npm run compile` for landing-only local thumbs
