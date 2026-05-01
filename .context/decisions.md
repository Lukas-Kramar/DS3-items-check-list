# Architectural Decisions

## sass CLI over a Bun plugin

Using the `sass` npm package (Dart Sass CLI) invoked directly in the build script.
**Why:** No stable Bun plugin for SCSS exists. The sass CLI is officially maintained and composes
trivially with `&&`.
**How to apply:** `sass src/styles/main.scss dist/styles.min.css --style=compressed --no-source-map`

## localStorage over IndexedDB

Worst-case payload ~120 KB — well within the 5 MB limit. Data is flat key→value with no relational
queries. IndexedDB would add async boilerplate for zero practical benefit.
**How to apply:** Keep all persistence in `storage.ts` using synchronous `getItem/setItem`.

## Sparse checklist storage

`ChecklistState` only stores items the user has interacted with. Untouched items return a default
`{ obtained: false, note: "" }` via `getWeaponState()`.
**How to apply:** Never pre-populate `checklist` with all IDs. Always read through `getWeaponState()`.

## No framework — vanilla TS + DOM

No React/Vue/Svelte. The DOM surface is small and predictable; a framework adds bundle weight for
a ~200-item list that re-renders only on filter changes.
**How to apply:** `document.createElement`, `innerHTML` (with `escHtml`), `DocumentFragment` for bulk inserts.

## Full re-render on filter, targeted patch on interaction

Filter/sort changes replace the item list entirely via a `DocumentFragment` swap. Checkbox and note
interactions update only the relevant DOM node in-place.
**How to apply:** New filter dimension → call `renderCards()`. Per-card state change → patch the card in place.

## Item data bundled into JS (not fetched at runtime)

All JSON data (`weapons.json`, `spells.json`, etc.) is ES-imported at build time. Bun embeds it in
the bundle. This makes the app work on `file://` origins where `fetch()` is blocked by CORS.
**Trade-off:** Larger bundles. Updating data requires a rebuild.
**How to apply:** Never switch to `fetch()` unless the app is guaranteed to run behind HTTP.

## debounce duplicated per module, not shared

`debounce` is a 6-line utility defined locally in `main.ts`, `render.ts`, and `simple-checklist.ts`.
Not extracted because it is the only utility — a shared module would exist for one function.
**How to apply:** If a fourth module needs it, extract to `utils.ts` at that point.

## Export/import lives on the dashboard only (bundled all-in-one file)

Individual item pages (weapons, spells, rings, armor) no longer have their own Export/Import buttons.
**Why:** Users had to back up four separate files. The dashboard exports a single `ds3-checklist-all.json`
with keys `{ weapons, spells, rings, armor }`. Import validates at least one key is present before writing.
**How to apply:** `dashboard-main.ts` is the only place that reads/writes all four storage keys at once.

## `createSimpleChecklist` factory for spells/rings/armor

Spells, rings, and armor share identical UI structure. Rather than duplicating the page logic three
times, a factory function in `simple-checklist.ts` returns a page controller object.
**Why:** The weapons page has extra complexity (weapon class, damage type filters, DLC toggle, dedicated
`appState`/`state.ts`). The three simpler pages are handled generically.
**How to apply:** New simple-item page → call `createSimpleChecklist(data, STORAGE_KEY, opts?)`.

## DLC filter is "DLC Only" toggle (not per-DLC include/exclude)

Both weapons and spells use a single `dlcOnly` boolean. When enabled, only DLC items are shown.
**Why:** Uniform UX — one pattern for all pages. Per-DLC toggles (the original spells approach)
added cognitive overhead and diverged from the weapons UI.
**How to apply:** Add `isDLC: true` + `dlcName` to data; the toggle and badge work automatically.

## `hideCategoryBadge` predicate on `createSimpleChecklist`

An optional third parameter `(item: SimpleItem) => boolean` suppresses the category badge per item.
**Why:** Rings have three NG tiers ("NG", "NG+2", "NG+3"). The base "NG" badge is noise — those
rings are obtainable on any playthrough and the tag adds no information. "NG+2" and "NG+3" are
meaningful. Rather than hardcoding this in the generic factory, a predicate keeps the factory neutral.
**How to apply:** `rings-main.ts` passes `(item) => item.category === "NG"`.

## `clean` step runs before every build

`bun run build` starts with `rm -rf dist && mkdir -p dist`.
**Why:** Without it, stale files from previous builds accumulate silently (e.g., old bundles, old
JSON with duplicate entries that were manually edited).
**How to apply:** The `clean` script is separate so individual `build:*` steps still work in isolation.
