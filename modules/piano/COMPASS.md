# piano Compass

## Start Here

- [Root rules](../../AGENTS.md).
- [Migration inventory](../../reports/migration-test-inventory.md).
- [Persistence and core status](docs/behavior.md): timestamp state, deterministic prompts and remaining integration.

## Commands

- `npm run test:piano` runs this module suite.

## Key Files

- `test/`: 41 copied cases plus eight new service cases.
- `e2e/`: both original browser scripts plus six new continuation cases.
- `src/js/music/`, `src/js/components/`: musical core and pure rendering; interactive components/pages are pending.
- `src/service.js`, `src/practice-clock.js`: persisted practice and pure snapshot clock.

## Non-Obvious Patterns

- This module is unfinished: 38 original core and eight service cases pass; full piano UI/navigation/worker acceptance remains red.
- Scope source DOM/styles and preserve source assertions while replacing the approved hide/navigation behavior. Cleanup stops presentation timers, never the persisted practice.
