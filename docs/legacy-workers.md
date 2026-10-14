# Legacy service-worker coexistence

## Problem

Five original service workers delete every cache except their current one during activation. Because the chosen project Pages deployment shares an origin with the old apps, that behavior can remove Daily or sibling caches.

## How It Works

`tests/fixtures/legacy-workers/` contains each original cache name and activation handler, with source commits and full-file SHA-256 values in `provenance.json`. These are portable test fixtures, not deployed workers. The original handlers fail five ownership tests; the prepared guards pass by deleting only old caches starting with the worker's owned prefix.

`npm run prepare:legacy-workers` reads the retained sibling repos, checks their exact source hashes, and writes reviewable patches into `legacy/patches/`. An optional first argument to `scripts/prepare-legacy-workers.mjs` selects the parent containing those repos. If a source changed, preparation stops rather than editing an unfamiliar worker.

| Repo | Worker | Owned prefix |
| --- | --- | --- |
| stillgreen | `service-worker.js` | `plant-tracker-` |
| coffee-tracker | `service-worker.js` | `crois-` |
| game-tracker | `service-worker.js` | `board-game-score-tracker-` |
| timeBudget | `service-worker.js` | `time-budget-` |
| toniq | `sw.js` | `toniq-` |

Each patch changes one cleanup guard. Existing cache names, install assets and fetch behavior are retained. All five patches passed `git apply --check` in their source repos. They have not been applied, committed there, pushed or released. Preparing patches does not change installed workers.

Apply and release one repo at a time when preparing coexistence. From its repo, use `git apply --check /workspaces/daily/legacy/patches/<repo>.patch`, then apply that patch and run its relevant checks. Preserve unrelated working-tree changes. Confirm the deployed worker contains the prefix guard, then open the corresponding old installation to receive the update. Users who have not loaded a fixed worker can still have the old broad-cleanup behavior.

## Gotchas

- Never broadly unregister workers or clear origin storage as a migration shortcut.
- The new PWA must use its own worker/cache namespace and cache only owned resources. These legacy patches are not a substitute for its offline/update tests.
- VM activation tests prove the cleanup filter with synthetic cache keys. Installed iPhone coexistence remains a release/device check after the fixes reach users.
- The generated patch artifacts are not included in the Vite application build.
