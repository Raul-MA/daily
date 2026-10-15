# Coffee Compass

## Start Here

- [Root rules](../../AGENTS.md).
- [Migration inventory](../../reports/migration-test-inventory.md).
- [Storage and workflows](docs/behavior.md): shared language, legacy import rules, preview/recovery, drafts and routes.

## Commands

- `npm run test:coffee` runs this module suite.

## Key Files

- `src/service.js`, `src/imports.js`, `src/validation.js`: shared document and import boundary.
- `src/backend/features/`: retained domain API; `src/frontend/app/`: scoped original screens; `src/view.js`: shell mount.
- `test/`: eight original-source characterization and nine service cases; `e2e/`: 21 copied workflows plus seven shared/offline cases.

## Non-Obvious Patterns

- Navigation never creates the original starter bean; explicit tools Save/Skip does.
- Mounted storage is always bound to Daily. Legacy standalone storage is only used for source characterization.
- Imports retain shared language and validate references against the final merged/replaced data.
