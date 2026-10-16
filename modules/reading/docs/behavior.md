# Reader migration boundaries

## Current state

Reader is unfinished. Its original behavior is characterized, and native domain/persistence code passes unit tests. The shared UI, Daily Review, dashboard providers and complete local acceptance are pending. The full Reader suite intentionally remains red on its missing mounted interface.

Source is Reader Picker commit `b3892b2417b8167d0cd063c31b2b69da781fd4a9`, checked out at `/workspaces/.daily-reader-source` for local baseline tests. It has no original tests or AGENTS file. Source hashes are in `reports/reading-source-map.json`. Original README shortcut/privacy explanations remain the baseline reference; deployment instructions are historical and do not authorize remote work.

## Data and selection

`service.js` owns version 1 of `daily:v1.modules.reading`: settings, current picks and optional last item. Reads never initialize storage. Revision checks reject stale changes; failed root writes retain the previous document and other modules. Picks persist separately from preferences, so displaying a page must not reshuffle them.

`credentials.js` keeps tokens in memory by default. Explicit session saving uses `daily:readwise:session:v1`; installed-app saving uses `daily:readwise:token:v1`. Neither key belongs in ordinary backups or generic worker caches. Account changes/forget clear picks, remembered items and metadata cache. Pending results cannot commit after the account or preferences change.

`metadata.js` preserves the original remaining-time formula and 238-word estimate. Unknown duration is null, never zero minutes. `selection.js` excludes archived/completed/child records, deduplicates IDs, supports custom counts 1–20 and uniform or original started-first/location-priority selection. A finite budget excludes unknown duration unless explicitly enabled. Randomness describes the scanned pool, not the whole library.

`config.js` retains the source shortcut parser and aliases. Native UI must translate compatibility parameters into the shared hash route without saving launch-only overrides. The original count=2 invalid fixture now uses count=21, because supporting custom counts is an explicit plan change; the fallback assertion remains, alongside new acceptance for counts 2 and 20.

`client.js` issues real direct requests with explicit token headers, no-store response handling and bounded cursor scans. Truncation is exposed; malformed/repeating cursors reject. Cache metadata is account-specific and currently in memory. Persisted disposable cache, rate-limit cooldown, full timeout composition, last-item revalidation and review operations still require tests/implementation.

## API evidence

Rechecked official [Reader docs](https://readwise.io/reader_api) and [Readwise docs](https://readwise.io/api_deets) on 2026-10-16. Reader list uses cursor pagination and documents a 20/minute limit with Retry-After on throttling. Scheduled review retrieval and explicit completion have separate endpoints. These public docs do not establish per-card resurfacing feedback or structured Q&A support. Keep the accepted direct-review fallback; never fabricate Q&A or simulate scheduling. No authenticated request was made.

## Tests and next work

- `baseline-reading-characterization.txt`: 12 cases pass against source before implementation.
- `baseline-reading-browser.txt`: those 12 plus five browser flows pass against unchanged source.
- `reading-characterization-red.txt`, `reading-contracts-red.txt`, `reading-persistence-red.txt`: missing implementation recorded before each port.
- `reading-storage.txt`: all 24 native unit cases pass; strict lint passes in `reading-storage-lint.txt`.
- `reading-ui-red.txt`: native unit core passes while all five mounted UI workflows fail, as expected for the absent view.

Next: add missing transport/review/shared-browser contracts, then port the original HTML/CSS and wire Reader/Daily Review through the shell. Preserve baseline assertions, scoped appearance and original shortcuts. Full localization, combined recovery and physical token/iPhone checks remain distinct gates.
