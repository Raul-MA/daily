# Games Compass

## Start Here

- [Root rules](../../AGENTS.md).
- [Migration inventory](../../reports/migration-test-inventory.md).
- [Data and session lifecycle](docs/behavior.md): scoring, cooperative results, archival, activities, drafts and replace-only recovery.

## Commands

- `npm run test:games` runs this module suite.

## Key Files

- `src/service.js`, `src/activity-sync.js`, `src/imports.js`: atomic module/activity storage and preview/recovery.
- `src/backend/`: retained domain API; `src/frontend/app/`: split original screens; `src/view.js`: shell mount.
- `test/`: eight original-source data cases and eight service and one localization case; `e2e/`: 24 copied workflows plus ten shared/offline/localization cases.

## Non-Obvious Patterns

- One active game; scores never restart its shared timestamp clock.
- Reopening preserves historical timing for explicit correction. Unused records delete; referenced records archive.
- Bound reads propagate errors before the legacy fallback. Internal revision symbols never enter exports.
- JSON import replaces Games after preview/recovery confirmation; it never merges or changes shared language.
- Nested round IDs/numbers, result player IDs and winner IDs must be unique, including imports through the combined backup screen.
- Authored copy uses explicit EN/ES lookups; game/player names, snapshots, notes and numeric scoring rules stay verbatim. Notifications translate on render without restarting expiry.
