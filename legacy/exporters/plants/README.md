# Plants migration exporter

These are prepared local artifacts. The original Stillgreen repository and installations have not been modified or deployed.

`npm run prepare:legacy-plants` checks the pinned original HTML and creates `legacy/patches/stillgreen-export.patch`. It adds an Export for Daily link to the old app and packages a standalone EN/ES export page under `daily-migration/`. Source commit, HTML checksum and allowed storage keys are in `provenance.json`. The copied constants, envelope parser and validator must match Daily's native version-1 plant schemas before preparation succeeds.

The patch passes `git apply --check` against the retained original repo. Packaging tests apply it only in a disposable copy, compare every file and reject changed HTML without replacing an existing patch. Applying or releasing it to the original installation remains deferred until authorized.

See the [shared migration procedure](../../../docs/legacy-exporters.md) for later release, installed-storage context, initial online loading and worker coexistence requirements.

The exporter includes complete plant records, care history, manual schedule dates and Things reminder preferences. It accepts both the original bare array and the checksummed version-1 envelope. It reads the primary snapshot first, then the original recovery order: pending, backup 1, backup 2. A valid primary wins even if a backup has a different revision. Recovery reads are labeled in the preview and the export's `recoverySource` metadata; they never repair, rewrite, remove or clear original keys. Daily ignores that provenance field when importing the records.

Malformed or checksum-invalid snapshots can fall back to the first readable recovery, matching the original order. If no readable copy exists, download fails instead of exporting an empty collection. An unsupported storage version stops export even when an older recovery exists, preventing an implicit downgrade. Missing storage alone produces empty plants and disabled Things preferences without initializing keys. Invalid Things settings or blocked storage stop download without resetting data. Unrelated apps and credential keys are never read.

Download reads a fresh saved snapshot again. Keep the original installation and this backup. Import through Daily → Plants → Plant settings, preview counts, download recovery and confirm. A normal old-app plant export still works through that importer, but omits the Things preferences included here.

These artifacts remain outside Daily's runtime/static output. Local tests cover actual Daily import, both old formats, Unicode/history/manual dates, exact recovery priority, malformed/future/checksum cases, source-storage preservation, EN/ES and 320px layout. Physical iPhone migration and release of the patch remain unverified.
