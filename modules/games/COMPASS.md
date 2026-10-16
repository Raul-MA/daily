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
- `test/`: eight original-source data cases and eight service cases; `e2e/`: 24 copied workflows plus six shared/offline cases.

## Non-Obvious Patterns

- One active game; scores never restart its shared timestamp clock.
- Reopening preserves historical timing for explicit correction. Unused records delete; referenced records archive.
- Bound reads propagate errors before the legacy fallback. Internal revision symbols never enter exports.
- JSON import replaces Games after preview/recovery confirmation; it never merges or changes shared language.
- Nested round IDs/numbers, result player IDs and winner IDs must be unique, including imports through the combined backup screen.
- Full Games localization remains a Stage 8 gate; the original UI has hardcoded English labels.
