# Daily Compass

## Start Here

- [Working rules](AGENTS.md), then [progress / resume](docs/progress.md).
- [Implementation plan](docs/pwa-consolidation-plan.md) defines the stage gates. This repo currently contains test infrastructure, a connection diagnostic and storage feasibility code; app modules are not migrated.

## Commands

- `npm run lint`, `npm run typecheck`, `npm run build`.
- `npm run test:general`, `npm run test:<module>`, `npm run test:all`: sequential scopes.
- `npm run verify`: full gate; unfinished feature suites fail.
- `npm run prepare:legacy-workers`: generate checked patches from the retained sibling repos.

## Key Files

- [Source test mapping](reports/migration-test-inventory.md) and [provenance](reports/source-tests.json).
- `scripts/test.mjs`: sequential orchestration; `scripts/discovery.mjs`: required test counts.
- `packages/eslint-config/index.mjs`: one shared blocking policy.
- `modules/<module>/COMPASS.md`: module entry points.

## Deep Dives

- [Testing](docs/testing.md): baseline versus new-app runs and red-stage interpretation.
- [Constraints](docs/constraints.md): Pages origin and Readwise capabilities.
- [Physical device checklist](docs/device-validation.md): pending iPhone evidence and dependencies.
- [Storage and migrations](docs/storage-and-migrations.md): validated document replacement and recovery prototype.
- [Legacy workers](docs/legacy-workers.md): tested cleanup patches and release requirements.
- [Deployment](docs/deployment.md): diagnostic-only preview workflow and release gate.
- [Lint policy](docs/pwa-eslint-policy.md): exact required rules.

## Non-Obvious Patterns

- The test-only absent-module loader permits discovery and throws when missing behavior is exercised; it never supplies fake successful behavior.
- Baseline runs target original code in isolated contexts. They do not prove the new PWA works.
- Time Budget and Reader have no source suites; their scoped commands fail until characterization tests are authored.

## Documentation Rules

- Update progress, suite mapping and relevant deep dives with changes.
- Preserve one authoritative document per concept.
