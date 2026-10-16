# Migration test inventory

Updated 2026-10-16. Original commits and SHA-256 values are in [source-tests.json](source-tests.json). No application logic was copied with these suites. Every fixture comes from source test literals, not personal backups.

## Source-to-destination mapping

| Source | Migrated files | Named source cases |
| --- | --- | --- |
| `stillgreen/tests/things.test.mjs` | `modules/plants/test/things.test.mjs` | 4 |
| `stillgreen/tests/store.test.mjs` | `modules/plants/test/store.test.mjs` | 3 |
| `coffee-tracker/e2e/history-detail.spec.js` | `modules/coffee/e2e/history-detail.spec.js` | 4 |
| `coffee-tracker/e2e/settings-data.spec.js` | `modules/coffee/e2e/backup.spec.js`, `modules/coffee/e2e/settings-data.spec.js` | 9 |
| `coffee-tracker/e2e/helpers.js` | `modules/coffee/e2e/helpers.js` | helper / standalone script |
| `coffee-tracker/e2e/new-shot.spec.js` | `modules/coffee/e2e/new-shot.spec.js` | 7 |
| `coffee-tracker/e2e/insights.spec.js` | `modules/coffee/e2e/insights.spec.js` | 1 |
| `game-tracker/e2e/helpers.js` | `modules/games/e2e/helpers.js` | helper / standalone script |
| `game-tracker/e2e/gameplay.spec.js` | `modules/games/e2e/gameplay-2.spec.js`, `modules/games/e2e/gameplay-3.spec.js`, `modules/games/e2e/gameplay-4.spec.js`, `modules/games/e2e/gameplay.spec.js` | 17 |
| `game-tracker/e2e/import-export.spec.js` | `modules/games/e2e/import-export.spec.js` | 2 |
| `game-tracker/e2e/settings.spec.js` | `modules/games/e2e/settings.spec.js` | 3 |
| `game-tracker/e2e/smoke.spec.js` | `modules/games/e2e/smoke.spec.js` | 2 |
| `toniq/tests/service-worker-smoke.mjs` | `modules/piano/e2e/service-worker-smoke.mjs` | helper / standalone script |
| `toniq/tests/navigation-data.test.mjs` | `modules/piano/test/navigation-data.test.mjs` | 2 |
| `toniq/tests/keyboard-diagram.test.mjs` | `modules/piano/test/keyboard-diagram.test.mjs` | 13 |
| `toniq/tests/suspended-chords.test.mjs` | `modules/piano/test/suspended-chords.test.mjs` | 1 |
| `toniq/tests/learning-path.test.mjs` | `modules/piano/test/learning-path.test.mjs` | 7 |
| `toniq/tests/browser-smoke.mjs` | `modules/piano/e2e/browser-smoke.mjs`, `modules/piano/e2e/scenarios/` | helper / standalone script |
| `toniq/tests/service-worker.test.mjs` | `modules/piano/test/service-worker.test.mjs` | 1 |
| `toniq/tests/rootless-keyboard.test.mjs` | `modules/piano/test/rootless-keyboard.test.mjs` | 4 |
| `toniq/tests/ear-training.test.mjs` | `modules/piano/test/ear-training.test.mjs` | 2 |
| `toniq/tests/practice-session.test.mjs` | `modules/piano/test/practice-session.test.mjs` | 3 |
| `toniq/tests/keyboard-motion.test.mjs` | `modules/piano/test/keyboard-motion.test.mjs` | 2 |
| `toniq/tests/music-foundations.test.mjs` | `modules/piano/test/music-foundations.test.mjs` | 6 |
| `schedule-whatsapp/tests.js` | `modules/whatsapp/test/tests.cjs` | helper / standalone script |

## Assertion preservation audit

Counts include Node `assert.*` and Playwright expectation matcher calls, across helpers and scenarios. They supplement baseline execution; counts alone cannot prove semantic parity.

| Module | Source assertion call sites | Migrated assertion call sites |
| --- | --- | --- |
| plants | 14 | 14 |
| coffee | 147 | 147 |
| games | 136 | 136 |
| piano | 275 | 275 |
| whatsapp | 37 | 37 |

## Additional fixture provenance

- `modules/coffee/e2e/testIds.js`: original coffee `frontend/app/testIds.js`, unchanged selector contract.
- Coffee entry fixture: original helper literal split into a separate file; overrides remain unchanged.
- Game storage-key fixture: resolved original `APP_ID` interpolation to the same literal key.
- Game `fixtures/gameplay-*.json`: original in-test object expressions evaluated with a synthetic `__NOW__` timestamp and the original session fixture functions; runtime substitution preserves timestamps.
- Piano and plant domain imports: test-only loader; absent exports throw, present files import normally.
- WhatsApp standalone assertions: wrapped into three discovered Node tests, with source-root-aware reads and the same VM behavior.
- Time Budget had no original suite; eight domain and eight browser characterization cases were authored and passed against the original before implementation. Reader now has additional authored source characterization and native acceptance cases. No cases are skipped or claimed to exist.

## Approved future differences

Piano continuation across hidden/navigation states is planned but not implemented. Keep old pause assertions until replacement acceptance tests are added. Consolidated manifest/cache scope and canonical routes also need replacement contracts before implementation.

## Source working-tree inventory

Coffee commit `8711d56c1330d6ce626662bbf98fb440eb2e10c4` has modified `COMPASS.md`, untracked `docs/`, an untracked personal JSON backup and `standalone_excel/`. These stayed untouched and were excluded. No original license files were found among the copied repositories; source ownership and commits remain recorded. Reader source commit `b3892b2417b8167d0cd063c31b2b69da781fd4a9` is pinned at `/workspaces/.daily-reader-source`; authored characterization now runs against it.

## Local platform and plants additions (2026-10-15)

- General suite: 65 unit cases and 19 browser cases. Root documents, router, preferences, activity timestamps, native static output, calendar, worker ownership and coordinated updates are covered. Vite/TypeScript were replaced only after equivalent native-JavaScript checks passed; runtime assertions were retained.
- Plants: original 7 cases / 14 assertion sites unchanged. Added 8 care/date characterization cases (also passing against original Stillgreen) and 8 shared-document/import cases. Added 11 browser workflows, including offline operation and draft/stale-edit safeguards.
- The observation browser flow was corrected to retain the source app's inline observation form and keyboard submit, rather than invent an extra reveal step. Stored-text assertions remain.
- New source mapping: `plants-source-map.json`. Original source files and installed apps remain unchanged. This is local verification, not full migration or physical-device acceptance.

## Coffee integration additions (2026-10-15)

- Original 21 browser workflows retain all 147 original assertion sites. Storage fixtures/readback now use `daily:v1.modules.coffee.data`; theme/language target the Coffee region and the reminder's first-child check targets `#coffee-content`.
- Valid import workflows explicitly preview, download recovery and confirm before the original completion assertions. The shared platform placeholder-heading assertion now checks the Coffee region and its actual first-run Tools heading; navigation-only and storage assertions remain.
- Eight domain cases passed against original Coffee (`baseline-coffee-domain.txt`), then failed on the absent module (`coffee-domain-red.txt`). Nine new service cases cover atomic language saves, references, duplicates, quota/future data and read-only/stale imports. Seven browser additions cover deep links, drafts, conflicts, cancel/future imports, quota errors, settings export drafts and offline/native appearance.
- Red evidence: `coffee-service-red.txt`, `coffee-import-red.txt`, `coffee-browser-red.txt`, `coffee-drafts-red.txt`, `coffee-validation-red.txt`, `coffee-offline-quota-red.txt`, `coffee-settings-draft-red.txt`, `coffee-navigation-red.txt`, `coffee-navigation-style-red.txt`. These show different increments; earlier passing subsets are not whole-migration acceptance.
- `coffee-source-map.json` records application sources and destinations. No original app, installed data, personal export or Excel code was modified/imported.


## Games integration additions (2026-10-15)

- Original 24 browser workflows retain 136 original assertion sites. Storage fixtures wrap the original domain shape in Daily and supply its active registry entry. Assertions read the same scores/settings/records from `modules.games.data`; private history/detail/settings URLs and global-theme selectors become native routes/scoped theme. Valid replacement imports explicitly preview, download recovery and confirm before original restore assertions.
- Eight data characterization cases pass against original Games (`baseline-games-domain.txt`), fail on the absent module (`games-domain-red.txt`) and pass against the refactor. `updateScore` takes a selection object to meet the parameter limit; only that baseline call boundary is adapted.
- Seven service cases first fail against the absent adapter (`games-service-red.txt`), then pass (`games-service.txt`, 15 unit cases including domain). Six new browser cases cover activity resume, language drafts/notification expiry, stale player edits, import cancel/history links, offline score/history/statistics and obsolete session links.
- Behavioral red evidence includes `games-browser-red.txt`, `games-focus-red.txt`, `games-drafts-red.txt` and `games-offline-links-red.txt`. The activity test's initial `running` widget selector was corrected to the existing `activities` ID, and its clock is paused before start so the 90-second UI assertion is deterministic. This fixture correction is not claimed as an implementation regression.
- Source code mapping: `games-source-map.json`; data/workflow invariants: `modules/games/docs/behavior.md`. Hardcoded original English labels still need full Stage 8 localization.

## Time Budget characterization and integration

Source `timeBudget` at `fb9e9be86325d900e64aeda59faad4215cc1d5a9`; hashes and implementation destinations are in [time-budget-source-map.json](time-budget-source-map.json). No personal fixtures are used.

- Eight domain cases run the actual original app object in an isolated VM with presentation callbacks stubbed, then the native composed app with the same assertions. They cover strict time input, overnight/reference anchoring, pending/free minutes, pause/resume, exact actual time, explicit completion/reallocation, queue order and template bounds/Unicode.
- Eight original browser workflows passed before porting (`baseline-time-budget.txt`). An initial run exposed an advancing test clock; pausing the installed clock made the exact minute assertions deterministic. No product assertions were removed. `--baseline` selects those eight original workflows and omits native service tests.
- Missing native app/UI produced red (`time-budget-ui-red.txt`); the original eight native workflows subsequently passed. Nine service cases and nine additional browser cases cover atomic state/activity writes, stale/failed saves, timestamp reconstruction across Home/reload, multiple countdowns, pending overtime recovery, language drafts, protected imports, phone layout and offline reopening.
- `time-budget-shell-red.txt` records the absent countdown interface and an offline fixture that initially blocked service workers. The worker fixture was corrected to permit the shared worker. `time-budget-recovery-red.txt` records the actual negative-reallocation defect (16 browser cases passed, one failed). `time-budget-countdown-backup-red.txt` records the missing countdown backup before its atomic restoration was added.
- Immediate timer saves replace the original five-second autosave gap; ticks and navigation are read-only. Pending overtime now survives reload. Invalid reductions are rejected. Imports now require preview/recovery/confirmation, and full exports include active state plus countdowns; legacy template export format/filename is preserved.
- Full translation of original English text and physical iPhone acceptance remain final gates.

## Piano mounted continuation and source parity

Eight service cases and the first six continuation browser cases preceded their implementation (`piano-persistence-red.txt`, `piano-continuation-red.txt`). Four Markdown characterization cases also passed against the original before refactoring. The total is now 53 unit cases: all original 41 plus these 12. Original-source motion tests retain their five-argument baseline boundary while native code receives source/target objects to satisfy the parameter policy.

Ten added browser cases now cover navigation/reload/hidden continuation, explicit pause/finish/history, stable random/last exercise links, offline answers, active/obsolete practice IDs, async language drafts, failed saves and hidden automatic prompts. `piano-drafts-red.txt` records draft/rollback defects. The failed-checkbox fixture now clicks then verifies rollback; Playwright uncheck itself requires a successful state change. `piano-frozen-prompts-red.txt` records an actual plan mismatch (three missed question advances while hidden), corrected with presentation-driven transitions while timestamp elapsed time continues.

Both original browser scripts remain, with all music/keyboard/reveal/filter/audio/cleanup assertions. `paths.mjs` maps canonical catalog IDs and import prefixes while retaining baseline mode. The old worker-inventory unit case verifies Daily's generated owned assets in native mode and the original worker in baseline mode. Original source pause-on-hide/loss-on-navigation assertions intentionally become continued-clock and resumed-session assertions. No Toniq worker is installed.

The loading placeholder is a status paragraph, so source heading-readiness waits only match actual pages. Original mobile fixtures use cache-busting queries for source runs; native runs reload the canonical base without that query. This preserves the original full-navigation test setup while allowing canonical shared hash links to stay in the same document, retaining the audio instrumentation across route cleanup. Product audio cleanup assertions are unchanged.

`piano-ui-verified.txt` is the complete passing full run. General, Plants, Coffee, Games and Time Budget regressions also pass in the `-with-piano.txt` reports. Source hashes, split destinations and all audio/image assets are recorded in `piano-source-map.json`. Original repos remain untouched. Authored content localization, combined import validation and physical-device acceptance are final gates.


## Reader characterization and mounted integration (2026-10-16)

Source commit `b3892b2417b8167d0cd063c31b2b69da781fd4a9` had no suite. Twelve unit characterization and six browser workflows pass against the unchanged source (`baseline-reading-complete.txt`). Source assertions remain in `test/domain.test.mjs`, `test/network.test.mjs` and `e2e/reader.spec.js`, through the baseline/native adapters in `test/source.mjs` and `e2e/fixtures.js`. Remembered-item revalidation was characterized against source before its native addition. Intentional custom-count support changes the invalid-count fixture from 2 to 21 while preserving fallback assertions and adding valid 2/20 coverage.

Native discovery is now **51 unit and 29 browser cases**. Added contracts cover custom/uniform/unknown-duration selection; strict schemas and bounded scans; root preservation, quota/stale/account cancellation; local request limits, Retry-After and composed deadlines; metadata/review cache isolation; selection versus fetch timestamps; last-item validation; explicit confirmed review completion, feedback handoff and capability-gated Q&A; native/legacy protected backup previews, tamper/stale rejection and credential privacy. Cross-tab account generation rejects obsolete late picks and session credentials after reopening. Review widget freshness refreshes after fifteen minutes without error retry loops.

Native browser additions cover launch-only filters, custom preferences, stable picks across Home/reload, separate token storage/forget, central settings and language/token/invalid drafts, cached offline picks/reviews, stale/quota recovery, recovery-required imports and token-free exports. Request lifecycle contracts cover token-entry shortcuts, stale token-test responses and completion during language changes. The auth fixture originally waited indefinitely on a fulfilled empty-204 response's `finished()`; it now waits for the response event and UI frames. `reading-auth-race-red.txt` records the actual obsolete-draft success defect (27 pass/one fail), rather than treating the earlier fixture timeout as behavioral evidence. The first no-token shortcut also exposed a real detached-dialog mount failure; opening is now deferred until attachment. `reading-request-lifecycle-red.txt` separately records review completion being replaced by a remount refresh.

`reading-backup-ui.txt` passes the earlier 48 unit/25 browser set. `reading-final-ui.txt` passes 51 unit/28 browser before the last shortcut contract. `reader-shared-regressions.txt` passes all 51 unit/29 browser cases and General/affected modules; only unfinished WhatsApp is red. All fixture tokens and API data are synthetic. No live authenticated/browser-origin/iPhone acceptance is claimed. Source phone and native phone screenshots preserve source layout, with the added explicit Refresh control. Source mapping is in `reading-source-map.json`; API, import and shortcut semantics are in `modules/reading/docs/behavior.md`.


## WhatsApp mounted migration (2026-10-16)

Original three cases pass before implementation (`baseline-whatsapp.txt`). New six service/six browser cases fail before implementation (`whatsapp-contracts-red.txt`); explicit native adapter failures are in `whatsapp-adapters-red.txt`. A seventh browser characterization now passes against the unchanged source (`baseline-whatsapp-complete.txt`: three unit/one browser), including 320/390px layout and light/dark colors. Source hashes and destinations are in `whatsapp-source-map.json`.

`test/tests.cjs` retains original encoding, Unicode, limit, four-zone/DST, future/local-time and handoff/copy assertions. Native reads the actual pure domain functions, and the handoff harness invokes the actual controller/data service via a memory port. Saved-draft projection replaces the private storage-key assertion. Original manifest PNG and private-worker assertions remain in baseline branches. Native `test/support/native.cjs` instead validates generated shared manifest/vector dimensions/asset existence/module CSS and shared cache ownership/offline/external bypass. This is the planned one-installation behavior change, not installation of an obsolete private worker. Proper shared PNG assets remain Stage 8.

Six new service cases cover read-only startup, incomplete/expired Unicode drafts, root preservation, stale/quota/future/invalid guards, legacy/native preview/tamper/stale/version checks and atomic restore/recovery. Seven browser cases cover source appearance and saved-draft language/Home/reload, exact handoff/copy/manual fallback, expired reminders, missed-storage-event conflicts/quota failures, preview/cancel/recovery and real shared-worker offline reopen. The stale fixture suppresses storage events before bootstrap to exercise a missed-event race; ordinarily clean autosaved forms adopt external changes. `all-with-whatsapp.txt` passes all nine unit/seven browser cases and every other scope. Full lint, 679-file syntax and static preparation pass. No real Things/WhatsApp task creation or iPhone acceptance is claimed.

Stage 8 adds two WhatsApp browser regressions before fixes: autosaved/failed drafts and update safety through language changes, plus cancellation after invalid file selection. `whatsapp-update-forms-red.txt` records seven pass/two fail. A microtask correction remains red in `whatsapp-update-forms-microtask-red.txt`; the guarded task correction passes all nine unit/nine browser cases in `whatsapp-update-forms.txt`. Earlier all-scope report retains the seven-browser checkpoint; current scoped counts are nine/nine. No assertions were relaxed.

Stage 8 adds one Reader browser contract for invalid-import cancellation through language changes while preserving token/preference drafts. `reading-import-discard-red.txt` records 29 pass/one fail; `reading-import-discard.txt` passes all 51 unit/30 browser after making Cancel independent of preview validity. No backend or shared runtime behavior changed.


## Combined backup / restore (Stage 8)

Nine unit contracts in `tests/general/backup.test.mjs` and four initial browser contracts in `tests/e2e/backup.spec.js` preceded their implementation (`combined-backup-red.txt`, `combined-backup-browser-red.txt`). Fixtures in `tests/fixtures/backup-data.mjs` use real module services with synthetic values and separate credential storage. They cover all seven apps, activities, Unicode, layout, Spanish preferences and original overdue timestamps; no personal exports or live responses are used.

`combined-backup-ui.txt` passes General 74 unit + 23 browser cases. A fifth backup browser contract demonstrates retained Time Budget setup surviving full restore after correcting its fresh-root fixture (`combined-backup-drafts-fixture-red.txt`: one actual failure). All retained UI state is now reset after replacement; General's 24 browser cases pass in the current full regression run. Games adds one unit case for unique nested round IDs/numbers, result players and winners; it first fails in `games-nested-ids-red.txt` and passes with combined service contracts in `combined-backup-service.txt`. Full all-app regression evidence passes in `combined-backup-all.txt`, including General 74/24, Games 16/30, Reader 51/30, WhatsApp nine/nine and both broad Piano scripts.


Shared install assets add one static-output contract and extend the existing installation browser contract. `install-icons-red.txt` records missing PNG/Apple assets; `install-icons-offline.txt` passes General 75 unit/24 browser with actual offline image decoding. WhatsApp's original/native manifest/worker assertions also pass (`install-icons-whatsapp.txt`, nine/nine). The SVG favicon remains; generated PNGs add explicit 192/512px any/maskable and 180px Apple representations. Physical iPhone install is unverified.
