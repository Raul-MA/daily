# Testing

## Problem

Copied tests must protect behavior before app code enters this repo. A missing feature should fail a discovered test, while tooling and discovery failures must stay distinguishable from feature failures.

## How It Works

`npm run test:<module>` runs each unit group and then its browser checks. `test:all` visits general, plants, coffee, games, Time Budget, piano, reading and WhatsApp sequentially, accumulates failures and exits nonzero. Playwright uses one worker and no retries. `test:general` includes 65 unit cases and 19 browser cases for the shared platform and diagnostics. `scripts/discovery.mjs` checks required case counts before execution; Time Budget and Reader currently fail discovery because no characterization suite exists yet.

Node tests use a test-only loader under `tests/support/`. Existing source modules are imported normally, including import errors. If the requested file does not exist, each referenced export throws when exercised. This keeps assertions running without adding app implementations or fabricating successful results. Absent asset reads fail inside named tests. The loader is never part of the browser application build.

Baseline runs select original sources with `DAILY_SOURCE_ROOT=/workspaces`. Coffee and games use `DAILY_BASELINE_URL=http://127.0.0.1:8767/<original-repo>/`. Piano uses `TONIQ_URL=http://127.0.0.1:8767/toniq` (a trailing slash for its offline test). Baselines require a static server of `/workspaces` on 8767. Browser contexts have isolated storage; unit fixtures are synthetic. Baseline results prove assertion preservation, not functionality in Daily.

The new-app browser suites prepare static files, start the local Node HTTP server on 8766 and wait for an HTTP response under `/daily/`. Keep this port free. The piano runner starts its own server and closes it after UI/offline checks. Its legacy route and catalog assertions are retained until their documented route and worker adaptations are introduced before feature implementation.

Imported workflows were split into helpers/scenarios to satisfy the full lint policy. Game fixture objects were materialized as JSON with `__NOW__` placeholders, substituted with the same runtime timestamp as the source test. The original fixture functions remain documented by provenance. Piano's optional timing skip was removed; every normal suite invocation runs the complete matrix.

Source comments moved to documentation: plant legacy data is migrated before counting the care write; piano's clock advance includes the 200 ms polling interval; deterministic visibility events exercise background handling; WhatsApp tests cover worker ownership and clearing the form before explicit handoff. Legal/source attribution is preserved in the inventory; no original license files were discovered among the migrated repositories.

The initial isolated Node red captures for diagnostic/storage show only file-level failure summaries. An additional reconstruction copied their unchanged tests into an empty temporary source tree and ran without process isolation: all 18 named cases fail inside their callbacks on absent implementations. This is a reconstructed red check, not a claim that the initial transcripts contained case-level output; see `reports/stage2-reconstructed-red.txt`. Current real implementations pass all cases.

## Gotchas

- Never set baseline variables during new-app validation. They select originals and can manufacture a misleading pass.
- Initial red results are expected failures, not release exemptions. Do not add expected-failure flags or skip tests.
- A server/browser startup error is infrastructure failure, not evidence of absent app behavior. Retry it and retain the distinction in the progress log.
- Piano originally pauses on hide and tears down render timers on navigation. Before changing those assertions, add replacement acceptance tests for persisted continuation and document the approved difference.
- Legacy storage-key assertions must be adapted to the shared data boundary when that boundary is implemented, preserving the domain values and reference invariants.
- Full verification remains failing until every module exists, characterization coverage is added and every copied suite passes against Daily.

## Native platform and plants checkpoint

The current general suite has 65 unit and 19 browser cases; plants has 23 unit and 11 browser cases. `node scripts/test.mjs <scope> --report reports/<name>.txt` writes child output internally and preserves failing exit codes, allowing one approved local test command to be reused. Keep browser suites sequential because static preparation replaces `dist/`.

The initial update red attempt used isolated Node child processes and produced only a file-level runner failure. It did not establish behavioral red. `platform-updates-regression-red.txt` replays the exact worker from `bb4c54e` with the new tests: four guards fail for cached-version pinning, blocked tabs, invalid/unresponsive replies and unknown clients. Current worker/unit/browser reports show those contracts passing.

Plant care characterization first passed against original Stillgreen, then failed against the absent module. Original seven plant cases remain unchanged. Additional UI tests cover imports, offline writes, original theme variables, language drafts and cross-tab stale edits. Screenshot attachments are generated under ignored `test-results/`; they are visual review aids, not evidence of physical iPhone behavior.


## Coffee checkpoint

Coffee's scoped runner discovers 17 unit cases separately from 28 browser cases, preserving the original 21 workflows. The eight domain characterization cases also passed against the original repository. Shared-document test fixtures replace only the storage boundary; original field/history/backup/insight assertions remain. New valid-import steps require preview/recovery/confirmation under the plan; malformed imports still assert the original error. See `modules/coffee/docs/behavior.md` and `reports/coffee-source-map.json` for intentional route/startup changes and source provenance.
