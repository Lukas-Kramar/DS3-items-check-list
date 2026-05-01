# 2026-04-29 fetch blocked on file:// protocol (CORS)

**Area**: `src/main.ts`
**Symptom**: Opening `dist/index.html` directly in a browser (file:// origin) blocked the fetch
for `weapons.json` with a CORS error: "Cross origin requests are only supported for protocol
schemes: http, https…". The app rendered blank with no weapons.
**Root Cause**: Browsers treat `file://` as a null origin. `fetch()` to a sibling file on the
same filesystem is treated as a cross-origin request and blocked by CORS policy. This is a
browser security constraint that cannot be worked around from the app side without a server.
**Fix**: Replaced the runtime `fetch("weapons.json")` with a static ES module import:
```ts
import weaponsData from "./data/weapons.json";
```
Bun bundles JSON imports natively at build time. The data is embedded in `bundle.min.js`.
`init()` became synchronous; `showError()` and `WEAPONS_JSON_PATH` were removed as dead code.
`dist/weapons.json` is still copied to dist as a reference artifact but is no longer fetched.
**Side effect**: `bundle.min.js` grew from ~8.7 KB to ~42 KB (weapons data embedded).
**Prevention**: For any truly static SPA that must open from the filesystem, avoid `fetch()` for
local data files. Use bundler-level imports instead. Reserve `fetch()` for truly remote/dynamic
resources (APIs, user-supplied URLs).
