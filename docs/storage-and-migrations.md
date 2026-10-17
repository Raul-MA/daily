# Storage and migrations

## Problem

All seven apps share one local document, `daily:v1`. A backup must include saved records, preferences, layout and activities without credentials. Invalid imports and storage failures must retain current records; restoring a timer must preserve its original timestamps.

## How It Works

`packages/data/src/document-store.js` accepts a storage port, a key, a runtime validator and a fresh-document factory. Version 1 documents are supported. Future root versions are rejected without mutation; upgrades require an explicit migration.

A load reads the primary document first. Invalid data is preserved at `<key>:corrupt` before trying `<key>:recovery`. Recovery returns the explicit `recovered` status and leaves the corrupt primary unchanged. If preservation fails, the error propagates. If no readable document exists, load throws; it returns a fresh value only when both primary and recovery are absent.

A save serializes and validates the exact JSON representation before touching storage. It copies the previous validated value to recovery, then replaces the primary key once. A failed recovery write prevents replacement; a failed primary write leaves the previous primary readable. Returned values are newly parsed snapshots, so modifying a loaded value does not implicitly save it.

`apps/daily/src/backup/service.js` exports `{app: 'daily-pwa', schemaVersion: 1, data: root}` and also accepts a bare root, including recovery downloads from module imports. `backup/schema.js` rejects unknown modules and future versions before applying every domain validator. `backup/references.js` requires unfinished budget, game and piano activities to match their domain session, identity, status and timing. Independent countdowns use the activity validator. Completed activities may outlive their domain session.

Settings offers a read-only count preview and replacement/timer warnings. A recovery download is required before confirmation. Selecting another file resets that requirement; Cancel clears the selected file without changing records. Individual app import screens, linked from Settings, accept their legacy formats.

Private WeakMap records protect preview identity, contents and the current root fingerprint. Confirmation rejects changed, reused or stale previews, validates the retained incoming snapshot again, and replaces the root once. IDs and clock timestamps remain intact; elapsed time is reconstructed rather than restarted. Successful full restore explicitly discards prior form drafts.

When the root cannot be read, the attention screen offers `backup/recovery.js` through the same preview/download/confirm/cancel controls. Its recovery file is `{app:'daily-storage-recovery', schemaVersion:1, entries}` and preserves the exact primary/recovery/corrupt strings. This is a manual-recovery artifact, not a normal full-PWA backup to import. No other storage keys are enumerated or exported. Select a supported full Daily backup to restore; download the preserved data before confirming. Stored future root versions are exportable but cannot be downgraded through this screen.

The recovery adapter validates the full incoming domain document, retains private preview identity/content, and compares all three raw snapshots before applying. It writes the validated primary once and leaves prior recovery/corrupt keys intact. Credential cleanup follows replacement, with the same honest `rootApplied` reporting as ordinary restore. The shell ignores non-preference input changes rather than attempting to read a damaged root and discarding the preview. Leaving the attention screen disposes its file job/listeners.

The platform requests durable storage when the browser provides it. Unsupported, refused and failed requests are tolerated without claiming guaranteed retention. User-exported backups remain the recovery mechanism.

Readwise credentials and disposable metadata/review caches use separate keys and never enter the export. Credential release happens only after successful root replacement. A cleanup error reports a completed data restore with a credential warning, rather than claiming rollback. A failed root write does not release credentials.

`tests/general/backup.test.mjs` covers schema/reference validation and atomicity. `tests/e2e/backup.spec.js` covers downloads, separate-profile restore, cancellation, stale/quota failures, prior drafts and cleanup reporting. Existing storage tests also exercise Unicode and a synthetic document above 140 KB, compared with the approximate 20 KB backups reported by the user. These fixtures do not establish an actual iPhone quota.

## Gotchas

- Existing apps' export and restore are user-confirmed working. Do not request personal files to test the combined importer; all repository fixtures are synthetic.
- Generic root validation and the combined domain registry have different responsibilities. Recovery export preserves a readable generic root even when domain validation rejects a module.
- Module revisions and whole-root preview fingerprints reject stale confirmations against the latest readable document. The current write policy is one editing tab at a time. Synchronous localStorage is not a cross-tab transaction or compare-and-swap; simultaneous writes across tabs are unsupported. A second tab may display data, but optimistic revision checks do not serialize competing writers.
- Credential storage failures can leave an old saved credential behind. Report the cleanup warning explicitly; do not claim successful removal after such errors.
- Actual iPhone migration and authenticated browser-origin Readwise checks remain deferred.
- No user records or Readwise token are written by the diagnostic page; it does not use this store.
