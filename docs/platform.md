# Shared platform

## Problem

Seven apps need one shell and local data boundary without conflicting navigation, styling or timer ownership. The user requires native HTML/CSS/JavaScript and local work only.

## How It Works

- `apps/daily/index.html` and `diagnostics.html` are the two HTML entry points. CSS loads through stylesheet links. JavaScript uses explicit relative `.js` imports supported directly by browsers.
- `scripts/build.mjs` copies app/shared/module source assets unchanged into `dist/`, preserving directory structure and relative imports. It generates the manifest, SVG favicon, PNG install icons, Apple touch icon and service-worker asset list. `scripts/icons.mjs` produces the raster files using Node built-ins; application code stays unchanged and requires no icon-generation runtime. No bundler or transpiler runs. Tests, reports, sibling repos and personal exports are outside the copied paths.
- `scripts/serve.mjs` serves only the prepared directory on `127.0.0.1`. `DAILY_BASE` must match preparation and serving. Dev runs preparation once; rebuild and refresh after source edits.
- `packages/platform/src/router.js` owns the allowlisted hash routes and configurable base. IDs and query values are encoded. Unknown or malformed routes render a focused not-found heading. Routing does not create records.
- `packages/data/src/daily-state.js` manages one `daily:v1` document. Preferences are separate from versioned module payloads. `module-store.js` validates data before saving, rejects unsupported versions and preserves unrelated modules. Subscribers run only after a successful storage commit.
- Settings mounts `apps/daily/src/backup/view.js` for full-root export, validated preview, recovery download and explicit replacement. [Storage and migrations](storage-and-migrations.md) explains schema/reference checks, credential cleanup and failure ordering.
- `calendar.js` schedules the next local midnight rather than a fixed 24-hour delay and rechecks date/timezone on foreground/focus. Dashboard refresh never saves records.
- `packages/ui/src/drafts.js` keeps dirty forms in memory across language renders, including file selection and focus. Conditional module form state is kept separately from domain records.
- Dashboard cards navigate; settings own widget visibility/order and quick-action visibility. EN/ES changes labels without translating saved user text.
- Standalone module backgrounds fill the viewport width; each app keeps its own internal content sizing. The shared header stays padded and the dashboard/settings keep their constrained layout. `shell/theme.js` derives header/footer/background colors and font from the mounted module, watches its theme attribute and system color scheme, and resets the shell on return Home. It observes root replacements rather than timer text updates. Mouse/trackpad hover underlines links and dims enabled buttons/menus; touch devices retain their existing interaction.
- `activities.js` owns persisted timestamp activity transitions. Page intervals update text only. Paused time is excluded; suspension and navigation do not pause activities. Countdown expiry does not silently complete an activity. Budget/game/piano each allow one unfinished activity.
- The single worker precaches the generated local asset list. It bypasses authenticated/external/unknown requests and deletes only `daily-pwa-` cache versions. Static cache matches ignore Vary because these are app-owned assets, never account data.
- `persistence.js` requests durable storage where available without domain writes or a retention guarantee.
- The attention screen preserves unreadable root snapshots and accepts a validated full backup after a recovery download; it never resets damaged data to empty. See [Storage and migrations](storage-and-migrations.md).
- The PWA UI offers installation help and explicit updates. It asks every open same-app tab to report its activity/form state before explicit activation. Blocked, malformed or missing replies keep the update waiting, with an explanation. Cached HTML stays pinned to its matching assets until activation.

## Gotchas

- Vite and TypeScript were used for a verified intermediate checkpoint, then replaced after the same general unit/browser checks passed. Their old reports remain historical evidence.
- `check:js` checks syntax, not types. Runtime schema validation and behavioral tests remain essential. No type-analysis claim applies to plain JavaScript.
- Generic root validation does not substitute for domain schemas. Each module adapter must validate its own payload, legacy formats and nested references before migration.
- LocalStorage has no multi-tab compare-and-swap transaction. Module saves re-read the latest document synchronously; module/form revision checks reject ordinary stale saves. The current policy supports one editing tab at a time; simultaneous cross-tab writes are unsupported. Update activation still checks every open tab.
- All seven apps are connected to the shared document. Game, budget and piano sessions save atomically with timestamp activities. Countdown controls use the registry independently. Reader credentials and disposable account caches stay outside the root; WhatsApp persists its draft before external handoff. Full local verification passes; physical-device/API/coexistence and releases remain deferred. Current evidence is in progress.
