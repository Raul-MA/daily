# WhatsApp Compass

## Start Here

- [Root rules](../../AGENTS.md), then [drafts and handoff](docs/behavior.md).
- [Source mapping](../../reports/whatsapp-source-map.json) and [test inventory](../../reports/migration-test-inventory.md).

## Commands

- `npm run test:whatsapp`: unit/controller and mounted browser suites, including legacy exporter contracts.
- Source: `node scripts/test.mjs whatsapp --baseline http://127.0.0.1:8767/schedule-whatsapp/ --report reports/baseline-whatsapp-complete.txt`; workspace static server required.

## Key Files

- `src/app.js`, `src/controller.js`: exact URL/local-time validation and source handoff/copy behavior.
- `src/service.js`, `src/validation.js`, `src/imports.js`: versioned draft, stale/quota guards and protected recovery.
- `src/view.js`, `src/markup.js`, `src/style.css`, `src/i18n.js`, `src/backup-ui.js`: scoped source interface, app-owned settings/backup route and EN/ES.
- `test/tests.cjs`, `test/support/native.cjs`: retained source assertions and explicit native shared-install/controller adapters.
- [Prepared legacy exporter](../../legacy/exporters/whatsapp/README.md): read-only saved drafts, including expired/incomplete fields; old-app release deferred.

## Non-Obvious Patterns

- Creation clears the draft before attempting Things, preserving the submitted copy link in memory. Failed saves prevent clearing/handoff.
- Expired saved times remain visible; no silent rescheduling. Opening Things cannot confirm task creation.
- No private manifest/worker, backend or automatic sending. Physical Things/WhatsApp validation remains deferred.
