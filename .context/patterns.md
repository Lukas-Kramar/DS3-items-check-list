# Coding Patterns

## State mutation

Never mutate `checklist` directly. Go through `patchWeapon()` and assign back:

```ts
appState.checklist = patchWeapon(appState.checklist, id, { obtained });
saveState(appState.checklist);          // always call immediately after
```

For simple pages, the same pattern applies on `state.checklist` inside the factory closure.

## Debounce

Local generic `debounce<T>` defined in `main.ts`, `render.ts`, and `simple-checklist.ts`.
Timings from constants: `SEARCH_DEBOUNCE_MS = 200`, `NOTE_DEBOUNCE_MS = 300`.

## Full re-render vs targeted patch

- **Filter/sort changes**: full `renderCards()` — replaces entire item list via `DocumentFragment`
- **Checkbox toggle**: targeted — toggle `.obtained` class on the card, no re-render
- **Note input**: targeted — update counter text and `.has-note` / note icon in-place

## Card-header click (whole-card toggle)

Cards on all pages register a click listener on `.card-header` that proxies to the checkbox.
Two exclusions prevent double-toggling or conflict:

```ts
header.addEventListener("click", (e) => {
  const t = e.target as Element;
  if (t.closest(".note-toggle")) return;   // note button keeps its own handler
  if (t.closest(".checkbox-wrap")) return; // label already toggles the checkbox
  const cb = header.querySelector<HTMLInputElement>(".weapon-checkbox");
  if (!cb) return;
  cb.checked = !cb.checked;
  cb.dispatchEvent(new Event("change", { bubbles: true }));
});
```

## DLC badge in card builder

Both `render.ts` (weapons) and `simple-checklist.ts` (others) render a `badge-dlc` span when
`item.isDLC` is true:

```ts
const dlcBadge = item.isDLC
  ? `<span class="badge badge-dlc">${escHtml(item.dlcName ?? "DLC")}</span>`
  : "";
```

Badge styles are in `_badges.scss`. DLC data lives in the JSON as `"isDLC": true, "dlcName": "..."`.
Non-DLC items simply omit both keys — the type is `isDLC?: boolean; dlcName?: string`.

## hideCategoryBadge predicate

`createSimpleChecklist` accepts an optional third parameter:

```ts
createSimpleChecklist(items, storageKey, (item) => item.category === "NG")
```

When the predicate returns `true` for an item, its category badge is omitted. Used by rings to
suppress the uninformative "NG" tag on base-game rings.

## HTML escaping in card builders

All data-derived strings rendered via `innerHTML` go through `escHtml()`:

```ts
function escHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
```

Notes have a second defence: `maxlength` on the textarea AND `slice(0, MAX_NOTE_LENGTH)` in `setNote`.

## Default state for unknown item IDs

`getWeaponState(state, id)` returns `{ obtained: false, note: "" }` when the id is absent.
The checklist is sparse — items are only written to storage when touched.

## Event binding model

Events are bound per-card immediately after the `DocumentFragment` is inserted, not delegated from
the container. Cards are replaced in bulk on filter changes, so there is no stale-listener risk.

## SCSS module system

Every partial that uses variables must declare `@use 'variables' as *` at its own top.
`main.scss` only contains `@use` directives — no rules.
Color manipulation: `@use 'sass:color'` + `color.adjust()`. Never `darken()`/`lighten()`.

## TypeScript DOM typing

```ts
const el = document.getElementById("search-input") as HTMLInputElement | null;
```

Use `dataset["id"]` (bracket notation) inside event handlers to satisfy `no-unsafe-member-access`.
