# Local import compatibility — 2026-10-18

All three user-supplied files pass the current Daily app import services and actual Chromium file-selection, preview, recovery-download, confirmation and reload flows. No application changes were required.

| File | App | Imported records | Result |
| --- | --- | --- | --- |
| `board-game-score-tracker-2026-09-12.json` | Games | 2 players, 9 games, 14 sessions | Pass, replacement |
| `crois-2026-07-17.json` | Coffee | 5 beans, 10 entries | Pass, merge and replacement services; replacement browser flow |
| `plantas.json` | Plants | 7 plants, 68 care records | Pass, replacement |

Service checks used isolated in-memory Daily storage, verified read-only previews, original record preservation, shared-language preservation, exact prior-root recovery and reopening. Coffee's existing legacy normalization adds supported brew fields; every supplied field was checked for preservation. Browser checks used fresh disposable contexts, verified confirmation requires a recovery download, completed that download, imported each actual file and compared persisted module data before and after reload. Coffee first-run tools setup was completed before opening its import screen.

The local static build passed with 707 assets. Temporary check scripts: `/tmp/daily-personal-import-check.mjs` and `/tmp/daily-personal-import-browser.mjs`. No personal records or backup copies were added to tracked fixtures or build assets; input files were unchanged. No existing installation was imported into. These checks establish local compatibility, with physical-device migration still deferred.
