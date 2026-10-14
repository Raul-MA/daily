# Physical iPhone validation

## Problem

Stage 2 cannot be completed from a container or Chromium emulation. Record observations from the actual iPhone, installed apps and Pages origin before relying on shared storage, authenticated browser access or background timers.

## How It Works

Use the existing installations and keep their data. Daily currently has only a test harness and has not been deployed. Do not remove installed apps or import into them for these checks. Share only statuses, counts and file sizes; keep tokens and backup contents on your device.

### Checks available now

1. Record the iPhone model and iOS version, and which old apps are installed as Home Screen PWAs.
2. In the installed Coffee, Games and Plants apps, export their existing JSON backups into Files. Record export success, file sizes and the visible number of entries/beans, players/games/sessions and plants. Check that an export has readable JSON without sending its contents here. Existing Time Budget export covers templates only; record that limitation separately. Missing WhatsApp/Reader/current-budget migration exporters are known implementation work, not failed user checks.
3. With an existing active Time Budget, note the visible task, remaining time and clock time. Lock the phone for about a minute, reopen the installed app and compare the elapsed time. Repeat after leaving the app and after terminating/reopening it. Do not start another budget over an active one. Record whether the same tasks/timing return and any loss. This characterizes the old app only; repeat against Daily once its timer service exists.
4. Open the Readwise Daily Review and Reader links from the phone and confirm the expected account/content opens. This checks external handoff only. It does not establish authenticated API access or CORS.

### Checks requiring a hosted diagnostic or implemented feature

- Authenticated GET requests from a page on `https://raul-ma.github.io`: `/api/v2/auth/`, `/api/v3/list/?limit=1`, `/api/v2/review/` on Readwise. Enter the token locally, in memory only; report status or network/CORS failure without response bodies. No POST, PATCH or DELETE is needed for this feasibility check. A 404 Daily Review means no available review, not a failed local app. A 401/403 needs separate credential validation. A dummy-token request does not prove authenticated success.
- Measure the largest combined export, validate its schema and referenced IDs, and test quota/corruption/restore handling before choosing a practical root-document budget. The local coffee sample is only 20,124 bytes and cannot represent all installed data.
- After prefix-scoped cache-cleanup fixes reach the five affected old workers, verify coexistence on the shared origin without deleting unrelated caches. Do not install Daily alongside broad-cleanup workers and call that safe coexistence.
- After persisted activities exist, repeat lock/background/process-restart checks for a budget, countdown, game and piano session in Daily. For piano, verify the prompt stays stable while elapsed time advances, explicit pause freezes time and no missed prompts replay.

Record results in the table below, distinguishing old-app characterization from Daily acceptance. A successful Safari tab check does not prove installed-PWA storage access.

## Gotchas

- No token, authenticated response, personal backup or screenshot containing records belongs in Git or chat.
- Do not enable a proxy to bypass a failed browser endpoint. Record the constraint and use the approved direct-review or explicit import fallback.
- Public documentation, desktop tests and mock fixtures cannot fill physical evidence cells.
- Some acceptance checks require later product increments. Mark them deferred with a dependency; do not invent passing results to close Stage 2.

## Evidence ledger

| Check | Status | Evidence needed |
| --- | --- | --- |
| Phone / installed-app inventory | Pending user | Model, iOS, installation names |
| Existing export feasibility | User reports all apps export successfully | Most backups contain fewer than 50 entries; reported backup size approximately 20 KB. Per-app scope, exported coverage and restore fidelity remain unverified |
| Old Time Budget background / restart | Pending user | Observed elapsed time and preserved tasks |
| Reader / Daily Review external handoff | Pending user | Links open correctly or error |
| Authenticated Pages-origin API calls | Pending diagnostic hosting + user | Three endpoint outcomes, no token/payload |
| Largest combined backup / storage | User reports small record counts and approximately 20 KB backup size; aggregate measurement and storage tests pending | Aggregate byte size and recovery results |
| Legacy worker coexistence | Pending worker fixes / release | Cache ownership and coexistence results |
| Daily timer / piano process restore | Deferred until platform and modules | Physical device results against Daily |
