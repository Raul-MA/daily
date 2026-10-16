# Plants Compass

## Start Here

- [Root rules](../../AGENTS.md), [behavior and storage](docs/behavior.md), [progress](../../docs/progress.md).

## Commands

- `npm run test:plants`: 28 unit cases and 13 browser cases.
- `node scripts/test.mjs plants --report reports/plants-ui.txt`: same scope with a report, no shell redirection.

## Key Files

- `src/service.js`: shared-document adapter, import preview, stale-preview guard and migration export.
- `src/store/store.js`: retained plant operations; `validation.js`, `envelope.js`, `legacy.js`, `metadata.js` split storage responsibilities.
- `src/care/care.js`: original seasonal/manual-date rules. `src/ui/`: native DOM pages and dashboard provider.
- `src/plants/templates/`: thirteen unchanged source templates, split into small data modules.
- `src/plants/localized.js`, `src/plants/translations/`: detached EN/ES authored text; source schedules and saved user content are untouched.
- `test/` and `e2e/`: original assertions plus care, shared-storage, draft and browser acceptance coverage.
- [Prepared legacy exporter](../../legacy/exporters/plants/README.md): original records, recovery reads and Things preferences; original-app release deferred.

## Non-Obvious Patterns

- `connectPlants(state)` binds the public plant API to `daily:v1`; it does not import legacy keys automatically.
- The default legacy adapter exists for explicit compatibility and the copied original tests. Mounted UI uses the shared document.
- Theme variables and selectors stay under `[data-module="plants"]`. No module registers a worker or downloads Google Fonts.
- Controls, template defaults and authored guides support EN/ES. New template selection uses the current language; existing saved or draft text is never translated.
