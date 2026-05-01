# Coding Patterns

## State mutation

State is never mutated directly on `appState.checklist`. Always go through `patchWeapon()` in `storage.ts`,
which returns a new `ChecklistState` object. Assign the result back:

```ts
appState.checklist = patchWeapon(appState.checklist, id, { obtained });
saveState(appState.checklist);
```

`saveState` is always called immediately after — never defer it.

## Debounce

A local generic `debounce<T>` utility is defined in both `main.ts` and `render.ts` (not shared).
This is intentional: each module owns its timers without cross-module import coupling.

```ts
function debounce<T extends (...args: Parameters<T>) => void>(fn: T, ms: number): T {
  let timer: ReturnType<typeof setTimeout>;
  return ((...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  }) as T;
}
```

Timings come from constants: `SEARCH_DEBOUNCE_MS = 200`, `NOTE_DEBOUNCE_MS = 300`.

## DOM updates — full re-render vs targeted patch

- **Filter/sort changes**: full `renderCards()` — replaces the entire `#weapon-list` innerHTML via DocumentFragment
- **Checkbox toggle**: targeted — only toggles `.obtained` class on the card, skips full re-render
- **Note input**: targeted — updates counter text and `.has-note` / note icon in-place; `setNote()` is debounced

This avoids re-render cost on the hot paths (checkbox, typing).

## Event delegation model

Events are NOT delegated from `#weapon-list`. Instead, `renderCards()` binds listeners on each
card element immediately after inserting the fragment. This is safe because cards are replaced in
bulk on filter changes, so there is no stale-listener problem.

## HTML escaping in card builder

User-controlled strings (weapon name, weaponClass, notes) rendered via `innerHTML` must go through `escHtml()`:

```ts
function escHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
```

`weapons.json` values are treated as user-controlled for safety. Notes are doubly safe: `maxlength`
on the textarea AND `slice(0, MAX_NOTE_LENGTH)` in `setNote()`.

## Default state for unknown weapon IDs

`getWeaponState(state, id)` returns `{ obtained: false, note: "" }` if the id is not in the
checklist. This means the checklist is sparse — weapons are only written to storage when touched.

## SCSS module system

Every partial that uses variables must declare `@use 'variables' as *` at its own top.
`main.scss` only contains `@use` directives — it never re-exports variables or defines rules.
Color manipulation uses `@use 'sass:color'` + `color.adjust()` — the legacy `darken()`/`lighten()`
globals are deprecated in Dart Sass ≥1.77 and will error in Sass 3.

## TypeScript DOM typing

DOM queries are typed with generic overloads and cast at point of use, never widened to `any`:

```ts
const el = document.getElementById("search-input") as HTMLInputElement | null;
```

Element reads inside event handlers use `dataset["id"]` (bracket notation) to satisfy
`@typescript-eslint/no-unsafe-member-access` without suppression.

## Filters are pure

`filterWeapons()` and `sortWeapons()` in `filters.ts` take all inputs as arguments and return
a new array. They never read from `appState` directly — callers pass `appState.checklist` in.
This makes them independently testable without mocking global state.
