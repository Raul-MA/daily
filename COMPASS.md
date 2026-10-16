# Daily Compass

## Start Here

- [Working rules](AGENTS.md), then [progress / resume](docs/progress.md). Local only, no workflows or pushes; API token checks are deferred.
- [Implementation plan](docs/pwa-consolidation-plan.md) defines the stage gates. The shared shell, settings, routing, timestamp activities and offline lifecycle are implemented in plain HTML/CSS/JavaScript; plants, Coffee, Games and Time Budget and piano are connected; Reader also passes local workflow checks; WhatsApp also passes local workflow checks. Stage 8 combined recovery/localization/device gates remain open.

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
- [Storage and migrations](docs/storage-and-migrations.md): combined backups, schema/activity validation, atomic replacement and recovery.
- [Legacy workers](docs/legacy-workers.md): tested cleanup patches and release requirements.
- [Legacy Time Budget export](legacy/exporters/time-budget/README.md): prepared read-only active-session exporter; original-app release deferred.
- [Legacy Plants export](legacy/exporters/plants/README.md): prepared records/Things preferences exporter with read-only recovery; original-app release deferred.
- [Legacy Reader export](legacy/exporters/reader/README.md): prepared preferences/remembered-item exporter with credential allowlists; old-app release deferred.
- [Local development / deferred deployment](docs/deployment.md): local commands and the current no-workflows instruction.
- [Lint policy](docs/pwa-eslint-policy.md): exact required rules.

## Non-Obvious Patterns

- The test-only absent-module loader permits discovery and throws when missing behavior is exercised; it never supplies fake successful behavior.
- Baseline runs target original code in isolated contexts. They do not prove the new PWA works.
- Time Budget characterization was authored before its port. Reader source characterization and mounted UI checks pass; General and affected regressions pass in `reader-shared-regressions.txt`. All feature scopes pass local checks in `all-with-whatsapp.txt`; this does not complete Stage 8.

## Documentation Rules

- Update progress, suite mapping and relevant deep dives with changes.
- Preserve one authoritative document per concept.
