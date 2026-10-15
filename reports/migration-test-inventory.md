# Migration test inventory

Updated 2026-10-14. Original commits and SHA-256 values are in [source-tests.json](source-tests.json). No application logic was copied with these suites. Every fixture comes from source test literals, not personal backups.

## Source-to-destination mapping

| Source | Migrated files | Named source cases |
| --- | --- | --- |
| `stillgreen/tests/things.test.mjs` | `modules/plants/test/things.test.mjs` | 4 |
| `stillgreen/tests/store.test.mjs` | `modules/plants/test/store.test.mjs` | 3 |
| `coffee-tracker/e2e/history-detail.spec.js` | `modules/coffee/e2e/history-detail.spec.js` | 4 |
| `coffee-tracker/e2e/settings-data.spec.js` | `modules/coffee/e2e/backup.spec.js`, `modules/coffee/e2e/settings-data.spec.js` | 9 |
| `coffee-tracker/e2e/helpers.js` | `modules/coffee/e2e/helpers.js` | helper / standalone script |
| `coffee-tracker/e2e/new-shot.spec.js` | `modules/coffee/e2e/new-shot.spec.js` | 7 |
| `coffee-tracker/e2e/insights.spec.js` | `modules/coffee/e2e/insights.spec.js` | 1 |
| `game-tracker/e2e/helpers.js` | `modules/games/e2e/helpers.js` | helper / standalone script |
| `game-tracker/e2e/gameplay.spec.js` | `modules/games/e2e/gameplay-2.spec.js`, `modules/games/e2e/gameplay-3.spec.js`, `modules/games/e2e/gameplay-4.spec.js`, `modules/games/e2e/gameplay.spec.js` | 17 |
| `game-tracker/e2e/import-export.spec.js` | `modules/games/e2e/import-export.spec.js` | 2 |
| `game-tracker/e2e/settings.spec.js` | `modules/games/e2e/settings.spec.js` | 3 |
| `game-tracker/e2e/smoke.spec.js` | `modules/games/e2e/smoke.spec.js` | 2 |
| `toniq/tests/service-worker-smoke.mjs` | `modules/piano/e2e/service-worker-smoke.mjs` | helper / standalone script |
| `toniq/tests/navigation-data.test.mjs` | `modules/piano/test/navigation-data.test.mjs` | 2 |
| `toniq/tests/keyboard-diagram.test.mjs` | `modules/piano/test/keyboard-diagram.test.mjs` | 13 |
| `toniq/tests/suspended-chords.test.mjs` | `modules/piano/test/suspended-chords.test.mjs` | 1 |
| `toniq/tests/learning-path.test.mjs` | `modules/piano/test/learning-path.test.mjs` | 7 |
| `toniq/tests/browser-smoke.mjs` | `modules/piano/e2e/browser-smoke.mjs`, `modules/piano/e2e/scenarios/` | helper / standalone script |
| `toniq/tests/service-worker.test.mjs` | `modules/piano/test/service-worker.test.mjs` | 1 |
| `toniq/tests/rootless-keyboard.test.mjs` | `modules/piano/test/rootless-keyboard.test.mjs` | 4 |
| `toniq/tests/ear-training.test.mjs` | `modules/piano/test/ear-training.test.mjs` | 2 |
| `toniq/tests/practice-session.test.mjs` | `modules/piano/test/practice-session.test.mjs` | 3 |
| `toniq/tests/keyboard-motion.test.mjs` | `modules/piano/test/keyboard-motion.test.mjs` | 2 |
| `toniq/tests/music-foundations.test.mjs` | `modules/piano/test/music-foundations.test.mjs` | 6 |
| `schedule-whatsapp/tests.js` | `modules/whatsapp/test/tests.cjs` | helper / standalone script |

## Assertion preservation audit

Counts include Node `assert.*` and Playwright expectation matcher calls, across helpers and scenarios. They supplement baseline execution; counts alone cannot prove semantic parity.

| Module | Source assertion call sites | Migrated assertion call sites |
| --- | --- | --- |
| plants | 14 | 14 |
| coffee | 147 | 147 |
| games | 136 | 136 |
| piano | 275 | 275 |
| whatsapp | 37 | 37 |

## Additional fixture provenance

- `modules/coffee/e2e/testIds.js`: original coffee `frontend/app/testIds.js`, unchanged selector contract.
- Coffee entry fixture: original helper literal split into a separate file; overrides remain unchanged.
- Game storage-key fixture: resolved original `APP_ID` interpolation to the same literal key.
- Game `fixtures/gameplay-*.json`: original in-test object expressions evaluated with a synthetic `__NOW__` timestamp and the original session fixture functions; runtime substitution preserves timestamps.
- Piano and plant domain imports: test-only loader; absent exports throw, present files import normally.
- WhatsApp standalone assertions: wrapped into three discovered Node tests, with source-root-aware reads and the same VM behavior.
- Time Budget and Reader: no discovered original suites; characterization suites are required before their implementation. No cases are skipped or claimed to exist.

## Approved future differences

Piano continuation across hidden/navigation states is planned but not implemented. Keep old pause assertions until replacement acceptance tests are added. Consolidated manifest/cache scope and canonical routes also need replacement contracts before implementation.

## Source working-tree inventory

Coffee commit `8711d56c1330d6ce626662bbf98fb440eb2e10c4` has modified `COMPASS.md`, untracked `docs/`, an untracked personal JSON backup and `standalone_excel/`. These stayed untouched and were excluded. No original license files were found among the copied repositories; source ownership and commits remain recorded. Reader commit `b3892b2417b8167d0cd063c31b2b69da781fd4a9` was researched in the plan; no local Reader suite exists.

## Local platform and plants additions (2026-10-15)

- General suite: 65 unit cases and 19 browser cases. Root documents, router, preferences, activity timestamps, native static output, calendar, worker ownership and coordinated updates are covered. Vite/TypeScript were replaced only after equivalent native-JavaScript checks passed; runtime assertions were retained.
- Plants: original 7 cases / 14 assertion sites unchanged. Added 8 care/date characterization cases (also passing against original Stillgreen) and 8 shared-document/import cases. Added 11 browser workflows, including offline operation and draft/stale-edit safeguards.
- The observation browser flow was corrected to retain the source app's inline observation form and keyboard submit, rather than invent an extra reveal step. Stored-text assertions remain.
- New source mapping: `plants-source-map.json`. Original source files and installed apps remain unchanged. This is local verification, not full migration or physical-device acceptance.

## Coffee integration additions (2026-10-15)

- Original 21 browser workflows retain all 147 original assertion sites. Storage fixtures/readback now use `daily:v1.modules.coffee.data`; theme/language target the Coffee region and the reminder's first-child check targets `#coffee-content`.
- Valid import workflows explicitly preview, download recovery and confirm before the original completion assertions. The shared platform placeholder-heading assertion now checks the Coffee region and its actual first-run Tools heading; navigation-only and storage assertions remain.
- Eight domain cases passed against original Coffee (`baseline-coffee-domain.txt`), then failed on the absent module (`coffee-domain-red.txt`). Nine new service cases cover atomic language saves, references, duplicates, quota/future data and read-only/stale imports. Seven browser additions cover deep links, drafts, conflicts, cancel/future imports, quota errors, settings export drafts and offline/native appearance.
- Red evidence: `coffee-service-red.txt`, `coffee-import-red.txt`, `coffee-browser-red.txt`, `coffee-drafts-red.txt`, `coffee-validation-red.txt`, `coffee-offline-quota-red.txt`, `coffee-settings-draft-red.txt`, `coffee-navigation-red.txt`, `coffee-navigation-style-red.txt`. These show different increments; earlier passing subsets are not whole-migration acceptance.
- `coffee-source-map.json` records application sources and destinations. No original app, installed data, personal export or Excel code was modified/imported.


## Games integration additions (2026-10-15)

- Original 24 browser workflows retain 136 original assertion sites. Storage fixtures wrap the original domain shape in Daily and supply its active registry entry. Assertions read the same scores/settings/records from `modules.games.data`; private history/detail/settings URLs and global-theme selectors become native routes/scoped theme. Valid replacement imports explicitly preview, download recovery and confirm before original restore assertions.
- Eight data characterization cases pass against original Games (`baseline-games-domain.txt`), fail on the absent module (`games-domain-red.txt`) and pass against the refactor. `updateScore` takes a selection object to meet the parameter limit; only that baseline call boundary is adapted.
- Seven service cases first fail against the absent adapter (`games-service-red.txt`), then pass (`games-service.txt`, 15 unit cases including domain). Six new browser cases cover activity resume, language drafts/notification expiry, stale player edits, import cancel/history links, offline score/history/statistics and obsolete session links.
- Behavioral red evidence includes `games-browser-red.txt`, `games-focus-red.txt`, `games-drafts-red.txt` and `games-offline-links-red.txt`. The activity test's initial `running` widget selector was corrected to the existing `activities` ID, and its clock is paused before start so the 90-second UI assertion is deterministic. This fixture correction is not claimed as an implementation regression.
- Source code mapping: `games-source-map.json`; data/workflow invariants: `modules/games/docs/behavior.md`. Hardcoded original English labels still need full Stage 8 localization.
