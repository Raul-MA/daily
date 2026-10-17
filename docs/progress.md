# Implementation progress

Updated: 2026-10-17. Repo: `/workspaces/daily`, branch `main`.

## Current instruction and exact next step

Work **locally only**, **plain HTML/CSS/JavaScript**, **one app at a time**. No workflows, pushes, Pages configuration or deployments. Keep real Readwise/Reader API calls for the user's later token test; unverified live access does not block implementation. Do not request personal tokens or backup files.

**All seven apps and combined full-PWA backup/restore are connected and locally tested.** The last complete all-app run is `combined-backup-all.txt` at `da523d1`, including both broad Piano scripts. Later per-app checkpoints appear below; final whole-PWA verification still must run after the remaining localization/audit work. Full restore validates module schemas/activity mirrors, retains original timer timestamps, requires a recovery download and clears old app drafts only after replacement.

**Exact next step:** Piano `6788dc2` and the final Time Budget lifecycle fixes are accepted locally. `time-permission-lifecycle-scope.txt` passes all 23 unit/23 browser; strict lint passes. Continue with Reader's remaining authored error/confirmation localization and timestamp bounds, with red contracts before fixes. Then finish shared raw-storage recovery, persistent-storage request, activity bounds and concurrency/form/update audit, and run full verification. Device/live API/Things checks and original-app releases remain deferred. No remote work.

## Verified current work

| Scope | Result | Evidence |
| --- | --- | --- |
| General | 79 unit + 28 browser cases pass | `reports/piano-localization-general.txt` |
| Plants | 28 unit + 13 browser cases pass | `reports/plants-localization-scope.txt` |
| Original plant care characterization | 8 additional cases pass against Stillgreen | `reports/baseline-plants-care.txt` |
| Strict full-scope lint | Pass | `reports/piano-localization-lint.txt` |
| Native JS syntax | 774 files pass; this is not typechecking | `reports/piano-localization-syntax.txt` |
| Static preparation | 674 native files/assets prepared; legacy exporters excluded | `reports/piano-localization-build.txt` |
| Coffee | 20 unit + 34 browser cases pass | `reports/coffee-final-audit-unit.txt`, `reports/coffee-final-audit-scope.txt` |
| Games | 17 unit + 34 browser cases pass | `reports/games-localization-scope.txt` |
| Time Budget | 23 unit + 23 browser cases pass | `reports/time-permission-lifecycle-scope.txt` |
| Piano | 58 unit + 14 native browser cases; both original broad scripts pass | `reports/piano-localization-scope.txt` |
| Reader | 54 unit + 30 browser cases pass | `reports/legacy-reader-scope.txt` |
| WhatsApp | 12 unit + nine browser cases pass | `reports/legacy-whatsapp-scope.txt` |
| Whole migration | Local workflow checks all pass; Stage 8 migration/localization/device gates remain incomplete | `reports/combined-backup-all.txt` |

No skipped tests or relaxed lint thresholds. Original plant assertions remain unchanged. New-app parity is not established by original baseline results.

## Implemented

- Accessible hash-router shell, accepted three/two/one-column iOS dashboard, app menu, shared EN/ES, persisted widget order/visibility and quick-action settings. Dashboard links create no records or care events.
- Validated `daily:v1` root document, per-module adapters, recovery/corrupt preservation, future-version rejection and visible quota failures. All domain adapters are connected. Combined restore passes local all-app acceptance.
- Timestamp activity registry: independent countdowns, singleton budget/game/piano, explicit pause/resume/completion and overdue reconstruction. Rendering/navigation never advances persisted state. Time Budget, Games and piano are integrated.
- One generated manifest and owned offline asset list. Authenticated/external requests bypass worker caches. Cached HTML remains with its matching asset version. Updates require every open same-app tab to report safe; blocked/unresponsive tabs hold activation. The two-tab browser test preserves settings and unsaved work through update acceptance.
- Local-midnight/calendar refresh with foreground/timezone checks and daylight-saving tests. In-memory dirty-form snapshots preserve values, file selection and focus through language changes. Plant/history stale edits retain drafts rather than overwriting newer records.
- Plants: list, stable detail/edit routes, templates, seasonal care, notes/history editing, skip/manual due dates, Things settings/exact shortcut payload, original/migration exports, preview/cancel/recovery before import, scoped source theme and offline care logging. Thirteen original guide/template data objects are preserved. Controls, authored guides and template defaults support EN/ES; saved user text is never translated. See `modules/plants/docs/behavior.md` and `reports/plants-source-map.json`.
- Coffee: original drink/meta/grind/prep/composition/taste forms, beans, history filters/views/detail editing, insights, tools setup, scoped original theme, shared EN/ES, stable record/edit links, legacy JSON exports and preview/recovery/merge/replace imports. Duplicate/reference/nested-schema validation, read-only startup, quota errors, language draft restoration, stale-record/settings guards and offline checks are implemented. See `modules/coffee/docs/behavior.md` and `reports/coffee-source-map.json`.
- Piano: the complete Toniq lesson/exercise/reference library, local audio and diagrams, scoped source appearance, stable random/last links, timestamp practice, saved history, async language draft restoration and single-worker offline support. See `modules/piano/docs/behavior.md`. Full authored EN/ES presentation and language-only ordinary exercise snapshots pass local acceptance.
- Standalone connection diagnostic: explicit submission, memory-only token cleared from input, sequential real GET endpoints, timeout/status-only results and direct Daily Review fallback. Live authenticated access remains unverified.
- Five legacy worker-cleanup patches prepared and ownership-tested. Originals and installed workers remain unchanged; release/coexistence tests are deferred.

## User-confirmed facts

- All original apps export and restore successfully. Most backups have fewer than 50 entries and are approximately 20 KB. Do not ask to repeat these checks or provide personal exports. Synthetic storage fixtures exceed 140 KB.
- Existing Time Budget correctly survives lock/background/closing and reopening. Reader works on the iPhone. Daily Review is new and has no previous live verification.
- Coffee's unrelated documentation, personal backup and Excel additions remain untouched and excluded.

## Resume and remaining gates

1. Read `AGENTS.md`, `COMPASS.md`, this file and the authoritative `docs/pwa-consolidation-plan.md`.
2. All seven modules and combined backup are locally connected. Follow the exact current step above; completed checkpoints must not be repeated as implementation work.
3. Complete localization and remaining per-app audits sequentially; keep source assertions and appearance. All remaining gates are listed below.
4. Combined backup, legacy exporters, install assets and Plants/Coffee/Games localization are accepted locally. Finish Piano and the remaining schema/concurrency/form/update/recovery audits. Real iPhone/Things/Readwise acceptance and original-app releases remain deferred and cannot be claimed passing from browser mocks.
5. Run `npm run verify` before claiming the local implementation complete. Keep unfinished acceptance contracts red; never waive them. Save local checkpoints; no remote work.

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
- Games: complete hardcoded English localization. Duplicate nested round/result/winner identities are now rejected during app/combined restore; retain that contract in final checks. Shared Game clocks intentionally derive from the original session start; history timing corrections/overrides remain explicit.
- Plants: authored-content localization and numeric/source-preservation contracts pass; include derived draft controls in the final all-app review.
- Time Budget: finish English/Spanish text, 320px/all-form derived state and explicit stale-draft discard/notification lifecycle audits. Original active-state exporter is prepared and tested; release is deferred.
- Across all apps: finish stale-view/concurrency, nested schemas/recovery and worker/update/draft audits. Combined restore, all four legacy exporters and PNG/Apple install assets are locally verified; physical-device and original-app release acceptance remain deferred. Run final full verification after localization/audit changes.

## Time Budget work after Games checkpoint `46e3049`

- Source `timeBudget` at `fb9e9be86325d900e64aeda59faad4215cc1d5a9`; read actual source because its README is outdated about active persistence. Eight domain and eight browser cases pass against the unchanged source (`baseline-time-budget.txt`). The initial exact-minute mismatch was an advancing clock fixture, corrected by pausing it.
- Missing native app/UI produced recorded red. The original interface was split into native methods with scoped DOM/CSS and delegated allowlisted controls. One manifest/worker remains. Original plan/template/order/timer/queue/notification behavior is retained, with immediate timestamp saves instead of five-second autosaves. Leaving/reloading/ticking does not write or pause.
- Nine service cases cover read-only startup, atomic session/activity saves, independent countdowns, quota/stale protection, legacy merge/migration restore, preview tampering/future data and countdown backup restoration. A full Time Budget export contains templates, active task/timing and countdowns. Its restore is atomic and leaves other apps/language intact.
- Nine added browser cases cover Home timing, multiple countdowns, setup/queue language drafts, pending overtime reload, protected imports, negative/fractional reduction rejection, failed saves and phone/offline reopening. Negative reductions first fail visibly in `time-budget-recovery-red.txt` (16 pass, one fail); the correction retains a minimum minute per remaining task.
- Final updated suite passes (`reports/time-budget-ui.txt`): 17 unit + 17 browser. The active-plan import control is visibly accessible and protected by recovery confirmation. Full lint, 412-file native syntax and preparation of 323 native files/assets pass. The phone screenshot was reviewed with animations disabled. Sequential regressions all pass: General 65 unit + 19 browser, Plants 23 + 11, Coffee 17 + 28, Games 15 + 30. Reports use the `-with-time-budget.txt` suffix.
- Original template export format/filename is retained; migration/full recovery exports are separate. The new backup import file control is visible while a plan runs. Full translation of the original English interface, legacy active-state exporter, notifications/toast lifecycle audit and physical iPhone acceptance remain final gates.

## Piano core in progress (after Time Budget checkpoint `b3726a7`)

- Read original/module rules and focused entry/router/practice/navigation/exercise/auto-advance/learning/keyboard/rootless/suspension/ear-training docs. Source commit `3fc564302b2c10642315d97a603aeba3c73a6ed0`; original 41 unit and broad browser/offline baselines already pass in the retained baseline reports. Originals remain untouched.
- Added eight storage/continuation service tests and six new browser acceptance cases before piano implementation. `piano-persistence-red.txt` and `piano-continuation-red.txt` record the missing features. The runner now discovers 49 piano unit cases and six extra browser cases, retaining both original browser scripts. New browser cases explicitly require continuing across Home/hidden/reload, explicit pause/finish, an offer of the existing session, stable random/last links and shared-worker offline resumption.
- Ported all original musical modules, 53 tracked audio/image assets, keyboard rendering, pure exercise-card renderers, session allocation and navigation catalog. Catalog chunks satisfy file limits; prompt generation dispatch/helpers satisfy complexity limits. Original musical assertions remain; only `computeGuideTonesMotion`'s five-argument internal API became `(from, to, resolutions)`, with the original baseline call boundary retained in its test helper. Source mapping is in `reports/piano-source-map.json`.
- `reports/piano-core-unit.txt`: 38 original music/rendering/allocation cases pass. `piano-core-full-unit.txt` now passes 47 of 49: the catalog/library consistency case also passes, while the loader-file and old worker-inventory cases still fail as their integration is pending. `reports/piano-persistence.txt`: all eight new service cases pass. Full-scope lint passes (`piano-core-lint.txt`), and native syntax checks pass for 451 files (`piano-core-syntax.txt`). The adapted motion helper also passes its two original-source baseline cases (`baseline-piano-motion.txt`). Full piano/browser and whole migration remain incomplete.
- New service persists practice/block time, prompt/reveal state, pacing, settings, last exercise and finished practice records atomically with shared activities. Snapshot/tick/read operations never save. Seeded singleton selections reuse the original prompt/music calculations so missed automatic prompts reconstruct consistently without changing global randomness or saving every tick. Paused prompt remainder survives; total/block limits never finish automatically.
- **Exact next work:** add the native practice UI and remaining source pages/components under `modules/piano/src/js/`, then root mount/router/widget integration. `src/js/components/practice-session.js` currently exports allocation only; `exercise-shell.js` currently exports its two pure render helpers only. Preserve original pedagogical text and all source assertions. Add/adapt worker/canonical-route fixture assertions before removing the original private-worker expectations; replace the four approved hide/return/setup assumptions in `e2e/scenarios/pacing.mjs` with continuation assertions backed by the new acceptance cases. Original browser direct imports/routes and interval instrumentation need native-path/scope adapters, not weaker assertions.
- Root router currently has piano, pianoLearn and pianoExercise only; add catalog-backed library/reference routes rather than dropping theory/cards. Scope source CSS and clean up search/document listeners. Native legacy browser scripts currently use the default `/daily/` base and old hash routes; adapt explicitly while keeping baseline behavior selectable. Shared changes need general/affected regressions after integration.


## Piano mounted UI acceptance (2026-10-16)

- All original pages/components, scoped CSS and 53 audio/image assets are mounted under the shared router. Catalog routes include library/reference pages. Search/listener cleanup, original exercise controls, stable random/last links, practice resume and Course history are implemented. No private bootstrap/worker is installed. Source hashes and split destinations are recorded for all 135 original JS/CSS/assets in `piano-source-map.json`; useful keyboard/rootless/suspension/ear-training/modulation docs are retained under the module.
- Four Markdown characterization cases passed against source before parser splitting. Native worker inventory verifies generated shared assets; original baseline checks remain selectable. Current discovery is 53 unit and ten new browser cases; both original broad browser scripts also run. Source assertions remain, with native route/import adapters and the approved continuation changes.
- `piano-drafts-red.txt` records actual language-draft and checkbox rollback defects. Draft restoration now runs after async loading, including disclosures, validation and budget previews. Failed checkbox saves roll back visually; its fixture now clicks then verifies rollback. A loading status paragraph prevents source heading-readiness waits from matching loading text. Canonical phone fixtures reload explicitly to preserve original isolated navigation setup without cache-busting queries breaking hash-only audio cleanup.
- `piano-frozen-prompts-red.txt` catches the original plan mismatch (three missed automatic question advances while hidden); `piano-frozen-prompts.txt` passes after correction. Elapsed time is timestamp-derived. Visible presentation advances questions through saved transitions; hiding/navigation/reload retain the saved prompt/reveal without writes. Explicit pause preserves prompt remainder. Unsaved sub-question countdown progress may reset on navigation; elapsed practice and the saved question remain intact.
- `node scripts/test.mjs piano --report reports/piano-ui-verified.txt` completed successfully: 53 unit, ten native browser, original desktop lesson/library flows, phone lessons/exercises at 320/360/390px, local audio completion/cancellation, 360px touch swipe and shared-worker offline reload/reveal. Earlier `piano-ui.txt` and `piano-ui-final.txt` are intermediate failed reports, superseded by this complete green run. These checks do not establish physical iPhone acceptance.
- Full-scope lint and 612-file syntax checks pass (`piano-final-lint.txt`, `piano-final-syntax.txt`). Sequential regressions all pass: General 65 unit + 19 browser, Plants 23 + 11, Coffee 17 + 28, Games 15 + 30 and Time Budget 17 + 17 (the `-with-piano.txt` reports). Static preparation passes with 576 native files/assets (`piano-final-build.txt`). Reader characterization/implementation is next. Full localization, nested backup validation, legacy exporters and physical-device gates remain open.


## Reader core in progress (after piano checkpoint `cda9fc0`)

- Downloaded the original source anonymously after the Codespaces credential was rejected. It is pinned to `b3892b2417b8167d0cd063c31b2b69da781fd4a9` at `/workspaces/.daily-reader-source`; the existing source has no tests/rules. No source changes, push, hosting or authenticated Readwise calls occurred.
- Added 12 unit characterization cases before implementation; they pass against source (`baseline-reading-characterization.txt`). Five browser workflows then passed against the unchanged app (`baseline-reading-browser.txt`). The native missing module/UI failures are recorded in `reading-characterization-red.txt` and `reading-ui-red.txt`.
- Six new domain contracts and six root/credential/concurrency contracts also preceded their implementations (`reading-contracts-red.txt`, `reading-persistence-red.txt`). Native all-24 unit checks pass (`reading-storage.txt`), and strict full-scope lint passes (`reading-storage-lint.txt`); 629 native JavaScript files pass syntax checks (`reading-core-syntax.txt`). Source sampling, duration, priority, metadata, URL and cache assertions remain, with explicit custom-count/unknown-duration behavior additions.
- Native service saves settings/picks/last item with module revision checks and preserves unrelated data. Tokens use separate optional credential keys and memory by default; changing/forgetting accounts clears personal picks/cache. Pending results cannot overwrite changed account/preferences. Current metadata cache is memory-only; UI, persisted disposable cache, rate limiting/cooldown, full request timeout composition, last-item revalidation, Daily Review/Q&A/fallback, central settings, widgets, imports and offline acceptance are unfinished.
- Official API docs rechecked on 2026-10-16. Keep real requests and success/failure handling for the user's later private token test. Public docs still do not establish structured Q&A or per-card feedback semantics; use the agreed direct-review fallback without invented scheduling or content.
- **Exact next step:** add tests for rate/Retry-After/timeout behavior, last-item revalidation, review/fallback and shared UI contracts, then implement those features and port source HTML/CSS under a scoped Reader wrapper. Run the five source browser assertions through the mounted app before claiming UI parity. `scripts/discovery.mjs` expects 24 unit / five browser cases currently; update counts as contracts are added. The full Reader suite must remain red while the UI is absent. Baseline static server session `45960` serves `/workspaces` on 8767. Original source is not a runtime dependency.


## Reader transport and picker UI in progress (after core checkpoint `21038b0`)

- Added four transport contracts before their implementations (`reading-transport-red.txt`): partial-page scan allowances, local 20/minute rolling limit, Retry-After cooldown and deadlines composed with caller cancellation. All 28 native unit cases now pass (`reading-transport.txt`). One initial scan fixture incorrectly repeated its cursor; it now supplies distinct cursors while retaining the exact [100, 1] allowance assertion.
- Ported source HTML/CSS into a scoped Reader wrapper, preserving all five source-browser assertions. Added five shared UI contracts first (`reading-shared-ui-red.txt`): launch-only overrides, custom controls/policy, persistent picks without reshuffling, account forgetting and central shared preferences/language drafts.
- `reading-mounted.txt` caught an actual browser-only illegal fetch invocation caused by calling the native function as an options-object method. The default fetch is now bound to the browser global. `reading-picker-ui.txt` passes all 28 unit plus all ten browser cases, including the original five source workflows. Full-scope lint passes in `reading-ui-lint.txt`.
- Mounted picker and central preferences use the same settings; current picks are persistent and Home summaries navigate without automatically opening Reader. Tokens remain outside root data. Scoped original layout and custom count/time, uniform sampling, unknown-duration preference and ordered locations are present. The source browser baseline still runs against the untouched reference app on 8767.
- **Exact next work:** finish the required Daily Review client/view, pure capability-gated Q&A presenter and explicit direct-feedback fallback, with tests before implementation. Add last-item revalidation, persistence of disposable account caches, request freshness/truncation display, import/export, English/Spanish reader controls, before/after screenshots, offline/stale/quota coverage. Then run General and affected module regressions for shared mounts/settings/widgets and save a complete Reader checkpoint. Current picker UI is green but the entire reading plan is unfinished; no authenticated API/device acceptance is claimed.


## Reader UI / review / recovery checkpoint in progress (2026-10-16)

- Native source baseline now passes 12 unit + six browser cases (`baseline-reading-complete.txt`), including remembered-item revalidation and source phone capture. Native core/UI retains source assertions; custom count 1–20 and finite-budget unknown-duration rules have additional contracts.
- 48 native unit cases pass (`reading-backup.txt`). Disposable account-scoped Reader metadata and review caches use separate session keys; authoritative picks/preferences/remembered item remain in `daily:v1`. Cache timestamps and partial-scan warnings distinguish selection from fetch time. Forget removes credentials even when canonical record cleanup hits quota. Last-item revalidation removes finished/archived items without discarding prior state on errors.
- Daily Review uses actual documented GET/latest and explicit server-confirmed completion requests. Ordinary highlights remain ordinary; the pure capability-gated Q&A presenter has synthetic acceptance tests but public response support is not established. Never/Soon/Later/Someday hand off to Readwise; no invented scheduling or deletion. Independent widgets cannot block local apps.
- Reader and central settings share preferences; English/Spanish controls preserve fetched titles, invalid drafts and unsaved token input through language changes. Cached picks/review reopen offline, with explicit freshness/error labels. Stale settings and quota failures retain drafts and previous saved data. Root mount/widget integration changes are uncommitted and need General/affected module regressions.
- Native and legacy Reader imports validate before a read-only count preview, require recovery download before confirmation, preserve unrelated modules, reject tampering/stale confirmation and exclude tokens/cache from exports. New backup UI tests first failed on absent controls (`reading-backup-ui-red.txt`: 23 browser pass / two fail); implementation is now being verified.
- Exact next step: finish `reading-backup-ui.txt`, then record red and fix shortcut token-entry launch overrides, stale token-test responses and review language remount during completion (`e2e/request-lifecycle.spec.js`). Review widget freshness and account concurrency remain to audit. Update Reader Compass/behavior/source-map/test inventory, run full lint/syntax, General and affected regressions sequentially, then save a Reader checkpoint. Do not start WhatsApp before Reader acceptance. No live authentication, physical iPhone or whole-migration acceptance is claimed.

- Reader final verification update: `reading-final-ui.txt` passes all 51 unit and 28 browser cases. Full lint passes (`reading-final-lint.txt`); native syntax passes for 666 files (`reading-final-syntax.txt`). Original/native 390px phone screenshots were reviewed: source geometry/colors match, with the intentional Refresh control addition. `reading-account-freshness-red.txt` records actual cross-tab/TTL failures and `reading-account-freshness.txt` passes all 21 targeted cases. Epoch identity is attached to optional stored credentials so reopening an obsolete session does not revive its account.
- `reading-auth-race-red.txt` has 27 browser passes / one actual stale token-validation failure, with its corrected fixture. `reading-final-ui.txt` proves the guarded success path passes. Initial no-token dialogs now open only after DOM attachment; review remounts no longer replace a pending completion.
- Exact next step: finish `reading-shortcut-language-red.txt` (29 browser contracts), mark the resumed shortcut consumed before language remount, then run General and all affected module regressions sequentially. Update current evidence/counts and save the Reader integration checkpoint before WhatsApp.

- `reading-shortcut-language-red.txt` records 28 browser passes and one actual language-triggered reshuffle after a token-entry shortcut. The resumed run now sets the same consumed flag as an already-authenticated launch. `node scripts/test.mjs all --report reports/reader-shared-regressions.txt` is running sequentially (session `30159`). Expect WhatsApp to remain red because it is not implemented; assess each scope separately and do not claim a passing whole migration. Do not rebuild or run another browser suite until this session finishes.


## Reader local acceptance complete (2026-10-16)

- `reader-shared-regressions.txt` completed sequentially. General 65 unit + 19 browser, Plants 23 + 11, Coffee 17 + 28, Games 15 + 30, Time Budget 17 + 17, Piano 53 + ten native browser plus both broad original scripts, and Reader 51 + 29 all pass. Piano original scripts include 320/360/390px lesson/exercise pages, 44 library routes, real local audio completion/cancellation, native swipe and shared-worker offline reveal.
- The command exits nonzero only because WhatsApp's three copied tests fail on its absent `src/app.js` / private-worker replacement. These are unfinished work, not waived failures. No tests were skipped or assertions relaxed.
- Reader source/mounted phone comparison was reviewed. Full-scope strict lint, 666-file native syntax and static preparation of 613 files/assets pass (`reading-final-lint.txt`, `reading-final-syntax.txt`, `reading-final-build.txt`). API requests remain real, but tests use synthetic responses; no authenticated API/iPhone acceptance is claimed.
- Native interface, settings, shortcuts, metadata cache/freshness, remembered-item revalidation, latest Review/direct feedback, credential/account isolation, offline recovery and protected Reader backups are implemented. Compass/behavior/source-map/inventory are current. Full localization/recovery/concurrency/update audits across all apps remain Stage 8 gates.
- Exact next step: read WhatsApp's source and copied three tests, establish the unchanged baseline, add draft persistence/import/EN-ES/browser acceptance before implementation. Do not push, add workflows or deploy. Save another local checkpoint after WhatsApp acceptance.


## WhatsApp mounted work in progress (after Reader `571bb36`)

- Source commit `941d4cdb71dc38c4512bea836d4292dd8c96e541` at `/workspaces/schedule-whatsapp` is unchanged. All three copied source tests passed (`baseline-whatsapp.txt`) before implementation. New six service and six browser contracts first fail (`whatsapp-contracts-red.txt`); source-assertion adapter failures are retained separately (`whatsapp-adapters-red.txt`).
- Native pure link/date/text functions preserve nested encoding, Unicode, notes/title limits, future local time, four-zone formatting and DST-gap rejection. Source comments are documented rather than retained as lint exemptions. The source VM baseline still runs unchanged behavior. Native third-case handoff uses the actual controller and actual data service with a memory storage port; saved-draft projection replaces the old private-key assertion.
- A versioned root module persists incomplete/expired drafts, validates imported date/time structure without requiring future times, protects stale/quota writes and provides read-only/tamper/stale preview plus recovery-required replacement. Other modules and language are retained. Creation validates before clearing the draft atomically, then resets the composer and attempts Things. Failed saves keep draft controls and prevent handoff. Last submitted link remains available for clipboard/manual fallback during the page session, without claiming task creation.
- Native composer uses scoped source CSS and EN/ES, preserves user text, revalidates visible local time on resume and disposes its 15-second validation timer/listeners. No private worker/manifest is installed. Native worker assertions require shared-owned asset precaching, sibling cache retention, offline matching and external bypass; original PNG/private-worker assertions remain in source baseline. Proper shared PNG install assets remain Stage 8 work.
- `whatsapp-mounted.txt` passes six browser cases and nine real unit cases (the report also contains an accidental empty helper-file case, now removed from discovery). Full strict lint passes after extracting the shared utility-page map to keep complexity at eight (`whatsapp-mounted-lint.txt`). Phone/source characterization adds one more browser case, total seven. The first source browser attempt hit Chromium sandbox startup failure, not application behavior; the approved local browser command is rerunning it.
- Exact next step: finish source phone baseline (`baseline-whatsapp-complete.txt`, session `13970`), then rerun native WhatsApp nine-unit/seven-browser suite, inspect source/native phone captures, update Compass/behavior/source mapping/inventory and run full/shared checks sequentially. No remote writes or real Things/iPhone acceptance.

- WhatsApp acceptance update: `baseline-whatsapp-complete.txt` passes three source unit + one phone browser case after restarting the read-only workspace server (session `31948`, port 8767). `whatsapp-final-ui.txt` passes exactly nine native unit + seven browser cases. The scoped source light/dark styles pass at 320/390px; all handoff/copy/expired/stale/quota/import/offline flows pass.
- The offline Spanish 320px screenshot originally reused the English 390px comparison filename; it now uses `whatsapp-offline-phone.png`. Final root utility-page extraction and backup styling are being verified in `all-with-whatsapp.txt`. No code changes during this sequential full run. General/affected scopes must pass before saving the WhatsApp checkpoint.
- Exact next step: finish sessions `58650` (lint), `87244` (syntax), and `18546` (all scopes). Inspect the English source/native phone comparison, record full results, update status/docs/source map and commit WhatsApp locally. Then read the Stage 8 audit reminders and implement combined schema/recovery, legacy exporters, complete EN/ES, draft/update/concurrency policies and install assets. Actual iPhone/live API/Things acceptance stays deferred.

- Final audit finding while WhatsApp regressions run: the shell's bubbling `input` listener can mark an already autosaved composer dirty after its own handler clears the flag. This is conservative (navigation/Home and saved draft are safe) but can hold updates unnecessarily. Add a browser assertion and correct the ordering during the Stage 8 form/update audit; do not claim the complete update/form audit already passes. Also provide a clear/discard path after invalid file previews. No application/test code is changing during the current full run.


## WhatsApp local acceptance complete (2026-10-16)

- `all-with-whatsapp.txt` passes all scopes sequentially: General 65 unit + 19 browser; Plants 23 + 11; Coffee 17 + 28; Games 15 + 30; Time Budget 17 + 17; Piano 53 + ten native browser plus both original broad scripts; Reader 51 + 29; WhatsApp nine + seven. No skipped cases, softened thresholds or missing-module exceptions remain. This is local workflow evidence, not full Stage 8/device acceptance.
- `whatsapp-final-lint.txt` passes full-scope strict lint. `whatsapp-final-syntax.txt` checks 679 native JavaScript files. Static preparation passes (`whatsapp-final-build.txt`). The source/native English 390px comparison was reviewed: source layout, controls, colors and spacing are retained, with the added backup section. The Spanish offline 320px image now has its own filename. Source 320/390px light/dark checks also pass.
- Module behavior/Compass, source hashes/destinations and inventory are updated. Original apps/data remain untouched. No real Things/WhatsApp handoff or live API/iPhone acceptance was performed.
- Exact next step: Stage 8. Add the missing autosave-clean/failed-dirty update assertion and fix input-bubbling ordering; cover explicit discard after invalid previews. Then implement tested combined full-root export/preview/recovery/restore with all module schemas, references and running activities validated. Complete remaining EN/ES, legacy exporters, concurrency/stale policies, all-app form/update/offline audit and proper install assets. Run final full verification before declaring local implementation complete. No pushes, workflows or deployment.


## Stage 8: WhatsApp form/update audit (after checkpoint `2d42815`)

- Two new browser contracts first fail (`whatsapp-update-forms-red.txt`: seven pass/two fail). Successful autosaves were re-marked dirty by the shell's bubbling input handler, and invalid files hid their Cancel control. The first microtask correction still failed in the browser (`whatsapp-update-forms-microtask-red.txt`), exposing actual native event/microtask ordering.
- A generation-checked zero-delay task now releases a successfully saved form after event propagation and is canceled on disposal. Later failed inputs cannot be cleared by an older successful save. Quota/stale failures preserve dirty work; the save error is retained/translated through language changes instead of disappearing behind a global saved status. Invalid import Cancel is visible even without a valid preview and clears only that form.
- `whatsapp-update-forms.txt` passes all nine unit and nine browser cases. Full strict lint passes (`whatsapp-update-forms-lint.txt`). Phone screenshots disable finite animations for reliable comparison. Only WhatsApp code/tests and discovery counts changed; shared runtime remains at the all-green checkpoint. Full all-app checks are still required at the final Stage 8 gate.
- Exact next step: audit Reader invalid-import cancellation with a new browser contract before fixing it, then implement combined full-PWA export/validated preview/recovery/restore. Keep final localization/legacy exporters/schema/concurrency/install/device gates open. Do not push or deploy.


## Stage 8: Reader invalid import cancellation

- `reading-import-discard-red.txt` records 29 browser passes and an actual hidden-Cancel failure after invalid JSON. The import Cancel control is now independent of preview validity, with owned file-state cleared on cancellation. It survives language remounts and does not clear unsaved token/preference drafts or mutate module records.
- `reading-import-discard.txt` passes 51 unit + 30 browser cases; full strict lint passes (`reading-import-discard-lint.txt`). WhatsApp's corresponding fix is committed as `a3f8a61`. Shared runtime remains at the all-green `2d42815` checkpoint.
- Exact next step: implement combined full-PWA export/preview/recovery/restore with runtime validators for all seven modules plus activities, explicit schema/version/unknown-module rejection, nested references and running activity consistency. Add new unit/browser contracts before code. Then complete remaining nested-schema, localization, legacy-exporter, stale/concurrency/form/update/offline and install/device documentation gates. No deployment or real-token/device testing.


## Stage 8: combined PWA backup and restore (in progress)

- Nine new unit and four mounted browser contracts were recorded red before implementation (`combined-backup-red.txt`, `combined-backup-browser-red.txt`). Synthetic fixture data covers every module, Unicode, Spanish preferences/layout, running budget/game/piano sessions and a countdown; no personal data or network token is used.
- The backup service exports all saved root data, omitting separate credentials/caches. Preview validates known root/module schemas, nested domain references and active session/activity mirrors. Private preview identity/content/root fingerprints reject tampering, reuse and newer edits. Restore commits the entire incoming root once and preserves original timer timestamps. Failed primary/recovery writes retain existing records and credentials. Credential cleanup occurs only after commit; a cleanup failure is reported honestly as restored data with a warning.
- `combined-backup-nested-red.txt` exposed duplicate nested game rounds accepted by the prior validator. Games now rejects duplicate round IDs/numbers, result player IDs and winner IDs. The dedicated contract first failed (`games-nested-ids-red.txt`); all nine combined-backup plus eight Games service tests pass (`combined-backup-service.txt`). Full Games scope is now 16 unit + 30 browser; its complete regression run is pending.
- Settings provides full backup, recovery download, read-only collection preview, cancellation and explicit replacement confirmation. Recovery download is required before confirmation; changing files resets the requirement. Legacy import links remain app-specific. General 74 unit + 23 browser pass (`combined-backup-ui.txt`), including separate-profile all-app restore, stale/quota failures, credential exclusion and cleanup warning. Full strict lint passes (`combined-backup-ui-lint.txt`).
- One additional browser contract checks that a confirmed replacement also discards Time Budget's retained setup drafts. The initial report (`combined-backup-drafts-red.txt`) failed because a fresh read-only root was incorrectly obtained from an unwritten localStorage key. The corrected fixture reads the actual state snapshot and demonstrates the old setup reappearing (`combined-backup-drafts-fixture-red.txt`: 23 pass/one fail). Restore now resets every retained app UI object and clears obsolete save errors; the new contract passes in the current full run. Do not treat the fixture failure as a demonstrated product defect.
- `docs/storage-and-migrations.md` now describes the combined feature, atomic replacement/recovery and limitations. This shared shell change still requires affected/full regressions before a completed checkpoint. Final install/localization/exporter/concurrency/device gates remain open.


## Combined backup local acceptance complete

- `node scripts/test.mjs all --report reports/combined-backup-all.txt` exits zero: General 74 unit + 24 browser; Plants 23 + 11; Coffee 17 + 28; Games 16 + 30; Time Budget 17 + 17; Piano 53 + ten native browser cases and both broad original scripts; Reader 51 + 30; WhatsApp nine + nine. No skipped tests or relaxed thresholds.
- The corrected retained-draft test first fails on the actual old setup value. Successful replacement now resets shared/module, Time Budget and Games UI state, clears obsolete save errors and remounts with imported preferences. Failed replacement retains forms, records and credentials. All earlier source assertions remain.
- Storage/testing/platform/device docs and source test inventory are updated. The device guide now describes later installation, per-app migration, full restore, token reentry and background/update checks without claiming a deployment or real-device results.
- Next: shared PNG/Apple install assets, then remaining localization/exporter/schema/concurrency/form/update gates sequentially. Final whole-migration acceptance is not claimed.


## Stage 8: install icon contracts

- Combined backup checkpoint: `da523d1`; all-app regression, strict lint, 688-file syntax and preparation of 629 assets pass. No remote writes.
- New static-output contract requires shared 192/512px PNG icons, a 512px maskable icon, a 180px Apple touch icon, subpath-safe HTML links and owned offline precaching. The browser contract additionally decodes the actual images and verifies opaque square pixels. SVG favicon coverage remains.
- `install-icons-red.txt` is running before implementation. Expected discovery is 75 General unit + 24 browser cases. Do not weaken original WhatsApp source PNG assertions; its native replacement contract still accepts the shared favicon.

- Install red evidence completed: one new unit contract and the augmented install browser contract fail on absent PNG/Apple assets (`install-icons-red.txt`); the remaining 74 unit and 23 browser cases pass. `scripts/icons.mjs` now generates opaque 192/512px PNGs and a 180px Apple touch icon from the shared geometric d/blue-dot identity using Node built-ins. Manifest includes explicit any/maskable PNG entries and retains the SVG favicon. Every generated icon is included in the owned offline asset list/digest.
- The rendered 512px icon was visually reviewed. Initial General passes all 75 unit/24 browser cases (`install-icons-general.txt`), including actual browser image decoding and opaque dimensions. Follow-up verification additionally switches offline before decoding and asserts PNG cache entries; no physical iPhone installation claim.


## Shared install assets local acceptance complete

- `install-icons-offline.txt` passes General 75 unit + 24 browser cases, including real image decoding with the browser offline, PNG cache ownership and subpath-safe touch links. `install-icons-whatsapp.txt` passes nine unit + nine browser cases, retaining original/native asset and worker assertions.
- Full strict lint and 689-file native syntax checks pass (`install-icons-final-lint.txt`, `install-icons-syntax.txt`). Static preparation is saved in `install-icons-build.txt`. Rendered 512px icon reviewed; no external generator, browser runtime dependency or branding from a source app was added.
- The immediately preceding all-app regression remains `combined-backup-all.txt` at `da523d1`; only install generation, HTML metadata and associated contracts/docs changed afterward. Physical installation still requires later iPhone evidence.


## Stage 8: legacy Time Budget export preparation

- Three native import/export contracts first fail on the absent exporter (`legacy-budget-red.txt`). They now pass (`legacy-budget-unit.txt`): running/paused original clocks survive actual Daily import, missing keys remain unwritten, stable session identity is supplied, malformed or blocked storage does not reset data, and only the original app's two data keys are read.
- A new General browser contract first fails on absent standalone files (`legacy-budget-browser-red.txt`). The prepared EN/ES export page passes preview/download, original timing import, source-storage equality and 320px overflow checks. Its first implemented run (`legacy-budget-general.txt`) fails only because the Spanish error matcher expected different wording; it is corrected in the pending final run. Do not label that grammar mismatch a product failure.
- `legacy-budget-patch-red.txt` records the missing preparation script. The preparation test passes in `legacy-budget-patch.txt`: apply only in a temporary source copy, verify every packaged file, and reject changed HTML without replacing an existing patch. `npm run prepare:legacy-budget` prepares `legacy/patches/timeBudget-export.patch`; a separate `git apply --check` against `/workspaces/timeBudget` exits zero. The original repository is only read.
- The standalone validator is a version-1 copy of the native validator, checked byte-for-byte before patch preparation. Native syntax checking now includes all legacy JS artifacts. These files do not enter Daily's static/runtime asset output.
- Use the exporter from inside the old installed app only after a later authorized release of the patch. A separate Safari tab or downloaded HTML file does not establish access to installed storage. Initial online loading is required. No iPhone, original-app release or real-data migration is claimed. See `legacy/exporters/time-budget/README.md`.


## Legacy Time Budget exporter local acceptance complete

- `legacy-budget-final-general.txt` passes 76 unit + 25 browser cases. `legacy-budget-time.txt` passes 20 unit + 17 browser cases. Strict lint and 696-file syntax pass; syntax discovery now includes standalone legacy artifacts. Static preparation still contains only Daily's 632 owned assets; the exporter and patch remain outside runtime output.
- The initial implemented browser failure was only a Spanish wording matcher; the final contract passes actual preview, language change, Unicode download, import into Daily, source-storage equality, 320px layout and malformed-data refusal.
- `legacy/patches/timeBudget-export.patch` is regenerated from the reviewed files and passes `git apply --check` against the unchanged original. Packaging applies only in disposable tests. Product privacy copy uses plain language; documentation retains the exact key/schema details.
- Next: Plants legacy records plus Things preferences, then Reader and WhatsApp exporters, sequentially. Complete full localization and final schema/concurrency/form/update audits; physical checks and old-app releases remain deferred.


## Stage 8: legacy Plants exporter in progress

- Three unit contracts first fail on the missing exporter (`legacy-plants-red.txt`) and now pass (`legacy-plants-unit.txt`). Both bare arrays and checksummed envelopes preserve records, history, manual dates and Things preferences through actual Daily import. Original data and all unrelated keys are untouched.
- Read-only fallback follows the original priority: primary, pending, backup 1, backup 2. Damaged snapshots never trigger original repair writes. With no readable copy, export fails rather than returning empty data. Unknown/future versions stop before older recovery fallback; invalid Things settings or blocked storage also fail unchanged.
- General's new phone browser contract first fails on missing page files (`legacy-plants-browser-red.txt`). It now verifies 320px layout, EN/ES preview, project name, credential-free download, actual native import, unchanged source storage and an explicit recovery-copy label. Its current run is pending.
- `legacy-plants-patch-red.txt` records a named missing-script failure before preparation. `legacy-plants-patch.txt` passes patch application only in a temporary fixture copy. `npm run prepare:legacy-plants` creates `legacy/patches/stillgreen-export.patch`; `git apply --check` against the original Stillgreen exits zero. Original commit/checksum and keys are pinned in exporter provenance. No original files are changed.
- Native syntax discovery includes all standalone files; copied version-1 constants/envelope/validator must match native schemas before packaging. Artifacts stay outside Daily's static output. See `legacy/exporters/plants/README.md` for the separate installed-context and later-release requirements.


## Legacy Plants exporter local acceptance complete

- General passes 77 unit + 26 browser (`legacy-plants-general.txt`); Plants passes 26 unit + 11 browser (`legacy-plants-scope.txt`). Full strict lint, 705-file syntax and static preparation pass. The standalone exporter remains outside Daily's 632 owned runtime assets.
- The prepared patch passes against original Stillgreen without modifying it. Existing source tests/appearance remain unchanged. Temporary packaging, actual synthetic native import, Things preferences, recovery order, future downgrade rejection and phone/EN-ES behavior are verified locally. Installed migration and release remain deferred.
- Next: Reader legacy preferences and optional remembered item, with strict field allowlists and no token/cache exports. Then WhatsApp draft. Complete remaining authored-content localization and final schema/concurrency/form/update/device gates before claiming the local implementation complete.


## Stage 8: legacy Reader exporter in progress

- Three unit contracts first fail on the missing exporter (`legacy-reader-red.txt`), then pass (`legacy-reader-unit.txt`). Both saved-settings formats import through the real Daily adapter. Strict preference/document allowlists omit token properties, cache records and article bodies. Token/cache keys are never read. Remembered metadata is read only when enabled, with a valid safe URL; disabled or missing data is not initialized.
- Invalid current settings do not fall back to old preferences or reset original data. Malformed JSON/remembered items and blocked storage fail without writes/deletion. The exported wrapper is `reader-picker`, schema version 1. Original transient picks and disposable caches are excluded.
- Phone/EN-ES/literal-title/download/native-import/storage-preservation browser coverage is authored before UI (`legacy-reader-browser-red.txt`); its implemented run is pending. A separate source HTML fixture and pinned checkout provenance contain no personal records.
- `legacy-reader-patch-red.txt` records missing preparation. Packaging passes (`legacy-reader-patch.txt`), applies only to a temporary source copy and rejects changed HTML. `npm run prepare:legacy-reader` creates `legacy/patches/random-readwise-export.patch`; the unchanged pinned checkout passes `git apply --check`. No original file is changed or released.
- Settings/document schemas are copied and checked against native files before preparation; artifacts stay outside Daily runtime output. See `legacy/exporters/reader/README.md` for the later installed-context and private token reentry requirements.


## Legacy Reader exporter local acceptance complete

- General passes 78 unit + 27 browser (`legacy-reader-general.txt`); Reader passes 54 unit + 30 browser (`legacy-reader-scope.txt`). Full lint, 714-file syntax, static preparation and pinned-checkout patch check pass. No source assertions were changed.
- Token/cache keys remain unread, including when old settings contain embedded credential properties. Export retains only preferences and optional minimized remembered metadata; actual native import and safe literal title rendering pass. No token, body or cached response is exported, no API call is made, and original keys remain unchanged.
- Prepared files and patch remain outside Daily's runtime output and have not been released. Next: WhatsApp saved-draft exporter, then final content localization and schema/concurrency/form/update audit. Physical acceptance stays deferred.


## Stage 8: legacy WhatsApp exporter in progress

- Three domain contracts first fail on the missing exporter (`legacy-whatsapp-red.txt`), then pass (`legacy-whatsapp-unit.txt`). Export reads only the original draft key and whitelists its four fields. Expired dates, Unicode/newlines and incomplete values survive real Daily import without rescheduling; empty/null drafts remain absent, extra handoff/credential fields are excluded, invalid data and blocked storage fail unchanged.
- Phone/EN-ES/plain-text message/download/storage-preservation coverage was authored before UI (`legacy-whatsapp-browser-red.txt`). The implemented General run is pending. No Things URL or external handoff is created by this exporter.
- Packaging first fails on the absent preparation script (`legacy-whatsapp-patch-red.txt`), then passes (`legacy-whatsapp-patch.txt`) in a disposable copy. `npm run prepare:legacy-whatsapp` produces `legacy/patches/schedule-whatsapp-export.patch`; its original-source dry check passes. A nested display ternary was split to retain strict lint. Source repos remain read-only; artifacts stay outside Daily runtime output.
- Shared instructions are now routed through `docs/legacy-exporters.md`, with each app's specific contract in its exporter README. Actual installed migration/release stays deferred; no personal files or token are requested.

- WhatsApp's implemented exporter browser contract passes in `legacy-whatsapp-general.txt`, but General exits nonzero on the existing midnight fixture: 27 browser cases pass and the initial pre-midnight assertion fails. Its advancing clock started only two seconds before midnight, allowing a slower navigation to cross the boundary before the first assertion. The fixture now pins UTC and pauses at the original pre-midnight instant until the explicit four-second fast-forward. All original before/after/storage assertions are retained. Runtime calendar code is unchanged; the corrected General run is pending.


## All required legacy exporters prepared locally

- WhatsApp passes all 12 unit/nine browser cases (`legacy-whatsapp-scope.txt`); General passes 79 unit/28 browser (`legacy-whatsapp-final-general.txt`). Full strict lint, 721-file syntax, static preparation and unchanged-source patch check pass. The earlier General failure is documented as an advancing midnight fixture race; all domain assertions remain and runtime calendar is unchanged.
- Time Budget, Plants/Things, Reader preferences/remembered metadata and WhatsApp drafts now have standalone EN/ES exporters and reviewable patches. Originals/installations remain unchanged. Shared release/context instructions live in `docs/legacy-exporters.md`; app-specific contracts stay in their README files. No GitHub workflow, push or deployment was performed.
- Next: remaining authored-content localization (Plants, then other apps one at a time), final nested-schema/concurrency/form/update/recovery audit and full verification. Real-device/API and original-app release gates remain deferred.


## Stage 8: Plants authored-content localization in progress

- Two content unit and two browser contracts precede implementation (`plants-localization-red.txt`): missing localized lookup and English defaults/guides fail; existing 26 unit and 11 browser cases remain. Original source assertions and schedules are unchanged.
- All 13 templates now have complete English notes/guides/alert arrays, with Spanish labels for the selection list. `plants-localization-unit.txt` passes full coverage, exact numeric-care figures, unchanged source Spanish text/schedules and detached-copy protection. Existing source data modules remain byte-for-byte unchanged; the localized lookup overlays authored text only.
- New template selections use the current interface language. After selection, form values belong to the user's draft and survive later language changes untranslated. Existing saved names/types/notes/history/schedules are never translated or rewritten. Detail guides use the current language without saving records. The new phone/offline contract checks those boundaries; its full module run is pending.
- Strict lint passes (`plants-localization-lint.txt`); syntax is running. Next: finish Plants and General sequentially, update source map/behavior/Compass/inventory and save a local checkpoint. Other app localization and final audits remain open.


## Plants authored localization local acceptance complete

- Plants passes 28 unit + 13 browser (`plants-localization-scope.txt`); General passes 79 unit + 28 browser (`plants-localization-general.txt`). Full strict lint, 737-file syntax and static preparation of 646 assets pass. No original template/source assertion or numeric schedule changed.
- Every authored note, guide section and alert for all 13 templates has English content; Spanish source content is retained exactly. Selection labels are localized. Detached-copy tests protect source data and check every numeric care figure. New template defaults follow the current language, while saved records and existing drafts remain verbatim through later changes.
- Offline 320px guides and shared language changes pass. Root module JSON remains unchanged through reading/navigation/localization; language updates affect preferences only. Behavior/Compass/source map/inventory are current.
- Next: Coffee locale/filter/tools/quota/toast audit, then Games/Time Budget/Piano localization and final cross-app/schema/concurrency/update/recovery verification. No release or physical acceptance is claimed.


## Stage 8: Coffee final audit in progress

- Five browser contracts fail against the prior implementation while all original 28 cases remain green (`coffee-final-audit-red.txt`). They cover filtered-list restoration, first tools Save/Skip quota handling and single replacement, notification translation/original expiry and Spanish import mode text. Original assertions are unchanged.
- Eleven service cases pass (`coffee-setup-unit.txt`), including two new atomic setup/quota cases. The standalone isolated child-process red report only identifies the failed test file; browser red evidence above captures the actual missing error UI.
- Active native Coffee regression is `coffee-final-audit-scope.txt` (19 unit, originally 33 browser). A sixth final browser contract now tests failed history view, deletion and export actions; discovery is updated to 34, but this last contract has not run yet. No acceptance claim until final run finishes.


## Coffee final-audit local workflow acceptance

- All 34 browser cases pass (`coffee-final-audit-scope.txt`) including the six new red-first contracts and all original source workflows; 20 unit pass (`coffee-final-audit-unit.txt`). The browser run contains the original 19-unit subset; the later added dictionary/error contract is included in the separate complete unit report.
- Atomic tools setup retains the original starter bean fields and creates no duplicate on repeat; failed Save/Skip keeps the setup form. Filtered history refreshes actual results, translated status and expanded state after shared-language restoration. Keyed notifications translate but retain their original expiry through remounts. Spanish preview modes/shared errors use dictionary copy; stored personal text is untouched. Failed view/delete/export actions show errors, retain records and emit no fake success/download.
- Dictionaries have 247 matching keys and matching interpolation parameters. Native validation/error translations fail first in `coffee-error-localization-red.txt`. Strict full lint passes; final shared regression/syntax/static preparation are pending.

- Final shared regression passes 79 unit + 28 browser (`coffee-final-audit-general.txt`). Full strict lint, 740-file syntax and static preparation of 647 assets pass. Coffee is ready for its local checkpoint. Next app: Games. No remote, physical-device or live-API acceptance is claimed.


## Stage 8: Games localization in progress

- Three new Spanish browser contracts and one pure translation contract precede implementation (`games-localization-red.txt`, `games-localization-unit-red.txt`). Original 30 browser cases remain green. First native attempt passes Spanish offline 320px management/history/stats/settings navigation, but two desktop tests selected the hidden mobile navigation (`games-localization-scope.txt`); corrected to the visible desktop button, with no assertion or runtime weakening.
- Explicit source-copy translation calls cover authored labels, scoring modes, dynamic round/winner/filter/duration summaries, date locale, confirmation dialogs, notification titles/body and shared/import validation messages. They never scan or translate DOM text or stored player/game names and notes. Notification source messages translate during render while retaining existing expiry deadlines; backup reminder text is regenerated in the current language. Dictionaries and native error fragments are separate small modules.
- An additional failed-save draft/error remount contract is authored; `games-error-remount-red.txt` is active. Discovery now requires 17 unit + 34 browser. `games-localization-unit.txt` runs all 17 unit, including dictionary/interpolation identity, untranslated literal user names and nested backup diagnostic localization. Finish this app before starting Time Budget.


## Games localization local workflow acceptance

- All 17 unit + 34 browser cases pass (`games-localization-scope.txt`), with original source assertions preserved. Full strict lint and 746-file syntax pass. All four new browser contracts pass: Spanish 320px offline route coverage with unchanged module JSON, scoring/finish/detail with English-looking personal names and notes preserved, notification/validation translation with original expiry, and persistent translated failed-save errors with unsaved draft retention.
- The final native dictionaries have 299 matching EN/ES keys and interpolation parameters. Backend scoring labels, participant snapshots, scoring rules, reference identities and session timestamps are unchanged. The explicit copy helper uses the mounted region language; no DOM text replacement and no translation of user records occurs.
- General regression is active in `games-localization-general.txt`; finish it, prepare static output and save Games before starting Time Budget. Full-PWA final verification and physical acceptance remain open.

- Final General regression passes 79 unit + 28 browser (`games-localization-general.txt`). Full strict lint, 746-file syntax and static preparation of 651 assets pass. Games is accepted locally. Next app: Time Budget. Physical/live API/Things/old-app release acceptance remains deferred.


## Stage 8: Time Budget localization in progress

- Two new pure/shared-language unit contracts and three browser contracts precede localization (`time-localization-unit-red.txt`, `time-localization-red.txt`). The latter fails the three missing Spanish cases plus the native stale-edit case updated to Spanish; all 16 remaining cases pass. Original eight source browser workflows/assertions remain unchanged. The native replacement keeps the same draft/data protection assertions and deliberately changes Save changes / changed to Guardar cambios / cambiado.
- Static markup now has explicit translation markers resolved before any user data is inserted. English output exactly matches the previous native markup SHA-256 `f95b39baab06f0e3821272e39e9fdf9605b6f069c217bdec0de1129e412bb30f`. Methods use explicit copy lookups; names/template keys/timestamps/scoring budgets stay verbatim. All 130 EN/ES keys/interpolation parameters and read-only shared-language access are checked.
- Queue edits/add forms/error state are captured semantically and rebuilt with current-language controls before restoring values; old HTML is no longer pasted back. Notification source messages/parameters/deadlines persist only in UI memory and translate without extending expiry.
- `time-localization-first.txt` passes 19 of 20 browser cases; the new 320px check exposes the original fixed module minimum inside Daily's padded parent. The region now fits its parent, with constrained backup/file/countdown controls rather than clipping overflow. New invalid/future-import cancellation retains data, cannot enable confirmation before a valid preview, ignores superseded/disposed file reads and clears successful file selections.
- `time-localization-scope.txt` is running (22 unit + 20 browser). Native syntax/lint are running independently. Do not start Piano or another browser/build until this scope finishes.

- Time Budget additionally has a red-first fourth browser case for slow/superseded/canceled file reads (`time-import-race-red.txt`). The old generic timer-action duplicate guard discarded a newer file selection. Import reads now bypass only this gate and keep request identity validation; other timer actions remain protected. The final 22-unit/21-browser run is active. Three focused recovery cases pass after resuming notice expiry on import reload (`time-reload-notices.txt`).


## Time Budget localization and import lifecycle accepted locally

- Final `time-localization-scope.txt` passes all 22 unit + 21 browser cases, including slow-file supersession/cancellation, all original source workflows and the translated native stale-save contract. General passes 79 unit + 28 browser (`time-localization-general.txt`). Full strict lint, 752-file syntax and static preparation of 655 assets pass. No skipped tests or relaxed thresholds.
- English main-layout bytes remain identical to the prior native template. User names/template keys, timer deadlines/timestamps, numeric budgets and activity semantics are unchanged. Spanish offline 320px controls, overtime/reallocation, semantic queue draft restoration, exact notification expiry, invalid import cancellation and clearing successful selections pass.
- The import race is reproduced before correction in `time-import-race-red.txt`; only file imports bypass the generic duplicate-click guard. Request identities reject superseded/canceled/disposed reads. The three focused recovery cases additionally pass in `time-reload-notices.txt`.
- Next: Piano authored-content/control localization, then final schema/concurrency/form/update/recovery audit and full verification. Physical-device/API/Things checks and original-app releases remain deferred.


## Stage 8: Piano localization in progress

- Three unit contracts and three browser contracts precede implementation (`piano-localization-unit-red.txt`, active `piano-localization-red.txt`). They require authored-copy coverage, all ten localized lessons preserving musical/structural data and source immutability, canonical prompt preservation, Spanish running practice/elapsed timing, every destination offline at 320px and Spanish lesson/reference search. Discovery now requires 56 unit and 13 native browser cases, plus both original scripts. No original assertion changed.
- Initial inventory has 931 source-copy keys (`reports/piano-copy-inventory.json`). Dictionaries `src/translations/copy0.js`–`copy3.js` contain the first 640 Spanish entries; more copy and runtime integration are still missing. Preserve originals/generators and translate only owned presentation data; note spellings, keyboard pitches/ranges, formulas, route/filter IDs and saved prompt/timestamp records stay canonical.
- Found existing incorrect parent-key directions in four authored mode hints: E Phrygian→C is down M3, F Lydian→C down P4, G Mixolydian→C down P5, D Dorian→C down M2. B Locrian→C up m2 and A Aeolian→C up m3 are already correct. Add explicit regression coverage before correcting the four English fork descriptions; Spanish copy already uses the correct directions.
- Planned integration: explicit copy lookups for static presentation; immutable localized lesson overlays; pattern-aware presentation of canonical prompt strings; localized navigation/search terms. Markdown-authored theory needs extra inventory/translation without changing links/code notation. Nonguided-card state and remaining failure/draft/lifecycle checks still need audit.

## Piano localization implementation and active verification

- Complete authored EN/ES dictionaries, immutable localized lesson overlays, pattern-aware canonical prompt presentation, nine formatted Markdown theory modules, accessible controls, bilingual accent-insensitive search and Home authored lesson titles are implemented. The source-copy inventory records the reviewed corpus; unknown/custom activity names remain verbatim.
- Four modal parent-key descriptions now agree with their own existing examples (below rather than above); the transpose-based contract failed first. No numeric musical calculations changed.
- `piano-localization-all-unit.txt` passes 57 cases. The first full browser run passed all 13 then-current native cases. Stronger coverage found the inversion checkbox source label (fixed), Home activity title (red before fix), ordinary exercise state loss (red before fix) and embedded modulation HTML (first complete localized scope remains red until rerun).
- `exercise-state.js` retains ordinary question/reveal/mode/filter/pacing state and generated progressions only across language remounts. Route changes clear the snapshot; audio remains canceled. Active control styling now follows restored mode values. The new browser contract covers real selected keys, filters, reveal, inversion mode and generated progression identity.
- The current full scope is `piano-localization-scope.txt`, session 24490: 57 unit pass, 13/14 native browser pass with one embedded-modulation-copy failure fixed after that run built its assets; both broad original scripts are still running. Wait before rerunning the final scope. `piano-authored-html-unit.txt` passes the expanded authored-HTML structure/copy contract. Strict lint was passing before the last small presentation/contract changes; rerun it.

- Final Piano rerun: all 58 unit and 14 native browser cases pass. Both broad original scripts remain active in session 78295. `piano-modulation-copy-red.txt` preserves the prior genuine failure and passing broad scripts. The fifth new unit contract accepts every lesson prompt plus saved legacy wording, rejecting malformed tones/offsets/pitches and unrenderable timestamps. Current syntax checks 774 files; strict lint passes.

## Piano accepted local checkpoint

- `piano-localization-scope.txt` completes with all 58 unit, all 14 native browser cases and both original broad scripts passing. All 44 library routes, exact-octave reveals, three phone widths, all ten lesson flows, touch swipe, audio completion/cancellation and generated-worker offline reload pass. No original assertions were changed or skipped.
- `piano-localization-general.txt` passes General 79 unit/28 browser, including two-tab update protection. `piano-localization-lint.txt` passes; `piano-localization-syntax.txt` checks 774 files; `piano-localization-build.txt` prepares 674 assets. All sessions described as active in the historical Piano notes above have finished.
- Next: the Budget pending-permission lifecycle contract, remaining timestamp/recovery/concurrency audits and whole-PWA verification. Physical device/API/Things/coexistence acceptance remains deferred.

## Final Time Budget lifecycle audit (after Piano `6788dc2`)

- Two new browser contracts fail genuinely before correction: pending notification permission followed by Home navigation or a language remount starts a budget from the disposed page. `time-permission-lifecycle-red.txt` is still running in session 85819; both new cases failed while prior cases are passing.
- `startBudget.js` now checks disposal and data freshness after permission completes, before changing any session state. The existing request behavior is factored into a small helper to retain strict complexity limits. Strict lint passes in `time-permission-lifecycle-lint.txt`.
- A new native storage contract rejects finite but unrenderable timestamp/counter values before writes. `time-timestamp-bounds-red.txt` fails before the bound; `time-timestamp-bounds-unit.txt` passes all ten service contracts after correction. Discovery now requires 23 domain unit and 23 browser cases.
- Next: wait for session 85819 to finish before running `node scripts/test.mjs time-budget --report reports/time-permission-lifecycle-scope.txt`. Update module docs/mapping, save this local checkpoint, then continue remaining Reader/activity timestamp bounds and shared recovery/persistence/concurrency audit.

- Final Budget acceptance: `time-permission-lifecycle-scope.txt` passes 23 unit and 23 browser cases; lint passes. The first correction caught disposal but not a URL change before hashchange cleanup; `time-permission-navigation-race-red.txt` preserves that genuine remaining failure (22 existing cases pass). Capturing/checking the start route closes that gap; no assertions were weakened. Sessions 85819, 99385 and 93407 have all finished. Next: Reader final audit, sequentially.
