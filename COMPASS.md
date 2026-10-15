# Daily Compass

## Start Here

- [Working rules](AGENTS.md), then [progress / resume](docs/progress.md). Local only, no workflows or pushes; API token checks are deferred.
- [Implementation plan](docs/pwa-consolidation-plan.md) defines the stage gates. The shared shell, settings, routing, timestamp activities and offline lifecycle are implemented in plain HTML/CSS/JavaScript; app modules are not migrated.

## Commands

- `npm run lint`, `npm run check:js`, `npm run build`.
- `npm run test:general`, `npm run test:<module>`, `npm run test:all`: sequential scopes.
- `npm run verify`: full gate; unfinished feature suites fail.
- `npm run prepare:legacy-workers`: generate checked patches from the retained sibling repos.

## Key Files

- [Source test mapping](reports/migration-test-inventory.md) and [provenance](reports/source-tests.json).
- `scripts/test.mjs`: sequential orchestration; `scripts/discovery.mjs`: required test counts.
- `packages/eslint-config/index.mjs`: one shared blocking policy.
- `modules/<module>/COMPASS.md`: module entry points.

## Deep Dives

- [Platform and native modules](docs/platform.md): route/state boundaries, local scripts and offline assets.
- [Testing](docs/testing.md): baseline versus new-app runs and red-stage interpretation.
- [Constraints](docs/constraints.md): Pages origin and Readwise capabilities.
- [Physical device checklist](docs/device-validation.md): pending iPhone evidence and dependencies.
- [Storage and migrations](docs/storage-and-migrations.md): validated document replacement and recovery prototype.
- [Legacy workers](docs/legacy-workers.md): tested cleanup patches and release requirements.
- [Local development / deferred deployment](docs/deployment.md): local commands and the current no-workflows instruction.
- [Lint policy](docs/pwa-eslint-policy.md): exact required rules.

## Non-Obvious Patterns

- The test-only absent-module loader permits discovery and throws when missing behavior is exercised; it never supplies fake successful behavior.
- Baseline runs target original code in isolated contexts. They do not prove the new PWA works.
- Time Budget and Reader have no source suites; their scoped commands fail until characterization tests are authored.

## Documentation Rules

- Update progress, suite mapping and relevant deep dives with changes.
- Preserve one authoritative document per concept.
