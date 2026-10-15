# Time Budget Compass

## Start Here

- [Root rules](../../AGENTS.md).
- [Migration inventory](../../reports/migration-test-inventory.md).
- [Behavior and storage](docs/behavior.md): deadline anchoring, explicit completion, countdowns, drafts and import recovery.

## Commands

- `npm run test:time-budget` runs this module suite.

## Key Files

- `test/characterization.test.mjs`: eight source-characterized domain cases; `service.test.mjs`: nine native storage/import cases.
- `e2e/`: eight original baseline workflows plus nine Daily acceptance cases.
- `src/app.js`, `src/methods/`: native original workflow; `src/view.js`: scoped mount and cleanup.
- `src/service.js`, `src/imports.js`, `src/countdowns.js`: root storage, atomic restore and shared countdown boundary.

## Non-Obvious Patterns

- Reads, navigation and ticks never save or pause a persisted session. All actual timer changes save immediately.
- The original README is stale about active-session persistence. Follow inspected behavior and the focused module doc.
- Stage 8 full localization, legacy active-state exporter and real-device acceptance remain open.
