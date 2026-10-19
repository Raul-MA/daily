# Time Budget and countdowns

## Problem

Preserve the original deadline/task workflow while its state and running clocks survive navigation inside Daily. The original README describes an older version; the inspected code already restores running sessions. Originals remain untouched.

## How It Works

- `src/app.js` composes the original small methods under `src/methods/`. `view.js` mounts the original layout with scoped DOM access and CSS. Delegated allowlisted actions replace inline handlers; no code strings are evaluated. The shared shell owns installation and service workers.
- The shared menu has three separate panels: Time Budget (setup, running plan and templates), Countdowns, and Settings (backup/import/recovery). `src/sections.js` switches visibility without remounting forms, saving domain data or pausing clocks. Panel selection survives language remounts in UI memory; a full page reload starts at the budget. Hidden budget controls do not receive the Space shortcut.
- `service.js` stores `{templates, session}` as version 1 of `daily:v1.modules['time-budget']`. A private revision stamp rejects stale module writes. A budget and its shared activity change in one root commit, preserving all unrelated modules and language preferences.
- Session snapshots retain IDs, goal/start time, ordered tasks, current index, elapsed time and the running timestamp. Rendering, leaving the module, restoring and ticking never write state. Start/pause/completion and explicit plan/template changes save immediately. Cleanup removes presentation timers without pausing the persisted activity.
- Goal times use strict local `HH:MM`. A goal at or before the original session start rolls to the next local day. Once started, the deadline remains anchored to that start; overdue plans never roll forward during reload.
- A new plan starts paused. Current-task elapsed time continues past its allocation until explicit completion. Pending budgets include the unfinished current minutes and every later task once. Queue edits cannot exceed the remaining budget when increasing allocations.
- Completing an overrun offers exactly the ceiling of its deficit, distributed among later tasks while leaving each at least one minute. Negative/fractional reductions are now rejected; the original UI's permissive reduction check has recorded red/green acceptance. Pending overtime is reconstructed from the completed current task after reload. Keeping budgets advances without reducing them.
- `i18n.js`/`translations.js` contain 130 matching EN/ES copy keys/parameters. Main-template markers resolve against fixed authored markup before user data is inserted; English output retains the exact previous native markup hash. Dynamic methods use explicit lookups. User task/template/countdown names never enter a DOM text-translation pass.
- `queue-drafts.js` stores editing/add-form/error structure, not old-language HTML. Controls rebuild in the current language before form values/stale stamps are restored; numeric reallocation summaries refresh after restoration. Notices retain source messages/parameters and their original expiry only in UI memory, across language remounts/reloads.
- `countdowns.js` uses the shared timestamp activity registry. Multiple named countdowns run independently, with pause/resume and explicit completion. Their one-second displays do not write. Their controls remain in this module.
- `imports.js` recognizes the original name-to-task template object and versioned Time Budget migration backups. Legacy templates merge by name on confirmation, preserving the active session. Migration backups contain templates, the full active session and countdown activities. A full restore replaces those Time Budget components atomically.
- Import file reads ignore superseded selections, cancellations and disposed views. Invalid/future files keep a visible Cancel action; cancel clears selections without changing the plan. Confirmation remains disabled without a valid preview and a subsequent recovery download; successful restore clears selected files.
- Import preview is read-only, bound to the complete current root and protected against preview mutation. UI confirmation requires downloading the root recovery backup first. Cancel does not write. The document store also retains its previous successful root recovery copy.
- Original export stays `timeBudget-templates.json`. Full export is `daily-time-budget.json`; countdowns and active timestamps are included. The legacy active-state exporter is prepared separately; its release to original installations remains deferred.
- Notification permission is requested only by starting a plan. Existing foreground sound/notification attempts are retained; installed-device background notification delivery is not verified. No background execution or automatic task completion is promised.

## Gotchas

- Source: `timeBudget` at `fb9e9be86325d900e64aeda59faad4215cc1d5a9`; mapping and hashes are in `reports/time-budget-source-map.json`. Its README identifies MIT licensing, but no separate license file was found. That statement and source attribution are retained here.
- Dirty setup rows, queue edits, file selections and reallocation controls survive shared-language remounts in memory. Their original module snapshot prevents later saves from overwriting another view. User-authored names are retained verbatim. Authored EN/ES copy uses the shared preference without changing those names or any stored clock values.
- The region fits Daily’s padded parent at 320px; backup/file/countdown controls wrap or shrink without hiding document overflow. Wider source appearance remains scoped as before.
- The eight characterization cases and eight baseline browser workflows ran against the original before porting. Native acceptance adds root atomicity, countdowns, imports, drafts, stale views, quota handling and offline/phone checks. Browser simulation does not establish physical iPhone acceptance.
- Invalid/future module data remains stored and raises an error. It is never silently replaced with an empty plan. `src/validation.js` owns the native persisted contract; runtime interval handles never enter backups.


## Prepared original-app exporter

The original app's normal export remains templates-only. A separate read-only migration page and patch are prepared in [legacy/exporters/time-budget](../../../legacy/exporters/time-budget/README.md). It reads the original two storage keys only, exports the current running/paused session with original task/timer timestamps, and supplies a stable session ID absent from the legacy schema. Invalid data prevents download without clearing keys. The patch has only been applied in a disposable test copy; original-app release and installed-iPhone migration are deferred. Use it from within the original installation after a later authorized release, not from a separate downloaded HTML file.

- Local locale evidence: `reports/time-localization-red.txt` fails the three new Spanish browser cases plus the native stale-save case intentionally changed to Spanish; 16 other cases pass. All original eight source workflows/assertions remain unchanged. `time-localization-first.txt` catches the old fixed 320px minimum (19 pass/one fail); [time-localization-scope.txt](https://github.com/Raul-MA/daily/blob/859fd7b0f1365f90cbef22b0975f612580580e2c/reports/time-localization-scope.txt) passes 22 unit + 21 browser after correction. [time-localization-unit.txt](https://github.com/Raul-MA/daily/blob/859fd7b0f1365f90cbef22b0975f612580580e2c/reports/time-localization-unit.txt) additionally verifies the exact English markup hash. Physical acceptance remains deferred.

- Imports bypass the timer-action duplicate-click guard so a newer file selection can supersede a slow read. Per-import request identity still rejects the old result. `time-import-race-red.txt` catches the previously ignored newer file; the added browser case also cancels a still-pending read without reopening preview or writing records. Timer actions retain their duplicate protection. [time-reload-notices.txt](https://github.com/Raul-MA/daily/blob/859fd7b0f1365f90cbef22b0975f612580580e2c/reports/time-reload-notices.txt) additionally passes all three recovery cases after resuming notice expiry on successful import reload.

## Pending permission and numeric bounds

Starting a plan requests the existing notification permission before committing. After the asynchronous response, the mounted app checks disposal and pending route changes, then rechecks the latest document/draft revision. Leaving the route or changing language cancels that old start; the new view retains its setup draft. No off-screen budget or activity is created. The original permission behavior is unchanged for a current view.

Persisted timestamps and elapsed counters must be finite, nonnegative and within the JavaScript Date range, so malformed backups cannot create unrenderable deadlines or clocks. Original timestamp-based numeric task IDs remain accepted. The new service contract verifies rejection before any write and acceptance of a valid session.
