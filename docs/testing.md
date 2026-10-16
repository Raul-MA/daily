# Testing

## Problem

Copied tests must protect behavior before app code enters this repo. A missing feature should fail a discovered test, while tooling and discovery failures must stay distinguishable from feature failures.

## How It Works

`npm run test:<module>` runs each unit group and then its browser checks. `test:all` visits general, plants, coffee, games, Time Budget, piano, reading and WhatsApp sequentially, accumulates failures and exits nonzero. Playwright uses one worker and no retries. `test:general` includes 77 unit cases and 26 browser cases for the shared platform, diagnostics and combined backup/restore. `scripts/discovery.mjs` checks required case counts before execution; every module has a discovered local suite.

Node tests use a test-only loader under `tests/support/`. Existing source modules are imported normally, including import errors. If the requested file does not exist, each referenced export throws when exercised. This keeps assertions running without adding app implementations or fabricating successful results. Absent asset reads fail inside named tests. The loader is never part of the browser application build.

Baseline runs select original sources with `DAILY_SOURCE_ROOT=/workspaces`. Coffee and games use `DAILY_BASELINE_URL=http://127.0.0.1:8767/<original-repo>/`. Piano uses `TONIQ_URL=http://127.0.0.1:8767/toniq` (a trailing slash for its offline test). Baselines require a static server of `/workspaces` on 8767. Browser contexts have isolated storage; unit fixtures are synthetic. Baseline results prove assertion preservation, not functionality in Daily.

The new-app browser suites prepare static files, start the local Node HTTP server on 8766 and wait for an HTTP response under `/daily/`. Keep this port free. The piano runner starts its own server and closes it after UI/offline checks. Its route/catalog assertions are retained through documented shared-route and worker adaptations; the broad original browser scripts run after the native suite.

Imported workflows were split into helpers/scenarios to satisfy the full lint policy. Game fixture objects were materialized as JSON with `__NOW__` placeholders, substituted with the same runtime timestamp as the source test. The original fixture functions remain documented by provenance. Piano's optional timing skip was removed; every normal suite invocation runs the complete matrix.

Source comments moved to documentation: plant legacy data is migrated before counting the care write; piano's clock advance includes the 200 ms polling interval; deterministic visibility events exercise background handling; WhatsApp tests cover worker ownership and clearing the form before explicit handoff. Legal/source attribution is preserved in the inventory; no original license files were discovered among the migrated repositories.

The initial isolated Node red captures for diagnostic/storage show only file-level failure summaries. An additional reconstruction copied their unchanged tests into an empty temporary source tree and ran without process isolation: all 18 named cases fail inside their callbacks on absent implementations. This is a reconstructed red check, not a claim that the initial transcripts contained case-level output; see `reports/stage2-reconstructed-red.txt`. Current real implementations pass all cases.

## Gotchas

- Never set baseline variables during new-app validation. They select originals and can manufacture a misleading pass.
- Initial red results are expected failures, not release exemptions. Do not add expected-failure flags or skip tests.
- A server/browser startup error is infrastructure failure, not evidence of absent app behavior. Retry it and retain the distinction in the progress log.
- Piano originally pauses on hide and tears down render timers on navigation. Before changing those assertions, add replacement acceptance tests for persisted continuation and document the approved difference.
- Legacy storage-key assertions must be adapted to the shared data boundary when that boundary is implemented, preserving the domain values and reference invariants.
- Every app now has passing local workflow evidence. Full local checks do not close the remaining localization, migration, concurrency or physical-device gates.

## Native platform and plants checkpoint

The current general suite has 77 unit and 26 browser cases; plants has 26 unit and 11 browser cases. `node scripts/test.mjs <scope> --report reports/<name>.txt` writes child output internally and preserves failing exit codes, allowing one approved local test command to be reused. Keep browser suites sequential because static preparation replaces `dist/`.

The initial update red attempt used isolated Node child processes and produced only a file-level runner failure. It did not establish behavioral red. `platform-updates-regression-red.txt` replays the exact worker from `bb4c54e` with the new tests: four guards fail for cached-version pinning, blocked tabs, invalid/unresponsive replies and unknown clients. Current worker/unit/browser reports show those contracts passing.

Plant care characterization first passed against original Stillgreen, then failed against the absent module. Original seven plant cases remain unchanged. Additional UI tests cover imports, offline writes, original theme variables, language drafts and cross-tab stale edits. Screenshot attachments are generated under ignored `test-results/`; they are visual review aids, not evidence of physical iPhone behavior.


## Coffee checkpoint

Coffee's scoped runner discovers 17 unit cases separately from 28 browser cases, preserving the original 21 workflows. The eight domain characterization cases also passed against the original repository. Shared-document test fixtures replace only the storage boundary; original field/history/backup/insight assertions remain. New valid-import steps require preview/recovery/confirmation under the plan; malformed imports still assert the original error. See `modules/coffee/docs/behavior.md` and `reports/coffee-source-map.json` for intentional route/startup changes and source provenance.


## Games checkpoint

Games has 16 unit cases (eight original-source characterization plus eight service cases) and 30 browser cases (24 copied workflows plus six shared/offline cases). Its service tests assert a single root write for session/activity transitions and no write during reads/ticks. Source fixtures are wrapped with a shared Games payload/activity before browser startup; field/scoring/history/statistics assertions remain. Deferred focus, source toast overlays, form stamps/drafts and obsolete links have recorded failures followed by fixes. One initial activity-test failure was a fixture selector/clock error, explicitly distinguished in progress/inventory. See `modules/games/docs/behavior.md` and `reports/games-source-map.json`.


## Time Budget checkpoint

Time Budget adds eight original-source domain and eight original-browser characterization cases, authored and run before its port. The native suite has 20 unit cases (eight characterization, nine root/import cases and three legacy exporter cases) and 17 browser cases (the same eight workflows plus nine new shared/recovery cases). The original source has no test suite to copy. `node scripts/test.mjs time-budget --baseline http://127.0.0.1:8767/timeBudget/ --report reports/baseline-time-budget.txt` explicitly selects the original source and the eight original browser workflows; keep this option out of native validation. A separate local source server must already be running.

Fixed browser clocks preserve exact deadline/elapsed assertions. Navigation/ticks are checked against unchanged primary JSON, and start/pause writes happen immediately. New cases cover independent countdown overtime, pending reallocation reload, language/queue drafts, stale edits, quota failures, protected imports, offline reopening and phone overflow. Red reports distinguish actual missing controls/negative-reallocation behavior from the first offline fixture's blocked service-worker setting. See the module behavior doc and source map for boundaries and intentional improvements.


## Combined restore contracts

`tests/general/backup.test.mjs` adds nine unit contracts for every module schema, unknown/future versions, nested references, matching unfinished activities, untouched original timestamps, preview identity/staleness, one root replacement and failure ordering. `tests/e2e/backup.spec.js` adds five browser workflows for export privacy, separate-profile restore, invalid/canceled/stale/quota imports, honest post-commit cleanup warnings and discarding retained app drafts. All data in `tests/fixtures/backup-data.mjs` is synthetic.

The first retained-draft report failed on a fixture that read an unwritten fresh root from localStorage. Its corrected report (`combined-backup-drafts-fixture-red.txt`) demonstrates the actual old Time Budget setup reappearing after replacement. The fix resets retained module UI state only after root replacement. Current full regression evidence is `reports/combined-backup-all.txt`; progress records whether that run is complete.
