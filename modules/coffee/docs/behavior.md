# Coffee storage and workflows

## Problem

Crois keeps its drink forms, beans, history, insights, preparation tools, theme and JSON backups while sharing Daily's language, routes, document and offline worker. Its personal backup, Excel additions and unrelated original documentation are excluded.

## How It Works

- Source: `coffee-tracker`, commit `8711d56c1330d6ce626662bbf98fb440eb2e10c4`. File hashes and destinations are in `reports/coffee-source-map.json`. Original repositories are unchanged.
- `src/service.js` binds the retained backend API to `daily:v1.modules.coffee = { version: 1, data }`. Data retains `schemaVersion: 1`, entries, bean presets and normalized settings. `src/validation.js` adds duplicate-ID, referenced-bean and settings checks. Read/navigation never creates a module or starter bean.
- `src/backend/features/` retains ratio/composition calculations, roast age, explicit skipped taste values, tool ownership, immutable entry identity, filters, sorting and insights. Drink changes clear irrelevant milk/water fields. Used beans cannot be deleted.
- An explicit tools Save/Skip creates the original House starter preset when the catalog is empty. Original startup created this on navigation; moving it behind the explicit action preserves the shared navigation-only contract.
- Coffee settings expose the global EN/ES preference. Explicit language saves update that preference and Coffee's payload in one root commit. Imports retain the current shared language, including legacy imports with a different language. Exports report the current shared language.
- `src/frontend/app/` holds the original templates and event handlers split into compliant native modules; `src/view.js` mounts them inside the shell. Coffee's light/dark/system theme and CSS are scoped to its region. No private manifest or worker is registered.
- Routes: `/coffee` and `/coffee/new`, `/coffee/history`, `/coffee/insights`, `/coffee/settings`, `/coffee/entry/:id`, `/coffee/entry/:id/edit`. Missing IDs never become new-entry forms. Reopening a record retains its stable ID.
- Forms keep unsaved values through shared-language renders. Derived ratio/score displays refresh afterward. Record/settings stamps detect stale edits after another tab saves; failed saves retain the draft. Exporting settings preserves unsaved inputs.
- The JSON filename remains `crois-YYYY-MM-DD.json`; export records its timestamp. Both merge and replace remain supported. Legacy missing tool settings normalize as before: merge preserves ownership/setup, replacement resets absent setup.
- `src/imports.js` prepares read-only previews. Incoming duplicates, invalid nested objects, future versions and final missing bean references are rejected. A merge may reference an already-stored bean. The dialog requires a recovery download before confirmation; cancellation changes nothing. Confirmation rejects a stale root and saves atomically with the previous root in `daily:v1:recovery`.

## Gotchas

- `backend/core/storage.js` retains its standalone legacy adapter only for source characterization. The mounted app always binds the shared adapter before rendering; binding reads/errors must precede the legacy fallback so malformed/future module data cannot become an empty collection.
- The original 21 browser workflows retain all 147 assertion sites. Fixture setup/readback targets the shared payload; theme assertions target the scoped region; the backup reminder's first-child assertion targets `#coffee-content`. Valid import tests now explicitly preview, download recovery and confirm. Invalid JSON still reports the original error.
- Eight domain characterization cases first passed against original Coffee, then failed against the absent module. Nine service cases and seven additional browser cases cover shared storage, language/drafts, stale edits, failed writes, previews, stable routes and offline access. See `reports/coffee-ui.txt` for current evidence; original baseline evidence does not prove Daily's parity.
- Browser screenshots and offline checks do not establish physical iPhone acceptance. Combined migration, final all-app concurrency/localization and release verification remain separate gates.
