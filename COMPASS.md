# Daily Compass

## Start Here

- [Working rules](AGENTS.md), then [progress / resume](docs/progress.md). Review branches/PRs and Daily Pages deployment are authorized; cloud setup, device acceptance and API token checks remain deferred.
- [Implementation plan](docs/pwa-consolidation-plan.md) defines the gates. All seven native apps, shared shell, timestamp activities, EN/ES, recovery and offline updates pass full local verification. Stage 8 physical-device/API/coexistence and release acceptance remain deferred.

## Commands

- `npm run lint`, `npm run check:js`, `npm run build`.
- `npm run test:general`, `npm run test:<module>`, `npm run test:all`: sequential scopes.
- `npm run verify`: full gate; unfinished feature suites fail.
- `npm run prepare:legacy-workers`: generate checked patches from the retained sibling repos.

## Key Files

- `apps/daily/src/shell/sidebar*.js`, `sidebar.css`, `settings-hub.js`, `footer.js`: shared themed navigation and app settings directory, drawer/collapse behavior and compact footer; [platform](docs/platform.md) explains ownership.
- [Checkpoint history](docs/implementation-history.md): archived evidence; current instructions remain in progress.
- [Source test mapping](reports/migration-test-inventory.md) and [provenance](reports/source-tests.json).
- `scripts/test.mjs`: sequential orchestration; `scripts/discovery.mjs`: required test counts.
- `packages/eslint-config/index.mjs`: one shared blocking policy.
- `modules/<module>/COMPASS.md`: module entry points.

- [Independent review fixes](reports/review-fixes.md): twelve findings, regression mapping and retained evidence.

## Deep Dives

- [Supabase, app sharing and push proposal](docs/supabase-sharing-push-plan.md): future app-specific memberships, offline sync and Edge Function reminders; planning only, no implementation authorized.
- [Platform and native modules](docs/platform.md): route/state boundaries, local scripts and offline assets.
- [Testing](docs/testing.md): baseline versus new-app runs and red-stage interpretation.
- [Constraints](docs/constraints.md): Pages origin and Readwise capabilities.
- [Physical device checklist](docs/device-validation.md): pending iPhone evidence and dependencies.
- [Storage and migrations](docs/storage-and-migrations.md): combined backups, schema/activity validation, atomic replacement, unreadable-root export/restore and the one-editing-tab policy.
- [Legacy workers](docs/legacy-workers.md): tested cleanup patches and release requirements.
- [Legacy exporters](docs/legacy-exporters.md): prepared Time Budget, Plants, Reader and WhatsApp migration patches; originals/releases untouched.
- [Local development](README.md#local-use) and [Pages deployment](README.md#github-pages): copy-only build, preview commands and verified `dist/` publication.
- [Lint policy](docs/pwa-eslint-policy.md): exact required rules.

## Non-Obvious Patterns

- The test-only absent-module loader permits discovery and throws when missing behavior is exercised; it never supplies fake successful behavior.
- Baseline runs target original code in isolated contexts. They do not prove the new PWA works.
- Source mappings preserve characterization and intentional adaptations. Use [progress](docs/progress.md) for current verification; physical/release acceptance remains deferred.

## Documentation Rules

- Update progress, suite mapping and relevant deep dives with changes.
- Preserve one authoritative document per concept.
