# Architecture

## Pages & bundles

| HTML | Entry point | Bundle | What it does |
|---|---|---|---|
| `index.html` | `dashboard-main.ts` | `dashboard-bundle.min.js` | Progress overview + export/import all |
| `weapons.html` | `main.ts` | `weapons-bundle.min.js` | Full weapons checklist (dedicated state + render) |
| `spells.html` | `spells-main.ts` | `spells-bundle.min.js` | Spells via `createSimpleChecklist` |
| `rings.html` | `rings-main.ts` | `rings-bundle.min.js` | Rings via `createSimpleChecklist` |
| `armor.html` | `armor-main.ts` | `armor-bundle.min.js` | Armor via `createSimpleChecklist` |

Shared: `styles.min.css`, `favicon.ico`

## Module map

```
src/
├── constants.ts          Storage keys, debounce timings, MAX_NOTE_LENGTH
├── types.ts              Weapon, SimpleItem (+ optional isDLC/dlcName),
│                         WeaponState, ChecklistState, FilterState, SimpleFilterState
├── storage.ts            localStorage: loadState, saveState, getWeaponState, patchWeapon
├── filters.ts            Pure: filterWeapons, getUniqueClasses, getUniqueDamageTypes (weapons only)
├── state.ts              Weapons-page mutable singleton (appState) + mutation functions
├── render.ts             Weapons-page DOM: buildCard, renderCards, renderCounter, renderStatsPanel
├── main.ts               Weapons-page bootstrap
├── simple-checklist.ts   Generic factory for spells/rings/armor (see below)
├── dashboard-main.ts     Reads all 4 storage keys, renders progress cards, handles export/import
├── spells-main.ts        Creates checklist instance; passes nothing for hideCategoryBadge
├── rings-main.ts         Creates checklist instance; passes (item) => item.category === "NG"
│                         to suppress base-game category badge
├── armor-main.ts         Creates checklist instance
└── styles/               _variables, _reset, _scrollbar, _layout, _controls, _badges, _cards
```

## simple-checklist.ts — the generic factory

```
createSimpleChecklist(items, storageKey, hideCategoryBadge?) → { init, bindFilters,
  bindResetControls, bindKeyboardShortcuts, bindStatsToggle }
```

- Owns its own `SimplePageState` (items, checklist, filters)
- `hideCategoryBadge?: (item: SimpleItem) => boolean` — predicate to suppress the category
  badge per item (used by rings to hide the "NG" first-run tag)
- DLC badge rendered automatically when `item.isDLC === true` → `badge-dlc` with `item.dlcName`
- Filter state: `search`, `category`, `unobtainedOnly`, `sortBy`, `dlcOnly`

## Data flow

```
ES import (build-time) → Item[]        bundled into each page's .min.js
localStorage(storageKey) → ChecklistState

User interaction:
  card-header click (not note-toggle, not checkbox-wrap)
                     → toggle checkbox → dispatch change event → setObtained/patchWeapon → saveState
  checkbox change    → setObtained / patchWeapon → saveState → update card class + counter
  note input         → debounce 300ms → setNote / patchWeapon → saveState
  filter/sort toggle → mutate filters → full renderCards()
  export (dashboard) → bundle all 4 checklists → Blob download as ds3-checklist-all.json
  import (dashboard) → FileReader → parse → saveState × 4 → re-render progress cards
```

## Build

```
bun run build
  = clean (rm -rf dist && mkdir dist)
  + lint (eslint)
  + build:css (sass)
  + build:js (bun build × 5 bundles)
  + build:data (cp JSON files)
  + build:assets (cp favicon.ico)
  + build:html (cp HTML files)
```

## dist/ output

All 5 HTML + 5 JS bundles + styles.min.css + 4 JSON files + favicon.ico.
JSON files are copied but not used at runtime — all item data is ES-imported into bundles.

## Dependency direction

```
*-main.ts → simple-checklist.ts → storage.ts → constants.ts
main.ts   → state.ts             → storage.ts
          → render.ts            → filters.ts
          → filters.ts
dashboard-main.ts → storage.ts, constants.ts
types.ts ← all modules (type-only)
```

No circular dependencies.
