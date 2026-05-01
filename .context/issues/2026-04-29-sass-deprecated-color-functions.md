# 2026-04-29 Deprecated Sass color functions

**Area**: `src/styles/_controls.scss`
**Symptom**: `sass` CLI emitted deprecation warnings for `darken()` and `lighten()` on build.
**Root Cause**: Dart Sass ≥1.77 deprecates the global `darken()`/`lighten()` built-ins. They will
be removed in Dart Sass 3.0. The warnings do not fail the build today but will become errors.
**Fix**: Added `@use 'sass:color';` to `_controls.scss`. Replaced:
- `darken($blood-red, 8%)` → `color.adjust($blood-red, $lightness: -8%)`
- `lighten($blood-red, 6%)` → `color.adjust($blood-red, $lightness: 6%)`
- `lighten($blood-red, 20%)` → `color.adjust($blood-red, $lightness: 20%)`
**Prevention**: Never use the global `darken()`/`lighten()`/`saturate()` etc. Always use
`@use 'sass:color'` and `color.adjust()` or `color.scale()` for any color manipulation.
