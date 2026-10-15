# Implementation progress

Updated: 2026-10-15. Repo: `/workspaces/daily`, branch `main`.

## Current instruction and exact next step

Work **locally only**, **plain HTML/CSS/JavaScript**, **one app at a time**. No workflows, pushes, Pages configuration or deployments. Keep real Readwise/Reader API calls for the user's later token test; unverified live access does not block implementation. Do not request personal tokens or backup files.

The shared platform, plants, Coffee and Games have passing local workflow checks. **Next: Time Budget**, starting with its original/module rules and characterization tests because it has no original suite. Preserve template budgeting/reallocation, active tasks/timing, and its appearance; add the migration export for active state. Continue sequentially with piano, reading, WhatsApp, then complete shared migration/localization/release acceptance. Coffee Excel remains excluded.

## Verified current work

| Scope | Result | Evidence |
| --- | --- | --- |
| General | 65 unit + 19 browser cases pass | `reports/platform-with-games.txt` |
| Plants | 23 unit + 11 browser cases pass | `reports/plants-with-games.txt` |
| Original plant care characterization | 8 additional cases pass against Stillgreen | `reports/baseline-plants-care.txt` |
| Strict full-scope lint | Pass | `reports/games-lint.txt` |
| Native JS syntax | 332 files pass; this is not typechecking | `reports/games-syntax.txt` |
| Static preparation | 249 unchanged native files/assets prepared | `reports/games-build.txt` |
| Coffee | 17 unit + 28 browser cases pass | `reports/coffee-with-games.txt` |
| Games | 15 unit + 30 browser cases pass | `reports/games-ui.txt` |
| Whole migration | Incomplete; other four modules remain pending | Last full red evidence: `reports/red-all.txt` |

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
2. Characterize Time Budget against its original before implementation. Preserve original budgeting and template operations, add root/session/activity and migration/recovery acceptance before changes, then port its native UI. Keep one app at a time. General/shared changes require general plus affected suites.
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


## Games local checkpoint (after Coffee checkpoint `9fc5cc5`)

- Read original/module rules and all three original subsystem docs. Added eight domain characterization cases: original Games baseline passes (`baseline-games-domain.txt`), absent module fails (`games-domain-red.txt`), refactored native module passes (`games-domain.txt`).
- Seven new service cases first fail on the missing adapter (`games-service-red.txt`), then pass with the eight domain cases (`games-service.txt`, 15 total). Root writes preserve unrelated modules; explicit language saves are atomic; a session and its timestamp activity start/finish in one root commit. Score changes retain the original start. Quota and stale-state saves cannot partially change games/activities. Replace previews retain shared language and recovery, rejecting stale confirmations.
- Original 24 browser workflows retain assertions. Fixtures now wrap `daily:v1.modules.games.data` and synthesize its active shared activity. Native detail/settings URL and scoped-theme selectors replace the old private router/global theme. Valid imports explicitly download recovery and confirm a read-only preview. Excel/personal/source app data remain untouched.
- Full original UI was split into native functions under `modules/games/src/frontend/app/`; backend validators/stats were split without relaxing lint. Internal `updateScore` now takes `(data, selection, value)` to meet the four-parameter policy; the baseline characterization helper adapts only that call boundary, retaining all scoring assertions.
- After the first native run passed 23/24 workflows, deferred focus fixed the reminder-to-export transition. Four shared browser additions cover Home/reload timing, language drafts, stale player edits and import cancel/stable history links. The activity test initially used the wrong widget selector (`running` instead of the existing `activities`) and an advancing clock; corrected fixtures preserve the exact 90-second assertion. Draft/conflict and toast-overlay failures were actual behavioral red. A subsequent run passes all 28 cases (`games-before-offline.txt`).
- Added offline score/history/statistics and obsolete-session-link contracts. Offline passes immediately; the obsolete link fails before routing is fixed (`games-offline-links-red.txt`: 29 pass / 1 fail). Final command passes: `node scripts/test.mjs games --report reports/games-ui.txt`, 30 browser cases plus 15 unit cases. Toast expiry is preserved through native remounts, and the draft test now checks that the notification actually expires.
- General (65 + 19), Plants (23 + 11) and Coffee (17 + 28) regressions all pass. Final full-scope lint, 332-file syntax and static preparation of 249 native assets pass (`games-lint.txt`, `games-syntax.txt`, `games-build.txt`). The phone screenshot was reviewed. Games source mapping/docs are saved. The original Games UI has many hardcoded English labels; complete localization is an explicit Stage 8 gate, not a passing claim.


## Final audit reminders

- Coffee: recheck history filter display after language restoration, visible/atomic first tools setup on storage failure, and transient notification expiry across remounts.
- Games: complete hardcoded English localization and audit duplicate nested round/result IDs during combined restore. Shared Game clocks intentionally derive from the original session start; history timing corrections/overrides remain explicit.
- Plants: translate preserved authored guide paragraphs for EN/ES, keeping saved user text intact; include derived draft controls in the all-app review.
- Across all apps: finish the documented stale-view/concurrency policy, combined root/per-module restore, legacy exporters, all-module worker/update/draft tests, proper install assets and physical-device checklist. None of these deferred gates is claimed complete by the scoped green reports.
