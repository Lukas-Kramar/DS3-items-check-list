# DS3 Checklist — Context Index

Browser-only static SPA. Vanilla TypeScript + SCSS, bundled by Bun. No framework.

## Navigation

- [architecture.md](architecture.md) — module map, data flow, SCSS structure
- [patterns.md](patterns.md) — coding conventions used throughout
- [decisions.md](decisions.md) — why things are built the way they are
- [issues/README.md](issues/README.md) — bug log index

## Quick orientation

Entry point: `src/main.ts` → fetches data → populates `appState` → renders DOM.
State lives in `appState` (in-memory) and is mirrored to `localStorage` on every mutation.
All DOM writes go through `src/render.ts`. Filter logic is pure functions in `src/filters.ts`.
