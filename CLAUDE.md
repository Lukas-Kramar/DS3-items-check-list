@~/.claude/stack/typescript.md

# DS3 Collection Tracker

Browser-only multi-page app. No server, no framework, no backend. Static files in `dist/`.

## Pages

| Page | Entry point | Bundle |
|---|---|---|
| `index.html` | `dashboard-main.ts` | `dashboard-bundle.min.js` |
| `weapons.html` | `main.ts` | `weapons-bundle.min.js` |
| `spells.html` | `spells-main.ts` | `spells-bundle.min.js` |
| `rings.html` | `rings-main.ts` | `rings-bundle.min.js` |
| `armor.html` | `armor-main.ts` | `armor-bundle.min.js` |

Shared: `styles.min.css`

## Build

```bash
bun run build   # lint → SCSS → 5 JS bundles → copy data + HTML
```

Bun must be on PATH. If fresh shell: `export PATH="$HOME/.bun/bin:$PATH"`.

## Key constraints

- All HTML pages load JS/CSS via relative paths only — no CDN except Google Fonts (required for Cinzel)
- `src/data/*.json` are sources of truth — `dist/*.json` are copies, never edited directly
- All JSON data bundled via ES import — do NOT switch to fetch(), file:// origins block it (see `.context/issues/2026-04-29-cors-file-protocol.md`)
- TypeScript strict mode, zero `any` — Bun handles transpilation, no tsconfig needed
- All magic strings/timings/limits live in `src/constants.ts`
- Storage keys: `STORAGE_KEY` (weapons), `STORAGE_KEY_SPELLS`, `STORAGE_KEY_RINGS`, `STORAGE_KEY_ARMOR`

## Module responsibilities (quick ref)

| File | Does |
|---|---|
| `constants.ts` | Named constants + all 4 storage keys |
| `types.ts` | `Weapon`, `SimpleItem` + filter/sort types for both |
| `storage.ts` | localStorage read/write, accepts storage key param |
| `filters.ts` | Pure filter + sort for weapons (no DOM) |
| `simple-checklist.ts` | Generic factory engine for spells/rings/armor |
| `state.ts` | Mutable `appState` singleton for weapons page |
| `render.ts` | Weapons page DOM writes, card builder, event binding |
| `main.ts` | Weapons page bootstrap |
| `spells-main.ts` / `rings-main.ts` / `armor-main.ts` | Simple checklist page bootstraps |
| `dashboard-main.ts` | Dashboard: reads all 4 localStorage keys, renders progress cards |

## SCSS rules

- Every partial that uses variables must `@use 'variables' as *` at the top
- Color manipulation: use `@use 'sass:color'` + `color.adjust()` — `darken()`/`lighten()` are deprecated in Dart Sass
- `main.scss` only contains `@use` directives — no rules
- Variables are never re-exported through `main.scss`; each partial owns its own `@use`

## Context docs

Read `.context/README.md` before making structural changes.
