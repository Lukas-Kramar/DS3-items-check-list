# Architecture

## Module map

```
src/
├── constants.ts   All magic strings/numbers (STORAGE_KEY, debounce timings, MAX_NOTE_LENGTH)
├── types.ts       Interfaces: Weapon, WeaponState, ChecklistState, FilterState, SortOption
├── storage.ts     localStorage I/O only — loadState, saveState, getWeaponState, patchWeapon
├── filters.ts     Pure functions — filterWeapons, sortWeapons, getUniqueClasses, getUniqueDamageTypes
├── state.ts       Mutable singleton appState + all mutation functions (setObtained, setNote, reset*, export/import)
├── render.ts      All DOM writes — buildCard, renderCards, renderCounter, renderStatsPanel, renderFilterOptions
├── main.ts        Bootstrap only — fetch weapons, init, bind top-level event listeners
└── styles/
    ├── _variables.scss   Colour palette, typography, spacing, transition tokens
    ├── _reset.scss       Box-model reset, base element defaults
    ├── _scrollbar.scss   Custom thin scrollbar (webkit + firefox)
    ├── _layout.scss      Header, sidebar, main-layout, progress bar, responsive breakpoint
    ├── _controls.scss    Filters, toggles, buttons, stats panel
    ├── _badges.scss      .badge-class, .badge-dmg, .badge-dlc pill styles
    ├── _cards.scss       .weapon-card, custom checkbox, note section, char counter
    └── main.scss         @use directives only — no rules
```

## Data flow

```
fetch("weapons.json")
  → Weapon[]                             stored in appState.weapons
  → localStorage("ds3-checklist-state") → ChecklistState
  → merged into appState.checklist
  → renderFilterOptions()                populates class/damage dropdowns from live data
  → renderCards()                        builds DOM from filtered appState

User interaction:
  checkbox     → setObtained() → patchWeapon() → saveState()  → update card class + counter
  note input   → debounce 300ms → setNote()   → patchWeapon() → saveState()
  filter/sort  → mutate appState.filters → renderCards() (full re-render of list)
  reset btn    → confirm() → reset*() → saveState() → renderCards()
  export btn   → JSON.stringify(checklist) → Blob download
  import btn   → FileReader → importState() → saveState() → renderCards()
```

## dist/ output

```
dist/
  index.html       Static shell — loads bundle.min.js + styles.min.css via relative paths
  bundle.min.js    All 6 TS modules bundled + minified by Bun (~8.7 KB)
  styles.min.css   All SCSS partials compiled + minified by sass CLI (~9.2 KB)
  weapons.json     Copy of src/data/weapons.json — ~64 KB, ~200 weapons
```

## Dependency direction

```
main.ts → state.ts → storage.ts → constants.ts
       → render.ts → filters.ts → storage.ts
                   → state.ts
       → filters.ts
types.ts  ← used by all modules (type-only imports)
constants.ts ← used by storage, state, render
```

No circular dependencies. `filters.ts` and `storage.ts` have no imports from the rest of the app.
