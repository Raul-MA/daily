# Testing

## Problem

Copied tests protect behavior across migration. Missing behavior must fail a discovered test; infrastructure failures must remain distinguishable from product failures.

## How It Works

`npm run test:<module>` runs its unit groups and browser checks. `npm run test:all` visits General, Plants, Coffee, Games, Time Budget, Piano, Reading and WhatsApp sequentially, accumulates failures and exits nonzero. Playwright uses one worker and no retries. `scripts/discovery.mjs` enforces required case counts; [progress](progress.md) records current results and the [migration inventory](../reports/migration-test-inventory.md) maps source assertions and intentional adaptations.

`node scripts/test.mjs <scope> --report reports/<name>.txt` writes child output and preserves failing exit codes. Native browser suites rebuild `dist/` and use port 8766 under `/daily/`; keep that port free and run suites sequentially. Piano also runs both retained broad UI/offline scripts through its managed server.

Node tests use a test-only loader under `tests/support/`. Existing imports, including import errors, run normally. A missing requested module exposes throwing exports so failures occur inside the assertions rather than supplying fake successful behavior. Absent asset reads also fail. The loader never enters the application build.

Baseline runs target original sources through `DAILY_SOURCE_ROOT=/workspaces`. Coffee/Games use `DAILY_BASELINE_URL=http://127.0.0.1:8767/<original-repo>/`; Piano uses `TONIQ_URL=http://127.0.0.1:8767/toniq` (trailing slash for its offline script). They need a separate static server of `/workspaces` on 8767. `node scripts/test.mjs time-budget --baseline http://127.0.0.1:8767/timeBudget/ --report reports/baseline-time-budget.txt` selects its original characterized workflows. Reading/WhatsApp baseline commands are in their module Compass files. Baseline results establish original behavior and assertion preservation, not Daily functionality.

Browser contexts isolate storage and fixtures are synthetic. Shared-document fixtures adapt storage/router/worker boundaries while retaining field, history, scoring and backup assertions. Games' JSON fixtures replace `__NOW__` with the same runtime timestamp used by the source fixture. Native valid imports require preview, recovery download and confirmation; malformed imports retain error assertions. Source hashes, fixture provenance and legal/source attribution belong to the inventory and source maps; no original license files were identified among the migrated repositories.

Fixed clocks protect exact timer and midnight assertions. Piano clock advances account for its 200 ms polling interval. Visibility events explicitly exercise hidden-page handling; the midnight fixture pins UTC and pauses before navigation so page-load speed cannot cross the boundary accidentally. Timer ticks/navigation must leave primary JSON unchanged; explicit transitions save immediately. WhatsApp tests preserve clear-before-handoff and shared worker ownership behavior.

Combined restore tests in `tests/general/backup.test.mjs` and `tests/e2e/backup.spec.js` cover domain/reference validation, original timestamps, preview identity/staleness, one root replacement, failure ordering, export privacy, separate-profile restore, cancellation, quota failures, post-commit credential warnings and discarding old drafts. Their fixtures live in `tests/fixtures/backup-data.mjs`. Retained module UI state resets only after successful root replacement.

## Gotchas

- Never set baseline variables during native validation: they select original apps and can produce a misleading pass.
- Record behavioral red before deliberate changes. Expected red remains a failing suite; never skip assertions or hide failures behind expected-failure flags.
- Browser/server startup errors and wrong fixture selectors are infrastructure failures. Preserve the failed log, correct the cause and rerun; do not present them as product red.
- Initial file-level diagnostic/storage failures and later reconstructed named-case red are different evidence. Worker regression red explicitly replays the prior worker. [Checkpoint history](implementation-history.md) and the inventory retain those distinctions and original logs.
- Piano's original pause-on-hide/loss-on-navigation assertions intentionally became persisted continuation checks; all musical, reveal, budget and cleanup assertions remain. Its optional timing skip was removed, so normal invocations exercise the complete matrix.
- Shared storage/routing/i18n/timer/shell changes require General and affected module suites. Run the full verification gate before release; preserve every source assertion when adapting storage boundaries.
- Screenshots under ignored `test-results/` are visual aids, not physical iPhone evidence. Local tests do not close live API, installed-device, external handoff, coexistence or release gates. The supported storage policy is one editing tab at a time; revision guards do not serialize simultaneous writers.
