# Piano persistence and music core

## Problem

Keep Toniq's complete musical content and rendering behavior while making guided practice resumable across navigation and process restart. This deliberately replaces original pause-on-hide/lost-on-navigation behavior. UI integration is still pending; the core alone is not a migrated piano app.

## How It Works

- Musical models live in `src/js/music/`, preserving source formulas, spelling, curriculum and source assertions. `components/keyboard-diagram.js` retains exact MIDI placement, metadata escaping and fitted ranges. The navigation catalog is split into chunks; the original destination IDs and semantic paths remain intact.
- `service.js` owns version 1 of `daily:v1.modules.piano`: last opened exercise, practice, history and settings. Its writes update the corresponding shared activity atomically and preserve other modules. Future versions and failed saves never reset records. Starting another session returns the existing unfinished session.
- Practice snapshots contain total/per-block elapsed milliseconds, a resume timestamp, current block, prompt/application indices, reveal state and pacing remainder. `practice-clock.js` derives time and missed automatic prompts without writes. Pause is explicit; budget boundaries never finish or advance blocks.
- `persistent-prompt.js` seeds root/interval/quality/degree singleton selections before delegating to the original recall generator. The same practice ID/index therefore recreates the same question after suspension or restart. Progression and blues sequencing retain the original ordered curriculum. Global randomness is not changed.
- Explicit Finish appends one practice record and completes its shared activity in the same commit. Repeated Finish has no effect. Opening a standalone exercise only remembers its stable ID; selecting a random candidate alone never creates or saves practice.

## Gotchas

- Original source is Toniq commit `3fc564302b2c10642315d97a603aeba3c73a6ed0`; source/audio/image hashes are in `reports/piano-source-map.json`.
- `src/js/components/practice-session.js` currently has allocation only; `exercise-shell.js` currently has its pure HTML builders only. The interactive components, source pages, scoped styles, shared routes/widgets and full browser workflows remain to implement.
- The original worker-inventory test must become a single shared asset-inventory check after the already-authored offline acceptance is wired. Do not install a Toniq worker in Daily.
- Retained original smoke assertions for hide/return/setup must be replaced by the agreed continuation assertions, preserving all music, reveal, timing-budget and cleanup coverage. Browser fixture imports and old hashes need explicit adapters.
- Complete EN/ES content, combined recovery/migration and physical iPhone acceptance remain final gates. Browser clocks cannot establish installed-device acceptance.
