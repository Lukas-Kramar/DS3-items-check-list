# Architectural Decisions

## sass CLI over a Bun plugin

Using the `sass` npm package (Dart Sass CLI) invoked directly in the build script.
**Why:** No stable, maintained Bun plugin for SCSS exists as of Bun 1.x. Third-party `bun-plugin-sass`
is unmaintained and breaks on Bun ≥1.1. The sass CLI is stable, officially maintained, and trivially
composed with `&&` in a single build script.
**How to apply:** Always add sass as a devDependency. Invoke via `sass src/... dist/... --style=compressed --no-source-map`.

## localStorage over IndexedDB

At ~200 weapons × (1 boolean + ≤500 chars) the worst-case payload is ~120 KB — well within localStorage's
5 MB limit. The data is flat key→value with no relational queries. IndexedDB would add async
transaction boilerplate (IDBRequest, onsuccess callbacks) for zero practical benefit.
**How to apply:** Keep all persistence in `storage.ts` using synchronous `localStorage.getItem/setItem`.

## Sparse checklist storage

`ChecklistState` only stores weapons the user has interacted with. Untouched weapons return a default
`{ obtained: false, note: "" }` from `getWeaponState()`. This means the stored JSON starts empty and
grows only as the user acts, keeping storage minimal.
**How to apply:** Never pre-populate `checklist` with all weapon IDs. Always use `getWeaponState()` as the read path.

## No framework — vanilla TS + DOM

No React, Vue, Svelte etc. The DOM surface is small and predictable. A framework would add bundle
weight, a build-plugin chain, and abstraction overhead for a ~200-item list that re-renders at most
on filter changes. The full bundle ships at ~8.7 KB minified.
**How to apply:** Stick to `document.createElement`, `innerHTML` (with `escHtml`), and `DocumentFragment` for bulk inserts.

## Full re-render on filter, targeted patch on interaction

Filter/sort changes replace `#weapon-list` entirely via a `DocumentFragment` swap. Checkbox toggles
and note inputs update only the relevant DOM node in-place. This avoids janky re-renders on the
two highest-frequency interactions without needing a virtual DOM.
**How to apply:** Any new filter dimension → call `renderCards()`. Any per-card state change → patch the card in place.

## weapons.json bundled into JS (not fetched at runtime)

`weapons.json` is imported as an ES module at build time (`import weaponsData from "./data/weapons.json"`).
Bun embeds it in `bundle.min.js`. This makes the app work when opened directly from the filesystem
(file:// origin) without a server — fetch() is blocked by CORS on file:// origins.
**Trade-off:** bundle.min.js is ~42 KB instead of ~8.7 KB. Updating weapon data requires a rebuild.
**How to apply:** Keep weapon data as a bundler import. Do not switch back to fetch() unless the
app is guaranteed to be served via HTTP.

## debounce duplicated per module, not shared

`debounce` is a 6-line generic utility defined identically in `main.ts` and `render.ts`. It was
not extracted to a shared `utils.ts` because it is the only utility in the codebase — a shared
module would exist for a single function, adding a pointless import hop.
**How to apply:** If a third module needs debounce, extract it then. Until then, leave it local.
