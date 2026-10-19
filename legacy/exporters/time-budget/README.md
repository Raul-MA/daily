# Time Budget migration exporter

These are prepared local artifacts. The original repository and installations have not been changed or deployed.

`npm run prepare:legacy-budget` checks the pinned original HTML and creates `legacy/patches/timeBudget-export.patch`. It adds an Export for Daily link to the old app and packages this standalone page, exporter and version-1 validator under `daily-migration/`. The copied validator must match Daily's current Time Budget validator before preparation succeeds. Source commit, HTML checksum and exact storage keys are in `provenance.json`.

The patch passes `git apply --check` against the retained original repo. A test also applies it only in a disposable directory, checks every packaged file and verifies that changed HTML is rejected without replacing an existing patch.

See the [shared migration procedure](../../../docs/legacy-exporters.md) for later release, installed-storage context, initial online loading and worker coexistence requirements.

Preview reads only `timeBudget_templates` and `timeBudget_currentState`. Download reads a fresh saved snapshot again. It never writes, removes or clears storage. The export contains templates and the active or paused session, including task identities/status, original start time and task-clock timing. A stable `legacy-budget:<startTime>` ID supplies the identity absent from the old schema. No original clock is restarted. Unknown fields and unrelated keys are not exported.

Malformed JSON, invalid records or blocked storage prevent download and preserve original bytes. The exporter does not repair or silently drop damaged sessions. Empty storage produces an empty migration document without initializing keys. Keep the old installation and its files.

Import the downloaded file through Daily → Time Budget. Its read-only preview and recovery download precede confirmation. Running timers can already be overdue after migration because their original timestamps are retained. The full Daily backup can subsequently include the imported budget together with all other apps.
