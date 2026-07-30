# Wildreach

Photorealistic wildlife content pack — **WILDREACH** brand, project id `wildreach`.

Staging: `https://wildreach.voidborn.fun`. Production: `https://wildreach.placeholder` *(domain TBD)*.

## World

Four continental **ranges** where apex predators hold territory. Engine categories stay `earth` / `water` / `fire` / `air`; names and art are biome-flavored hunting grounds (not classical elements).

| Range | Id | Element folder | Category label | Mood |
|-------|-----|----------------|----------------|------|
| Serengeti | `serengeti` | `savanna` | Savanna | Open pursuit, pride pressure, golden veld |
| Bengal | `bengal` | `delta` | Delta | River ambush, mangrove patience, monsoon shadow |
| Patagonia | `patagonia` | `ridge` | Ridge | Ledge hunting, canopy stalking, ember coast |
| Taiga | `taiga` | `boreal` | Boreal | Wolf patrol, snow-leopard patience, eagle thermals |

Lore hooks:

- **Observe the hunt** — documentary framing; matches are territorial disputes across ranges
- **Strike** / **Stamina** — offensive pressure vs endurance (stored as `attack` / `health`)

Rarity tiers: **Track**, **Scout**, **Hunter**, **Apex**, **Wildreach**.

## Status

Phase 1 scaffold complete. See **[`../NEW_THEME.md`](../NEW_THEME.md)** for the full build order.

- [x] Phase 0 — id, brand, staging domain, registry
- [x] Copy layer (`copy/*.json`, legal stubs retargeted)
- [x] Game metadata (`domains`, `locations`, `cities`, `scenes` with image prompts)
- [x] Theme tokens (`colors.json`, `ui.json` — Oswald + Inter; natural palette)
- [x] Generation specs (`contentgen.json`, `cardgen.json`, `socialgen.json`)
- [x] Showcase card stubs (12 slugs in `game/cards.json`)
- [ ] Phase 2a — contentgen apply + brand assets
- [ ] Phase 2b — cardgen showcase + compile showcase-only
- [ ] Phase 3–6 — landing CSS, portal, play pack, infra

## Cardgen showcase (landing predators)

12 slugs wired (3 per range):

| Range | Featured (`_01`) | Collection (`_02`, `_03`) |
|-------|------------------|---------------------------|
| Serengeti | `serengeti_card_01_lioness_sentinel` | `leopard_shadow`, `cheetah_gust` |
| Bengal | `bengal_card_01_river_tiger` | `mangrove_croc`, `clouded_leopard` |
| Patagonia | `patagonia_card_01_ridge_puma` | `jaguar_emerald`, `harpy_strike` |
| Taiga | `taiga_card_01_wolf_patrol` | `snow_leopard`, `golden_eagle` |

```bash
cd cardgen
npm run generate-showcase -- --project=wildreach --force
# follow printed validate → approve → generate-images → apply
```

## Contentgen (landing + domains + cities — no cards)

Prompts live in `game/scenes.json` + `contentgen.json`. Expected outputs:

| Kind | Count | Paths |
|------|-------|--------|
| Domain backgrounds | 4 | `assets/domains/{savanna,delta,ridge,boreal}_domain.png` |
| City / zone art | 12 | `assets/cities/{savanna,delta,ridge,boreal}/*.png` |
| Pathway CTA tiles | 6 | `assets/cta1/*.webp` |
| Gamemodel pillars | 3 | `assets/gamemodel/*.webp` |
| Rarity emblems | 3 | `assets/card_types/{uncommon,rare,epic}.webp` |

From `contentgen/`:

```bash
npm run manifest -- --project=wildreach
npm run generate-images -- --project=wildreach
npm run apply -- --project=wildreach
```

Drop `assets/brand/*` manually (`header.png`, favicon, play lobby, etc.).

## Compile

```bash
cd frontend
PROJECT=wildreach npm run compile
# showcase-only while iterating landing:
FRONTEND_SHOWCASE_ONLY=1 PROJECT=wildreach npm run compile
```

Auth email suffix = site id: `player+wildreach@example.com`.
