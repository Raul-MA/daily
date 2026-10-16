# Implementation progress

Updated: 2026-10-16. Repo: `/workspaces/daily`, branch `main`.

## Current instruction and exact next step

Work **locally only**, **plain HTML/CSS/JavaScript**, **one app at a time**. No workflows, pushes, Pages configuration or deployments. Keep real Readwise/Reader API calls for the user's later token test; unverified live access does not block implementation. Do not request personal tokens or backup files.

The shared platform, plants, Coffee, Games, Time Budget and piano have passing local workflow checks. Piano passes 53 unit cases, ten native browser cases and both retained original browser scripts; all five shared/affected regressions pass. **Exact next step: read Reader module/source docs and author its characterization tests before implementation.** Then complete Reader/Daily Review, WhatsApp and the final migration/localization gates, one app at a time. Coffee Excel remains excluded.

## Verified current work

| Scope | Result | Evidence |
| --- | --- | --- |
| General | 65 unit + 19 browser cases pass | `reports/platform-with-piano.txt` |
| Plants | 23 unit + 11 browser cases pass | `reports/plants-with-piano.txt` |
| Original plant care characterization | 8 additional cases pass against Stillgreen | `reports/baseline-plants-care.txt` |
| Strict full-scope lint | Pass | `reports/piano-final-lint.txt` |
| Native JS syntax | 612 files pass; this is not typechecking | `reports/piano-final-syntax.txt` |
| Static preparation | 576 unchanged native files/assets prepared | `reports/piano-final-build.txt` |
| Coffee | 17 unit + 28 browser cases pass | `reports/coffee-with-piano.txt` |
| Games | 15 unit + 30 browser cases pass | `reports/games-with-piano.txt` |
| Time Budget | 17 unit + 17 browser cases pass | `reports/time-budget-with-piano.txt` |
| Piano | 53 unit + ten native browser cases; original lesson/library/phone/audio and worker scripts pass | `reports/piano-ui-verified.txt` |
| Whole migration | Incomplete; reading, WhatsApp and final migration gates remain pending | Last full red evidence: `reports/red-all.txt` |

No skipped tests or relaxed lint thresholds. Original plant assertions remain unchanged. New-app parity is not established by original baseline results.

## Implemented

- Accessible hash-router shell, accepted three/two/one-column iOS dashboard, app menu, shared EN/ES, persisted widget order/visibility and quick-action settings. Dashboard links create no records or care events.
- Validated `daily:v1` root document, per-module adapters, recovery/corrupt preservation, future-version rejection and visible quota failures. Combined restore and remaining domain adapters are still pending.
- Timestamp activity registry: independent countdowns, singleton budget/game/piano, explicit pause/resume/completion and overdue reconstruction. Rendering/navigation never advances persisted state. Time Budget, Games and piano are integrated.
- One generated manifest and owned offline asset list. Authenticated/external requests bypass worker caches. Cached HTML remains with its matching asset version. Updates require every open same-app tab to report safe; blocked/unresponsive tabs hold activation. The two-tab browser test preserves settings and unsaved work through update acceptance.
- Local-midnight/calendar refresh with foreground/timezone checks and daylight-saving tests. In-memory dirty-form snapshots preserve values, file selection and focus through language changes. Plant/history stale edits retain drafts rather than overwriting newer records.
- Plants: list, stable detail/edit routes, templates, seasonal care, notes/history editing, skip/manual due dates, Things settings/exact shortcut payload, original/migration exports, preview/cancel/recovery before import, scoped source theme and offline care logging. Thirteen original guide/template data objects are preserved. Controls are EN/ES; authored guide paragraphs/descriptions remain Spanish for final content localization. See `modules/plants/docs/behavior.md` and `reports/plants-source-map.json`.
- Coffee: original drink/meta/grind/prep/composition/taste forms, beans, history filters/views/detail editing, insights, tools setup, scoped original theme, shared EN/ES, stable record/edit links, legacy JSON exports and preview/recovery/merge/replace imports. Duplicate/reference/nested-schema validation, read-only startup, quota errors, language draft restoration, stale-record/settings guards and offline checks are implemented. See `modules/coffee/docs/behavior.md` and `reports/coffee-source-map.json`.
- Piano: the complete Toniq lesson/exercise/reference library, local audio and diagrams, scoped source appearance, stable random/last links, timestamp practice, saved history, async language draft restoration and single-worker offline support. See `modules/piano/docs/behavior.md`. Authored text localization remains a final gate.
- Standalone connection diagnostic: explicit submission, memory-only token cleared from input, sequential real GET endpoints, timeout/status-only results and direct Daily Review fallback. Live authenticated access remains unverified.
- Five legacy worker-cleanup patches prepared and ownership-tested. Originals and installed workers remain unchanged; release/coexistence tests are deferred.

## User-confirmed facts

- All original apps export and restore successfully. Most backups have fewer than 50 entries and are approximately 20 KB. Do not ask to repeat these checks or provide personal exports. Synthetic storage fixtures exceed 140 KB.
- Existing Time Budget correctly survives lock/background/closing and reopening. Reader works on the iPhone. Daily Review is new and has no previous live verification.
- Coffee's unrelated documentation, personal backup and Excel additions remain untouched and excluded.

## Resume and remaining gates

1. Read `AGENTS.md`, `COMPASS.md`, this file and the authoritative `docs/pwa-consolidation-plan.md`.
2. Read Reader source/module docs and author characterization before implementing it. Preserve its settings, filters, picks, shortcuts and original appearance while moving persistence into Daily.
3. Time Budget and piano characterization/integration pass locally. Reader characterization and WhatsApp migration remain next, one app at a time.
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
- Time Budget: finish English/Spanish text, original active-state exporter, 320px/all-form derived state and explicit stale-draft discard/notification lifecycle audits.
- Across all apps: finish the documented stale-view/concurrency policy, combined root/per-module restore, legacy exporters, all-module worker/update/draft tests, proper install assets and physical-device checklist. None of these deferred gates is claimed complete by the scoped green reports.

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
