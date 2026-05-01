# 2026-05-01 Stats panel clipped — weapon classes below "Spear" not visible

**Area**: `src/styles/_controls.scss`
**Symptom**: On `weapons.html` the "Progress by Class" stats panel cut off at roughly "Spear"
alphabetically. Categories below it (Straight Sword, Thrusting Sword, etc.) were invisible.
Other pages were unaffected.
**Root Cause**: `.stats-container { max-height: 600px; overflow: hidden }`. With ~28+ weapon
classes at ~21 px per row, total height exceeds 600 px and `overflow: hidden` silently clips the rest.
Spells/rings/armor have fewer categories and never hit the limit.
**Fix**: Changed `max-height: 600px` → `max-height: 2000px`. The collapse animation
(max-height ↔ 0) still works; only the upper bound changed.
**Prevention**: If new item categories are ever added and clipping reappears, raise this value
again, or replace the CSS max-height animation with a JS-driven height transition.
