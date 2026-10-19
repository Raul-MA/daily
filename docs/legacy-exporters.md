# Legacy migration exporters

## Problem

The old apps' normal exports omit some migration state: Time Budget's active session, Plants' Things preferences, Reader preferences/remembered item and WhatsApp's draft. Prepared exporters fill those gaps without changing original repositories or personal data.

## How It Works

| App | Prepare locally | Export includes | Detailed contract |
| --- | --- | --- | --- |
| Time Budget | `npm run prepare:legacy-budget` | Templates and current running/paused session with original timestamps | [Time Budget](../legacy/exporters/time-budget/README.md) |
| Plants | `npm run prepare:legacy-plants` | Plant/history/schedule records, Things preferences and explicit read-only recovery provenance | [Plants](../legacy/exporters/plants/README.md) |
| Reader | `npm run prepare:legacy-reader` | Known picker preferences and optional minimized remembered metadata | [Reader](../legacy/exporters/reader/README.md) |
| WhatsApp | `npm run prepare:legacy-whatsapp` | Saved recipient, message and original reminder date/time, including incomplete/expired drafts | [WhatsApp](../legacy/exporters/whatsapp/README.md) |

Run preparation one app at a time. Each command checks the pinned source HTML and copied native schemas, then writes a patch under `legacy/patches/`. The patch adds an Export for Daily link and standalone files under the old app's `daily-migration/` path. Preparation only reads the original source. Tests apply patches in disposable copies, compare every file and reject changed HTML without overwriting a previous patch. Separate `git apply --check` calls verify the retained sources.

The pages offer English/Spanish preview and download. Download reads a fresh saved snapshot, validates it and exports only that app's migration fields. No storage writes, removals, API calls or external handoffs occur. Invalid data remains available in its original keys; the exporter never resets it. Plants can read a valid recovery snapshot without repairing original storage, with an explicit preview label.

Daily imports the files through the individual app's existing preview/recovery/confirmation screen. The combined full-PWA importer accepts Daily documents, not these single-app files. After app-by-app migration, Settings can export one full Daily backup.

Coffee and Games retain their existing comprehensive exports/imports. Original Toniq has no saved practice history to migrate; new Daily practice records are included in full Daily backups. No extra exporter is required for those apps.

## Gotchas

- These are local artifacts, not released changes. Applying, committing or deploying patches in the old repos is deferred. Preparing a patch does not add a link to an already installed app.
- After a later authorized release, open each exporter **inside its original installed PWA**. A separate Safari tab, Daily or a downloaded HTML file does not establish access to that installation's storage. Keep original installations and backup files.
- Initial online loading is required; exporter files are not added to old workers' install precaches. No additional worker or manifest is registered. Check [legacy worker coexistence](legacy-workers.md) before a later shared-origin installation.
- Reader's older preferences object may contain a token property. A strict field allowlist excludes it; separate token/cache keys are never read. Reenter the token privately in Daily after import.
- Running clocks preserve original start times and can already be overdue. WhatsApp dates are preserved rather than rescheduled. Inspect the imported state before the next action.
- Standalone artifacts, provenance, fixtures and patches stay outside Daily's static/runtime output. All tests use synthetic records, not personal backups. Physical migration and authenticated API behavior remain deferred.
