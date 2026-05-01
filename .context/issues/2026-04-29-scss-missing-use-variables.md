# 2026-04-29 SCSS partials missing `@use 'variables'`

**Area**: `src/styles/_reset.scss`, `_layout.scss`, `_controls.scss`, `_badges.scss`, `_cards.scss`, `_scrollbar.scss`
**Symptom**: `sass` CLI exited with "Undefined variable" on first build attempt.
**Root Cause**: Dart Sass's `@use` module system does not cascade variable scope. The root `main.scss`
declared `@use 'variables' as *` but that scope is private to `main.scss` — partials loaded via
`@use` in `main.scss` do not inherit it.
**Fix**: Added `@use 'variables' as *` at the top of every partial that references a `$variable`.
Removed the `@use 'variables' as *` from `main.scss` since it now has no rules of its own.
**Prevention**: Every new SCSS partial must declare its own `@use 'variables' as *` if it uses any
design tokens. Do not assume parent files propagate variable scope.
