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

## Status (step 1 complete)

- [x] Copy layer (`copy/*.json`, legal stubs)
- [x] Game metadata (`domains`, `locations`, `cities`, `scenes` with image prompts)
- [x] Theme (`colors.json`, `ui.json` — Shippori Mincho + Zen Kaku Gothic)
- [x] Generation specs (`cardgen.json`, `contentgen.json`)
- [ ] **Landing assets** — `cd contentgen && npm run manifest && npm run generate-images && npm run apply`
- [ ] **Showcase cards** — cardgen → `assets/cards/` (12 slugs for `FRONTEND_SHOWCASE_ONLY=1`)

## Next steps

1. **Landing backgrounds:** `cd contentgen && npm install && npm run manifest -- --project=iyashikei` then `generate-images` + `apply`
2. **Brand files:** add `assets/brand/gamelogo.png`, `header.png`, `play-lobby.png` manually
3. **Showcase card art:** `cd cardgen && npm run generate-images-showcase -- --project=iyashikei`
4. `FRONTEND_SHOWCASE_ONLY=1 PROJECT=iyashikei npm run compile` from `frontend/`

Placeholder featured card slugs are wired in `locations.json` and `copy/collection.json` but `cards.json` is empty until cardgen.
