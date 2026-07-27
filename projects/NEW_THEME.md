# New theme playbook (Helix reference)

How we built **HELIX** (`projects/helix`) end to end. Follow this order for the next brand.

**Reference site:** voidborn (structure, compiler contracts, asset sizes).  
**Do not** invent a parallel architecture — mirror voidborn / iyashikei / helix paths and only change copy, art, and theme CSS/JS packs.

Scaffold helper (structure only): `npm run site:add -- --id=… --url=… --from=voidborn`  
Then execute the phases below (art → landing → portal → game → infra).

Agents: also see `.cursor/rules/new-theme-playbook.mdc`.

---

## Phase 0 — Decide identity

| Decision | Helix example |
|----------|----------------|
| Project `id` | `helix` |
| Display brand | HELIX |
| Production domain | `helixsignal.online` |
| Staging domain | `helix.voidborn.fun` |
| Auth email suffix | `+helix` (usually = `siteId`) |
| World metaphor | Soft sci-fi labs / Signal vs Static |

Register early in `projects/registry.json` (path, staging domain, port index).

---

## Phase 1 — Project copy & game JSON

**Goal:** A compile-able content pack with no unique frontend CSS yet.

Scaffold under `projects/{id}/` (mirror voidborn):

- `manifest.json` — brand, routes, logos, `siteUrl`
- `copy/` — hero, pathways, gamemodel, collection, FAQ, footer, SEO, sitemap, legal, descriptions
- `game/` — domains, locations, cities, scenes (image prompts in `notes`), rarities, keywords, featured-cards, cards stubs
- `theme/` — `colors.json`, `ui.json`, `landing.json` (fonts/tokens the compiler expects)
- `portal/sections.json`
- `auth.json`, `credits.json`
- `contentgen.json`, `cardgen.json`, `socialgen.json`

**Rules**

- Keep engine category ids (`earth` / `water` / `fire` / `air`) if the engine requires them; rename labels/folders for flavor (Helix: hab/cryo/forge/relay).
- Retarget legal from voidborn with brand/domain replace — don’t rewrite from scratch unless needed.
- Document the world table in `projects/{id}/README.md`.

**Exit:** `PROJECT={id} npm run compile` succeeds (assets may be missing; structure must be valid).

---

## Phase 2 — Art pipelines (contentgen → cardgen)

**Order matters:** landing backgrounds first, then showcase cards, then full catalog.

### 2a — contentgen (landing pack)

From `contentgen/`:

```bash
npm run manifest -- --project={id}
npm run generate-images -- --project={id}   # human reviews art
npm run apply -- --project={id}
```

Produces domains, cities, CTA tiles, gamemodel pillars, rarity emblems.  
**Not** logo/video — drop `assets/brand/*` manually (`header.png`, favicon, play lobby, etc.).

See `contentgen/README.md`.

### 2b — cardgen showcase (landing performance)

Wire ~12 showcase slugs (featured + collection). Generate/apply showcase art into `assets/cards/…`.

Compile with showcase-only when iterating landing:

```bash
cd frontend
FRONTEND_SHOWCASE_ONLY=1 PROJECT={id} npm run compile
```

### 2c — Full card rounds (can wait until after landing/portal look good)

`cardgen` generate-round → validate → approve → images → apply → later `PROJECT={id} npm run upload:site`.

---

## Phase 3 — Landing, section by section

**Goal:** Unique look without breaking shared section components.

Typical order (Helix):

1. Theme tokens + fonts (`{id}-theme.css`, `{id}-fonts.css`) + `data-landing-variant`
2. Global chrome / header / footer
3. Hero
4. Pathways / dominions / locations
5. Collection / featured cards
6. Game model / pillars
7. FAQ, final CTA
8. Modals used from landing (auth, credits) — `{id}-modals.css`

**Rules**

- Prefer variant CSS under `frontend/src/styles/{id}-*.css` over forking every React section.
- One job per section; brand-first hero discipline (see frontend design user rules).
- Recompile + local `start:prod` (or staging) after each major section.
- Optional: landing Playwright snapshots once chrome is stable (`ui-tests`).

**Exit:** Home page reads as that brand with real art; no voidborn leftovers in the first viewport.

---

## Phase 4 — Portal

**Goal:** Market / collection / transactions / profile + overlays match the theme.

- Portal chrome & pages CSS (`{id}-portal-chrome.css`, `{id}-portal-pages.css`)
- Modals: credits, withdraw, cart drawer, account menu
- Collection Forge/Sell modes
- Card backs / `--card-back-logo` (use an asset that exists in the build — Helix used header when gamelogo was missing)

**Exit:** Auth’d portal usable; UI tests can lock chrome (mask dynamics — see `ui-tests/README.md`).

---

## Phase 5 — Play / game pack

**Goal:** `/play` lobby + match UI are theme-native.

- Lobby: city bg, header, themed console/copy, logo treatment
- `frontend/src/gameplay/{id}/` — Game shell, Avatar, VFX, kill/result overlays, ambience
- Register pack in `frontend/src/gameplay/index.ts`
- Play-specific CSS (`{id}-play.css`, battle transition hooks, etc.)

**Exit:** Start match → themed boards/FX → result copy fits lore.

---

## Phase 6 — APIs, auth, mail, SEO, deploy

**Goal:** Real accounts, credits, invoices, public SEO — not just static look.

| Area | What |
|------|------|
| Sites bootstrap | API DB row for `site_id` / domain (`sites-bootstrap.sql`) |
| Auth | `+{suffix}` emails; GoTrue → sendmail hook |
| Sendmail | Brand map + `SMTP_{SITE}_*` + logo under `sendmail/assets/brand/{id}/` |
| API env | `SENDMAIL_URL`, `MAIL_API_KEY`, `INVOICE_COMPANY_*`, verify base URL |
| Commerce | Same checkout/credits path as other sites (**no Stripe**) |
| Cards upload | `PROJECT={id} npm run upload:site` when catalog ready |
| SEO | `copy/seo.json`, `sitemap.json`, compile favicons/og |
| Nginx / staging | `stagingDomain`, htpasswd, TLS |
| Frontend VPS | compile → `npm run build` → pm2 restart |
| UI tests | Add to `ui-tests/helpers/sites.ts` → `node test-all.mjs --update -g {name}` |

**Hard rule:** agent edits code in the mount; **only the user** runs VPS docker / pm2 / seed / nginx (see `.cursor/rules/terminal-via-user.mdc`).

---

## Checklist (copy per project)

```text
[ ] Phase 0 — id, brand, domains, registry
[ ] Phase 1 — projects/{id} JSON + README world table
[ ] Phase 2a — contentgen apply + brand assets
[ ] Phase 2b — cardgen showcase + compile showcase-only
[ ] Phase 3 — landing section-by-section CSS/layout
[ ] Phase 4 — portal chrome + modals
[ ] Phase 5 — gameplay/{id} pack + /play lobby
[ ] Phase 2c — full cardgen + upload:site (when ready)
[ ] Phase 6 — site row, sendmail SMTP, SEO, nginx, pm2
[ ] ui-tests sites entry + baselines
```

---

## Why this order

1. **JSON first** — compiler and gens have a target.  
2. **Art next** — landing needs real frames, not placeholders.  
3. **Landing before portal/game** — shared tokens/modals settle early.  
4. **Portal before deep game** — auth/market prove API + theme chrome.  
5. **Infra last** — avoid burning SMTP/DNS while copy still churns.

---

## Related docs

| Doc | Role |
|-----|------|
| `projects/README.md` | Pack layout, compile/upload, site scripts |
| `contentgen/README.md` | Landing asset CLI |
| `projects/helix/README.md` | Helix-specific world + deploy notes |
| `ui-tests/README.md` | Landing + portal visual tests |
| `.cursor/rules/project-architecture.mdc` | Mounts / VPS roles / payments |
| `.cursor/rules/terminal-via-user.mdc` | Who runs production commands |
