# Time Budget Compass

## Start Here

- [Root rules](../../AGENTS.md).
- [Migration inventory](../../reports/migration-test-inventory.md).
- [Behavior and storage](docs/behavior.md): deadline anchoring, explicit completion, countdowns, drafts and import recovery.

## Commands

- `npm run test:time-budget` runs this module suite.

## Key Files

- `test/characterization.test.mjs`, `service.test.mjs`: source-characterized domain behavior and native storage/import contracts.
- `test/localization-service.test.mjs`: shared-language/dictionary/layout identity contracts.
- `test/legacy-service.test.mjs`: read-only legacy exporter/import contracts; [prepared exporter](../../legacy/exporters/time-budget/README.md) explains its separate original-app release.
- `e2e/`: original baseline workflows and Daily acceptance/localization/lifecycle contracts.
- `src/sections.js`: separate Time Budget, Countdowns and Settings panels without changing clocks or drafts.
- `src/app.js`, `src/methods/`: native original workflow; `src/view.js`: scoped mount and cleanup.
- `src/i18n.js`, `src/translations.js`, `src/notices.js`, `src/queue-drafts.js`: explicit authored copy, fixed notice expiry and semantic draft reconstruction.
- `src/service.js`, `src/imports.js`, `src/countdowns.js`: root storage, atomic restore and shared countdown boundary.

## Non-Obvious Patterns

- Reads, navigation and ticks never save or pause a persisted session. All actual timer changes save immediately.
- The original README is stale about active-session persistence. Follow inspected behavior and the focused module doc.
- Legacy active-state exporter is prepared and locally tested; the original installation has not received it. Authored EN/ES copy is locally verified; real-device acceptance remains open.
