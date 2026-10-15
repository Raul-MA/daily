# Implementation progress

Updated: 2026-10-15. Repo: `/workspaces/daily`, branch `main`.

## Current instruction and exact next step

Work **locally only**, **plain HTML/CSS/JavaScript**, **one app at a time**. No workflows, pushes, Pages configuration or deployments. Keep real Readwise/Reader API calls for the user's later token test; unverified live access does not block implementation. Do not request personal tokens or backup files.

The shared platform, plants and Coffee are implemented locally. Coffee and shared/Plants regression checks pass; **next: games**, starting with its module rules, retained original source and copied 24 workflow cases. Continue sequentially with Time Budget, piano, reading, WhatsApp, then complete shared migration/localization/release acceptance. Coffee Excel remains excluded.

## Verified current work

| Scope | Result | Evidence |
| --- | --- | --- |
| General | 65 unit + 19 browser cases pass | `reports/platform-with-coffee.txt` |
| Plants | 23 unit + 11 browser cases pass | `reports/plants-with-coffee.txt` |
| Original plant care characterization | 8 additional cases pass against Stillgreen | `reports/baseline-plants-care.txt` |
| Strict full-scope lint | Pass | `reports/coffee-lint.txt` |
| Native JS syntax | 214 files pass; this is not typechecking | `reports/coffee-syntax.txt` |
| Static preparation | 135 unchanged native files/assets prepared | `reports/coffee-build.txt` |
| Coffee | 17 unit + 28 browser cases pass | `reports/coffee-ui.txt` |
| Whole migration | Incomplete; other five modules remain pending | Last full red evidence: `reports/red-all.txt` |

No skipped tests or relaxed lint thresholds. Original plant assertions remain unchanged. New-app parity is not established by original baseline results.

## Implemented

- Accessible hash-router shell, accepted three/two/one-column iOS dashboard, app menu, shared EN/ES, persisted widget order/visibility and quick-action settings. Dashboard links create no records or care events.
- Validated `daily:v1` root document, per-module adapters, recovery/corrupt preservation, future-version rejection and visible quota failures. Combined restore and remaining domain adapters are still pending.
- Timestamp activity registry: independent countdowns, singleton budget/game/piano, explicit pause/resume/completion and overdue reconstruction. Rendering/navigation never advances persisted state. Full Time Budget/game/piano modules still need integration.
- One generated manifest and owned offline asset list. Authenticated/external requests bypass worker caches. Cached HTML remains with its matching asset version. Updates require every open same-app tab to report safe; blocked/unresponsive tabs hold activation. The two-tab browser test preserves settings and unsaved work through update acceptance.
- Local-midnight/calendar refresh with foreground/timezone checks and daylight-saving tests. In-memory dirty-form snapshots preserve values, file selection and focus through language changes. Plant/history stale edits retain drafts rather than overwriting newer records.
- Plants: list, stable detail/edit routes, templates, seasonal care, notes/history editing, skip/manual due dates, Things settings/exact shortcut payload, original/migration exports, preview/cancel/recovery before import, scoped source theme and offline care logging. Thirteen original guide/template data objects are preserved. Controls are EN/ES; authored guide paragraphs/descriptions remain Spanish for final content localization. See `modules/plants/docs/behavior.md` and `reports/plants-source-map.json`.
- Coffee: original drink/meta/grind/prep/composition/taste forms, beans, history filters/views/detail editing, insights, tools setup, scoped original theme, shared EN/ES, stable record/edit links, legacy JSON exports and preview/recovery/merge/replace imports. Duplicate/reference/nested-schema validation, read-only startup, quota errors, language draft restoration, stale-record/settings guards and offline checks are implemented. See `modules/coffee/docs/behavior.md` and `reports/coffee-source-map.json`.
- Standalone connection diagnostic: explicit submission, memory-only token cleared from input, sequential real GET endpoints, timeout/status-only results and direct Daily Review fallback. Live authenticated access remains unverified.
- Five legacy worker-cleanup patches prepared and ownership-tested. Originals and installed workers remain unchanged; release/coexistence tests are deferred.

## User-confirmed facts

- All original apps export and restore successfully. Most backups have fewer than 50 entries and are approximately 20 KB. Do not ask to repeat these checks or provide personal exports. Synthetic storage fixtures exceed 140 KB.
- Existing Time Budget correctly survives lock/background/closing and reopening. Reader works on the iPhone. Daily Review is new and has no previous live verification.
- Coffee's unrelated documentation, personal backup and Excel additions remain untouched and excluded.

## Resume and remaining gates

1. Read `AGENTS.md`, `COMPASS.md`, this file and the authoritative `docs/pwa-consolidation-plan.md`.
2. Implement games, preserving its 24 copied browser workflows and characterizing domain/storage/activity behavior before changes. Read its original/module Compass and rules; keep activity timing in the shared registry, preserve snapshots, outcomes, archived data and replace-only backup semantics. General/shared changes require general plus affected suites.
3. Add Time Budget/Reader characterization before implementation; add replacement piano continuation/worker/route contracts before changing its behavior.
4. Complete combined backup/import schemas/reference validation, legacy migration exporters, concurrency policy, all-app offline/update checks, full localization (including plant guides), install assets and device checklist. Real iPhone/Things/Readwise acceptance remains deferred and must never be claimed passing from browser mocks.
5. Run `npm run verify` before claiming the whole migration complete. Until all apps are implemented it must remain red. Save local checkpoints; no remote work.

## Checkpoints and test history

- `1344b79`: copied source tests and strict bootstrap; baseline/source mapping in `reports/source-tests.json` and `migration-test-inventory.md`.
- `565912d`, `dffda47`: diagnostic/recovery prototype and checked legacy patches.
- `f9b9eca`: last historical pushed checkpoint. Existing remote is `https://github.com/Raul-MA/daily.git`; historical Pages configuration failed and is no longer authorized for troubleshooting.
- `a78f194`: verified Vite/TypeScript platform checkpoint (54 unit + 17 browser cases).
- `bb4c54e`: removed Vite/TypeScript only after the same checks passed in a native-JavaScript candidate and again in the main repo. Old typed/build reports are historical evidence. Current scripts copy native files and generate offline metadata; no bundler/transpiler/runtime framework remains.
- New red/green evidence: `plants-care-red`, `plants-service-red`, `plants-browser-red`, `plants-drafts-red`, `plants-styles-red`, `plants-import-count-red`, `calendar-red`, `calendar-browser-red`, and corresponding current reports. `platform-updates-red.txt` initially contained only a file-level runner failure; `platform-updates-regression-red.txt` explicitly replays the saved prior worker and fails four new guards. See `docs/testing.md`.
- Test reports use `node scripts/test.mjs <scope> --report reports/<name>.txt`. The reusable command prefix is approved for local browser/server execution; avoid shell redirections or changing command shapes unnecessarily.

## Coffee local checkpoint (after `d6a9c4f` plants checkpoint)

- Original 21 workflows / 147 assertion sites retained; fixture-only shared storage/theme/reminder selectors and explicit import confirmation steps are documented in the inventory. Nine service cases were introduced before their adapter/import/validation implementations; eight domain cases were characterized against the original source. Seven additional browser cases cover the new shared contracts and mounted offline behavior. Stale-edit, quota, settings-draft, missing-link and visual fixes have recorded behavioral red/green evidence.
- Coffee final command passed: `node scripts/test.mjs coffee --report reports/coffee-ui.txt` (17 unit + 28 browser). Earlier browser runs passed all 28 workflows before the new single-line navigation assertion; screenshot review exposed label wrapping. Red evidence is retained in `coffee-navigation-style-red.txt` and `coffee-fixed-navigation-red.txt`. The final CSS uses the original fixed bar, safe-area padding and label-aware column widths; both 390px English and 320px Spanish pass. The English phone screenshot was reviewed again with unwrapped labels.
- General 65 unit + 19 browser and Plants 23 unit + 11 browser regression checks pass after Coffee integration. Final full-scope lint, 214-file native syntax check and static preparation (135 native files/assets) pass. No Vite, TypeScript, workflows, remote writes or original-app changes were introduced.
- Known final-gate work: all-app form/filter restoration and update/concurrency policies still need a complete release audit. No full-migration or device acceptance is claimed.
