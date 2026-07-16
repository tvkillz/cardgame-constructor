# VOIDBORN Autobattler (frontend MVP)

Standalone auto-battler prototype. **Does not touch** the main `frontend/` `/play` engine.

## Run locally

```bash
cd autobattler
npm install
npm run dev
```

Open http://localhost:5174

## What this MVP includes

- Right-side shop: pick characters from the **hero** half of voidborn cards
- Bottom bench: capacity = current level (starts at 1)
- Top **Start Round** button
- Round 1 combat: heroes vs weaker villains, GSAP fireball VFX, HP bars update
- Win → round progress +1 (further rounds not implemented yet)

## Data source

- Cards: `../projects/voidborn/game/cards.json`
- Art: `../projects/voidborn/assets/cards/...`

Hero/villain pools are a stable 50/50 split of the card list (by slug sort).
