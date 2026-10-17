# Piano Compass

## Start Here

- [Root rules](../../AGENTS.md).
- [Behavior and boundaries](docs/behavior.md): persistence, presentation pacing, native routes and source parity.
- [Source mapping](../../reports/piano-source-map.json) and [migration inventory](../../reports/migration-test-inventory.md).

## Musical invariants

- [Keyboard placement](docs/keyboard-diagram.md): exact octaves, spelling, ranges and accessible metadata.
- [Rootless voice leading](docs/rootless-voicings.md), [suspension resolutions](docs/suspended-chords.md) and [ear training](docs/ear-training.md) and [modulation examples](docs/modulations.md): domain calculations and cancellation.

## Commands

- `npm run test:piano`: 58 unit cases, fourteen native browser cases, both retained original browser scripts.

## Key Files

- `src/service.js`, `src/service-actions.js`, `src/practice-clock.js`: atomic practice/history/activity transitions and timestamp snapshots.
- `src/i18n.js`, `src/translations/`, `src/localized-lessons.js`: EN/ES presentation overlays; canonical musical data remains unchanged.
- `src/exercise-state.js`: language-only question/filter/pacing snapshots, cleared by route changes.
- `src/view.js`, `src/ui-drafts.js`, `src/js/router.js`: async mounting, remount drafts and shared routing.
- `src/js/music/`, `src/js/pages/`, `src/js/components/`: original musical content and split presentation code.

## Non-Obvious Patterns

- Hidden/absent views retain the saved question while elapsed time continues. Presentation timers never finish practice automatically.
- Only Daily's generated worker owns offline assets. Original-source baseline and native tests use explicit route/asset adapters.
- Mounted local acceptance and shared/affected regressions pass; final release gates remain. Consult [progress](../../docs/progress.md) before claiming completion.
