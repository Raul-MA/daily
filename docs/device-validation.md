# Physical iPhone validation

## Problem

Stage 2 cannot be completed from a container or Chromium emulation. Record observations from the actual iPhone, installed apps and Pages origin before relying on shared storage, authenticated browser access or background timers.

## How It Works

Use the existing installations and keep their data. Daily currently has only a test harness and has not been deployed. Do not remove installed apps or import into them for these checks. Share only statuses, counts and file sizes; keep tokens and backup contents on your device.

### Checks available now

1. Record the iPhone model and iOS version, and which old apps are installed as Home Screen PWAs.
2. Export and restore are confirmed working by the user for the existing apps; most backups contain fewer than 50 entries, with a reported size of approximately 20 KB. This check does not need repeating. Keep the files for later Daily migration validation. Existing Time Budget export covers templates only; record that limitation separately. Missing WhatsApp/Reader/current-budget migration exporters are known implementation work, not failed user checks.
3. The user confirms the existing Time Budget survives lock, backgrounding and closing/reopening with correct timing. This characterizes the old app; repeat against Daily after its timer service exists. Do not ask the user to repeat the old-app check.
4. The user confirms Reader works on the iPhone. Daily Review is a new feature and has not been verified. Existing Reader success does not establish authenticated browser API access from Daily; prepare that diagnostic before requesting its results.

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
| Existing export / restore | User confirms export and restore work | Most backups contain fewer than 50 entries; reported backup size approximately 20 KB. Combined Daily migration and restore remain future acceptance checks |
| Old Time Budget background / restart | User confirms success | Lock, background and closing/reopening preserve the active budget with correct timing; Daily acceptance remains deferred |
| Existing Reader | User confirms it works | Reader works on the iPhone; Daily API integration still needs separate verification |
| New Daily Review | Not previously available; unverified | Implement the diagnostic/integration or direct-review fallback before requesting verification |
| Authenticated Pages-origin API calls | Pending diagnostic hosting + user | Three endpoint outcomes, no token/payload |
| Largest combined backup / storage | User reports small record counts and approximately 20 KB backup size; aggregate measurement and storage tests pending | Aggregate byte size and recovery results |
| Legacy worker coexistence | Pending worker fixes / release | Cache ownership and coexistence results |
| Daily timer / piano process restore | Deferred until platform and modules | Physical device results against Daily |
