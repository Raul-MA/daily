# Physical iPhone validation

## Problem

Local Stage 2 preparation is complete. By the 2026-10-15 user instruction, live API testing and later product/device checks are deferred and do not block local implementation. Keep this ledger for later verification; mocks and desktop emulation do not prove physical-device behavior.

## How It Works

Use the existing installations and keep their data. All seven Daily apps are implemented locally; no deployment is authorized. Local workflow tests pass, while final migration audits are still in progress. Do not remove installed apps or import into them for these checks. Share only statuses, counts and file sizes; keep tokens and backup contents on your device.

### Checks available now

1. Record the iPhone model and iOS version, and which old apps are installed as Home Screen PWAs.
2. Export and restore are confirmed working by the user for the existing apps; most backups contain fewer than 50 entries, with a reported size of approximately 20 KB. This check does not need repeating. Keep the files for later Daily migration validation. Existing Time Budget export covers templates only; record that limitation separately. The legacy current-budget exporter is prepared locally but has not reached the original installation. Legacy WhatsApp/Reader exporters remain implementation work, not failed user checks.
3. The user confirms the existing Time Budget survives lock, backgrounding and closing/reopening with correct timing. This characterizes the old app; repeat against Daily when the user resumes physical-device testing. Do not ask the user to repeat the old-app check.
4. The user confirms Reader works on the iPhone. Daily Review is a new feature and has not been verified. Existing Reader success does not establish authenticated browser API access from Daily; the standalone diagnostic is ready for later private token testing.

### Deferred checks for later user testing or implemented features

- When the user is ready, authenticated GET requests from the local diagnostic page: `/api/v2/auth/`, `/api/v3/list/?limit=1`, `/api/v2/review/` on Readwise. Enter the token locally, in memory only; report status or network/CORS failure without response bodies. No POST, PATCH or DELETE is needed for this feasibility check. A 404 Daily Review means no available review, not a failed local app. A 401/403 needs separate credential validation. A dummy-token request does not prove authenticated success.
- Measure the largest combined export, validate its schema and referenced IDs, and test quota/corruption/restore handling before choosing a practical root-document budget. The local coffee sample is only 20,124 bytes and cannot represent all installed data.
- After prefix-scoped cache-cleanup fixes reach the five affected old workers, verify coexistence on the shared origin without deleting unrelated caches. Do not install Daily alongside broad-cleanup workers and call that safe coexistence.
- When physical-device testing resumes, repeat lock/background/process-restart checks for a budget, countdown, game and piano session in Daily. For piano, verify the prompt stays stable while elapsed time advances, explicit pause freezes time and no missed prompts replay.

Record results in the table below, distinguishing old-app characterization from Daily acceptance. A successful Safari tab check does not prove installed-PWA storage access.

### Later installation and migration walkthrough

These are instructions for the later device session, not a request to deploy now.

1. Keep each original installation and its backups. Check the worker coexistence prerequisite in [legacy-workers.md](legacy-workers.md) before installing on the shared origin.
2. Open Daily's eventual secure URL in Safari, then use Share → Add to Home Screen. Open the new Daily icon and confirm the app menu reaches all seven apps. Record the URL, iOS version and whether the test was installed or a Safari tab.
3. Open each app's import screen for its original export. Preview counts and warnings, download recovery, then confirm. Do not use the full-PWA importer for a legacy app file. Original installations remain separate; Daily does not read their installed storage automatically.
4. In Daily Settings, download the full backup. It includes saved records, settings, layout and activity timestamps, but excludes tokens, caches and unsaved forms. Enter the Readwise token privately again after restore. Keep the backup file on the device; report only its size and counts.
5. Test full restore in a separate disposable installation/profile when available, with a recovery copy first. Compare app counts, saved text, widget order and running activity state. Restoration keeps timer start times, so an old running timer may already be overdue.
6. Reopen every app offline, including a piano lesson with audio. Close/reopen the installation and follow a saved deep link. Separately test lock/background/termination for budget, countdown, game and piano; explicit pause must freeze the appropriate timer.
7. Exercise Reader and Daily Review with the private token. Record endpoint status and visible behavior without copying response payloads. Review completion must be server-confirmed; Things and WhatsApp handoffs require actual app checks and cannot be inferred from generated links.
8. For a later application update, keep one unfinished form and one running session open in separate tabs. Confirm activation waits until every tab is safe, and records remain unchanged after acceptance. Never clear origin storage or unregister sibling workers as a workaround.

## Gotchas

- No token, authenticated response, personal backup or screenshot containing records belongs in Git or chat.
- Do not enable a proxy to bypass a failed browser endpoint. Record the constraint and use the approved direct-review or explicit import fallback.
- Public documentation, desktop tests and mock fixtures cannot fill physical evidence cells.
- Some acceptance checks require later product increments. Mark them deferred with a dependency; do not invent passing results to close Stage 2.

## Evidence ledger

| Check | Status | Evidence needed |
| --- | --- | --- |
| Phone / installed-app inventory | Pending user | Model, iOS, installation names |
| Existing export / restore | User confirms export and restore work | Most backups contain fewer than 50 entries; reported backup size approximately 20 KB. Combined Daily migration has synthetic local acceptance tests; physical migration remains deferred |
| Old Time Budget background / restart | User confirms success | Lock, background and closing/reopening preserve the active budget with correct timing; Daily acceptance remains deferred |
| Existing Reader | User confirms it works | Reader works on the iPhone; Daily API integration still needs separate verification |
| New Daily Review | Not previously available; unverified | Implement the diagnostic/integration or direct-review fallback before requesting verification |
| Authenticated API calls from the actual test origin | Diagnostic implemented; user token testing deferred without blocking local implementation | Three endpoint outcomes, no token/payload |
| Largest combined backup / storage | User reports small record counts and approximately 20 KB; 12 recovery tests pass with synthetic data; aggregate/device measurement pending | Aggregate byte size and recovery results |
| Legacy worker coexistence | Five tested patches prepared; application/release pending | Cache ownership and coexistence results |
| Daily timer / piano process restore | Implemented locally; physical acceptance deferred | Physical device results against Daily |
