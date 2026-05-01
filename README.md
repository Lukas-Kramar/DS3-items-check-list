# Dark Souls III — Collection Tracker

A browser-based checklist for tracking every collectible item across a full Dark Souls III playthrough — including both DLCs and up to **NG+3**.

**[Open the tracker](https://lukas-kramar.github.io/DS3-items-check-list/)**

---

## What it tracks

| Category | Items | Notes |
|----------|------:|-------|
| Weapons  | 275   | All base game + Ashes of Ariandel + The Ringed City |
| Spells   | 98    | Sorceries, Pyromancies, Miracles |
| Rings    | 114   | Includes all +1 / +2 / +3 variants locked behind NG cycles |
| Armor    | 247   | All helms, chests, gauntlets and leggings |
| **Total** | **734** | |

### Why NG+3?

Many rings only drop in NG+2 or NG+3 — the upgraded variants (Havel's Ring +3, Chloranthy Ring +3, etc.) are locked behind successive playthroughs by design. The rings checklist is organized by the cycle in which each item first becomes available, so you always know what to chase on the current run.

---

## Features

**Dashboard** — at-a-glance progress bars for all four categories. Instantly see how complete your collection is across the whole game.

**Weapons page**
- Filter by weapon class (30 categories — Dagger through Ultra Greatsword)
- Filter by damage type (Physical, Magic, Fire, Lightning, Dark, Poison, Bleed)
- Toggle DLC-only view or show only unobtained items
- Sort by name, weapon class, or push obtained items to the bottom
- Per-item text notes (up to 500 characters) — useful for tracking upgrade materials or drop sources

**Spells, Rings, Armor pages**
- Filter by category and search by name
- Toggle unobtained-only view
- Sort by in-game order or alphabetically

**Persistence** — all progress is saved to `localStorage`. Nothing is sent anywhere; your data lives entirely in your browser. Clear browser storage to reset.

---

## Usage

Open the live link above — no install, no account, no server.

If you want to use it locally (e.g. offline):

```bash
git clone https://github.com/Lukas-Kramar/DS3-items-check-list.git
cd DS3-items-check-list
bun install
bun run build
# then open dist/index.html in a browser
```

> **Note:** opening `dist/index.html` directly via `file://` works because all data is bundled into the JS — there are no fetch calls that would be blocked by CORS.

---

## Building from source

Requires [Bun](https://bun.sh).

```bash
bun run build        # lint → SCSS → 5 JS bundles → copy data + HTML
```

Output lands in `dist/`. The build is fully self-contained — no CDN dependencies at runtime except Google Fonts (Cinzel typeface).

---

## Tech stack

- TypeScript (strict, zero `any`) — compiled by Bun
- SCSS — compiled by Dart Sass
- Vanilla DOM — no framework
- `localStorage` — no backend
- GitHub Actions — builds and deploys to GitHub Pages on every push to `main`

---

## Data

All item data lives in `src/data/*.json` and is bundled at build time. If you spot a missing item or a mistake, pull requests are welcome.
