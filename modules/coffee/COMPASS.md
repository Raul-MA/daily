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
- `test/`: eight original-source characterization and eleven service and one dictionary/error localization case; `e2e/`: 21 copied workflows plus thirteen shared/offline/final-audit cases.

## Non-Obvious Patterns

- First tools Save/Skip saves settings plus the original starter bean in one root replacement; failed writes retain the setup form.
- Restoring history drafts must refresh filtered results; notification remounts preserve their expiry deadline.
- Navigation never creates the original starter bean; explicit tools Save/Skip does.
- Mounted storage is always bound to Daily. Legacy standalone storage is only used for source characterization.
- Imports retain shared language and validate references against the final merged/replaced data.
