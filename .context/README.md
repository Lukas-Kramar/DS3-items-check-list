# DS3 Checklist — Context Index

Browser-only static SPA. Vanilla TypeScript + SCSS, bundled by Bun. No framework. 5 pages.

## Navigation

- [architecture.md](architecture.md) — page/bundle map, module responsibilities, data flow, build pipeline
- [patterns.md](patterns.md) — coding conventions: state mutation, card-header click, DLC badges, debounce
- [decisions.md](decisions.md) — why things are built the way they are (including session 2026-05-01 changes)
- [issues/README.md](issues/README.md) — bug log index

## Quick orientation

**Weapons page** is standalone: `main.ts` → `state.ts` + `render.ts` + `filters.ts`.
**Spells / Rings / Armor** use the generic factory: `createSimpleChecklist(data, key, opts?)` in `simple-checklist.ts`.
**Dashboard** (`dashboard-main.ts`) reads all 4 storage keys for progress cards and handles the
single Export All / Import All for the entire save.

State lives in localStorage under 4 keys (see `constants.ts`). All item data is ES-imported into
bundles at build time — no `fetch()` calls anywhere (blocked on `file://` origins).
