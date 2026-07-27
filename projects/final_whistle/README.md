# Final Whistle

Football-legacy content pack — **Final Whistle** brand, project id `final_whistle`.

Slogan: **Every Match Leaves a Legacy.** Production domain: TBD (`siteUrl` empty in manifest).

## World

Four pitch **domains**. Engine categories stay `earth` / `water` / `fire` / `air`; names and art folders are football-flavored (not classical elements).

| Domain | Id | Element folder | Category label | Mood |
|--------|-----|----------------|----------------|------|
| Striker's End | `striker` | `front` | Front | Box runs, far-post ghosts, finishing lanes |
| Engine Room | `midfield` | `mid` | Mid | Tempo, switches of play, press traps |
| The Box | `box` | `box` | Box | Set pieces, walls, six-yard chaos |
| Back Line | `backline` | `back` | Back | Last ditch, high line, keeper's claim |

Lore hooks:

- **Attack** — the push to break lines
- **Defense** — shape that holds legacy

Stats display as **Threat** / **Resolve** (stored as `attack` / `health`). Rarity tiers: **Reserve**, **Starter**, **Captain**, **Legend**, **Final Whistle**.

## Status (Phase 0–1)

Phase 0–1 content pack scaffold — see **[`../NEW_THEME.md`](../NEW_THEME.md)** for the full build order.

- [x] Copy layer (`copy/*.json`, legal stubs retargeted from Helix)
- [x] Game metadata (`domains`, `locations`, `cities`, `scenes` with image prompts)
- [x] Theme tokens (`colors.json`, `ui.json` — Bebas Neue + DM Sans; stadium night palette)
- [x] Generation specs (`contentgen.json`, `cardgen.json`, `socialgen.json`)
- [x] Registry entry (`status`: `demo`, no `stagingDomain`)
- [x] Manifest `siteUrl`: `""` (no production domain yet)
- [x] Showcase card stubs (12 slugs, 3 per domain)
- [ ] Phase 2a — contentgen apply + brand assets
- [ ] Phase 2b — cardgen showcase art
- [ ] Phase 3+ — landing / portal / play frontend packs
- [ ] Phase 6 — sites bootstrap row, sendmail SMTP, SEO deploy

## Cardgen showcase (landing)

12 slugs are wired (3 per domain):

| Domain | Featured (`_01`) | Collection (`_02`, `_03`) |
|--------|------------------|---------------------------|
| Striker's End | `striker_card_01_poacher` | `far_post_ghost`, `finishing_lane` |
| Engine Room | `midfield_card_01_tempo_setter` | `switch_of_play`, `press_trap` |
| The Box | `box_card_01_set_piece_wall` | `six_yard_chaos`, `penalty_architect` |
| Back Line | `backline_card_01_last_ditch` | `high_line`, `keepers_claim` |

```bash
cd cardgen
npm run generate-showcase -- --project=final_whistle --force
# follow printed validate → approve → generate-images → apply
```

## Contentgen (landing + domains + cities — no cards)

Prompts live in `game/scenes.json` + `contentgen.json`. Expected outputs:

| Kind | Count | Paths |
|------|-------|--------|
| Domain backgrounds | 4 | `assets/domains/{front,mid,box,back}_domain.png` |
| City / zone art | 12 | `assets/cities/{front,mid,box,back}/*.png` |
| Pathway CTA tiles | 6 | `assets/cta1/*.webp` |
| Gamemodel pillars | 3 | `assets/gamemodel/*.webp` |
| Rarity emblems | 3 | `assets/card_types/{uncommon,rare,epic}.webp` |

From `contentgen/`:

```bash
npm run manifest -- --project=final_whistle
npm run generate-images -- --project=final_whistle
npm run apply -- --project=final_whistle
```

**Logo:** drop `assets/brand/header.png` (and favicon / play lobby) manually — not part of contentgen.

## Auth

Auth email suffix = site id: `player+final_whistle@example.com`.

## Compile check

```bash
cd frontend
PROJECT=final_whistle npm run compile
# showcase-only while art is pending:
FRONTEND_SHOWCASE_ONLY=1 PROJECT=final_whistle npm run compile
```
