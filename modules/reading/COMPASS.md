# Reading Compass

## Start Here

- [Root rules](../../AGENTS.md), then [migration boundaries](docs/behavior.md).
- [Source mapping](../../reports/reading-source-map.json) and [test inventory](../../reports/migration-test-inventory.md).

## Commands

- `npm run test:reading`: unit and mounted browser suites, including legacy exporter contracts.
- Source baseline: `node scripts/test.mjs reading --baseline http://127.0.0.1:8767/.daily-reader-source/ --report reports/baseline-reading-browser.txt` with the workspace static server running.

## Key Files

- `src/service.js`, `src/service-actions.js`, `src/validation.js`: versioned settings/picks and stale/failed-write protection.
- `src/metadata.js`, `src/selection.js`, `src/config.js`: duration, sampling and shortcut rules.
- `src/client.js`, `src/request.js`, `src/rate-limit.js`, `src/cache.js`, `src/credentials.js`, `src/account-epoch.js`: real requests, disposable metadata and account isolation.
- `src/timestamps.js`, `src/ui/errors.js`: bounded persisted/cache timestamps and exact authored error translations.
- `src/view.js`, `src/ui/`, `src/preferences.js`: source picker appearance, shared preferences and language drafts.
- `src/review/`: latest-review client, explicit completion, ordinary highlights and conditional Q&A presenter.
- `src/imports.js`, `src/backup-ui.js`: validated preview/recovery/confirmation and credential-free exports.
- [Prepared legacy exporter](../../legacy/exporters/reader/README.md): settings and optional remembered metadata; tokens/cache keys are excluded and old-app release is deferred.
- `test/source.mjs`: unchanged-source VM characterization adapter; `e2e/fixtures.js`: synthetic API fixtures and baseline/native route adapter.

## Non-Obvious Patterns

- Token and settings changes invalidate pending results. Merely rendering widgets/pages must not pick, save preferences or leave Daily automatically.
- Unknown durations are excluded under finite budgets unless enabled. Truncation bounds the pool, so whole-library randomness is never promised.
- Authenticated connectivity, Q&A data availability and scheduling feedback are unverified; retain the documented direct-review fallback.
