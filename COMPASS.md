# Daily Compass

## Start Here

- [Working rules](AGENTS.md), then [progress / resume](docs/progress.md). Local only, no workflows or pushes; API token checks are deferred.
- [Implementation plan](docs/pwa-consolidation-plan.md) defines the gates. All seven native apps, shared shell, timestamp activities, EN/ES, recovery and offline updates pass full local verification. Stage 8 physical-device/API/coexistence and release acceptance remain deferred.

## Commands

- `npm run lint`, `npm run check:js`, `npm run build`.
- `npm run test:general`, `npm run test:<module>`, `npm run test:all`: sequential scopes.
- `npm run verify`: full gate; unfinished feature suites fail.
- `npm run prepare:legacy-workers`: generate checked patches from the retained sibling repos.

## Key Files

- `apps/daily/src/shell/sidebar*.js`, `sidebar.css`, `footer.js`: shared themed navigation, drawer/collapse behavior and compact footer; [platform](docs/platform.md) explains ownership.
- [Checkpoint history](docs/implementation-history.md): archived evidence; current instructions remain in progress.
- [Source test mapping](reports/migration-test-inventory.md) and [provenance](reports/source-tests.json).
- `scripts/test.mjs`: sequential orchestration; `scripts/discovery.mjs`: required test counts.
- `packages/eslint-config/index.mjs`: one shared blocking policy.
- `modules/<module>/COMPASS.md`: module entry points.

## Deep Dives

- [Platform and native modules](docs/platform.md): route/state boundaries, local scripts and offline assets.
- [Testing](docs/testing.md): baseline versus new-app runs and red-stage interpretation.
- [Constraints](docs/constraints.md): Pages origin and Readwise capabilities.
- [Physical device checklist](docs/device-validation.md): pending iPhone evidence and dependencies.
- [Storage and migrations](docs/storage-and-migrations.md): combined backups, schema/activity validation, atomic replacement, unreadable-root export/restore and the one-editing-tab policy.
- [Legacy workers](docs/legacy-workers.md): tested cleanup patches and release requirements.
- [Legacy exporters](docs/legacy-exporters.md): prepared Time Budget, Plants, Reader and WhatsApp migration patches; originals/releases untouched.
- [Local development / deferred deployment](docs/deployment.md): local commands and the current no-workflows instruction.
- [Lint policy](docs/pwa-eslint-policy.md): exact required rules.

## Non-Obvious Patterns

- The test-only absent-module loader permits discovery and throws when missing behavior is exercised; it never supplies fake successful behavior.
- Baseline runs target original code in isolated contexts. They do not prove the new PWA works.
- Time Budget characterization was authored before its port. Reader source characterization and mounted UI checks pass; General and affected regressions pass in `reader-shared-regressions.txt`. All feature scopes pass local checks in `reports/final-verification.txt`; physical/release Stage 8 acceptance remains deferred.

## Documentation Rules

- Update progress, suite mapping and relevant deep dives with changes.
- Preserve one authoritative document per concept.
