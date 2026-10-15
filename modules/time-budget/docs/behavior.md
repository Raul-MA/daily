# Time Budget and countdowns

## Problem

Preserve the original deadline/task workflow while its state and running clocks survive navigation inside Daily. The original README describes an older version; the inspected code already restores running sessions. Originals remain untouched.

## How It Works

- `src/app.js` composes the original small methods under `src/methods/`. `view.js` mounts the original layout with scoped DOM access and CSS. Delegated allowlisted actions replace inline handlers; no code strings are evaluated. The shared shell owns installation and service workers.
- `service.js` stores `{templates, session}` as version 1 of `daily:v1.modules['time-budget']`. A private revision stamp rejects stale module writes. A budget and its shared activity change in one root commit, preserving all unrelated modules and language preferences.
- Session snapshots retain IDs, goal/start time, ordered tasks, current index, elapsed time and the running timestamp. Rendering, leaving the module, restoring and ticking never write state. Start/pause/completion and explicit plan/template changes save immediately. Cleanup removes presentation timers without pausing the persisted activity.
- Goal times use strict local `HH:MM`. A goal at or before the original session start rolls to the next local day. Once started, the deadline remains anchored to that start; overdue plans never roll forward during reload.
- A new plan starts paused. Current-task elapsed time continues past its allocation until explicit completion. Pending budgets include the unfinished current minutes and every later task once. Queue edits cannot exceed the remaining budget when increasing allocations.
- Completing an overrun offers exactly the ceiling of its deficit, distributed among later tasks while leaving each at least one minute. Negative/fractional reductions are now rejected; the original UI's permissive reduction check has recorded red/green acceptance. Pending overtime is reconstructed from the completed current task after reload. Keeping budgets advances without reducing them.
- `countdowns.js` uses the shared timestamp activity registry. Multiple named countdowns run independently, with pause/resume and explicit completion. Their one-second displays do not write. Their controls remain in this module.
- `imports.js` recognizes the original name-to-task template object and versioned Time Budget migration backups. Legacy templates merge by name on confirmation, preserving the active session. Migration backups contain templates, the full active session and countdown activities. A full restore replaces those Time Budget components atomically.
- Import preview is read-only, bound to the complete current root and protected against preview mutation. UI confirmation requires downloading the root recovery backup first. Cancel does not write. The document store also retains its previous successful root recovery copy.
- Original export stays `timeBudget-templates.json`. Full export is `daily-time-budget.json`; countdowns and active timestamps are included. The original app still needs its separate legacy active-state exporter in the final migration stage.
- Notification permission is requested only by starting a plan. Existing foreground sound/notification attempts are retained; installed-device background notification delivery is not verified. No background execution or automatic task completion is promised.

## Gotchas

- Source: `timeBudget` at `fb9e9be86325d900e64aeda59faad4215cc1d5a9`; mapping and hashes are in `reports/time-budget-source-map.json`. Its README identifies MIT licensing, but no separate license file was found. That statement and source attribution are retained here.
- Dirty setup rows, queue edits, file selections and reallocation controls survive shared-language remounts in memory. Their original module snapshot prevents later saves from overwriting another view. User-authored names are retained verbatim. Complete EN/ES text localization remains a Stage 8 gate.
- The eight characterization cases and eight baseline browser workflows ran against the original before porting. Native acceptance adds root atomicity, countdowns, imports, drafts, stale views, quota handling and offline/phone checks. Browser simulation does not establish physical iPhone acceptance.
- Invalid/future module data remains stored and raises an error. It is never silently replaced with an empty plan. `src/validation.js` owns the native persisted contract; runtime interval handles never enter backups.
