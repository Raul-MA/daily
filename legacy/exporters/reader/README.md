# Reader migration exporter

These are prepared local artifacts for the pinned `random-readwise` source checkout. Existing installations and source files are unchanged; no release or live authenticated request has been performed.

`npm run prepare:legacy-reader` checks the pinned checkout's original HTML and creates `legacy/patches/random-readwise-export.patch`. It adds an Export for Daily link and a standalone EN/ES export page under `daily-migration/`. The default source is `/workspaces/.daily-reader-source`; its public repo, source commit and checksum are in `provenance.json`. Preparation checks copied settings/document validators against their native versions. Packaging tests apply only in a disposable copy, and the patch passes `git apply --check` against the unchanged checkout.

See the [shared migration procedure](../../../docs/legacy-exporters.md) for later release, installed-storage context, initial online loading and worker coexistence requirements.

The exporter reads current preferences from `readerPicker.settings.v2`, falling back to `readerPicker.settings.v1` only when the current key is absent. Both formats are flat settings objects; the older object may contain a token. Only known preference fields are copied, with the same numeric/location normalization used by Daily's legacy importer. Unknown fields, token and remember-token options are excluded. An invalid current object fails instead of silently choosing older settings or resetting preferences.

The remembered-item key is read only when Remember last item is enabled. Its metadata is minimized and validated: ID, safe Reader URL, title, source/author/category/location and reading estimates/progress. Article bodies, unknown fields and credential properties are excluded. Missing optional data remains absent; malformed remembered data fails rather than being silently erased. Token and cache keys are never read, written or removed. Export performs no API requests and does not change source storage.

Download reads a fresh saved snapshot again. Keep the original installation and this backup. Import in Daily → Reader → Backups, preview, download recovery and confirm. Enter the token privately again in Daily. The old app's transient current picks and disposable caches are not migration records; Daily can generate fresh picks after authentication.

The exporter and patch stay outside Daily's runtime/static output. Local synthetic tests cover both old settings keys, actual native import, privacy allowlists, opted-out remembered data, malformed/blocked storage, EN/ES, safe literal titles and 320px layout. Physical iPhone migration, live connectivity and release remain deferred.

The standalone validator and its local `timestamps.js` dependency match the native Reader schema. Preparation checks both files byte-for-byte and includes the helper in the generated patch. Saved pick timestamps are bounded by the JavaScript Date range; the legacy export still reads only its three documented source keys.
