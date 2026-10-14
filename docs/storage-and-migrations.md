# Storage and migrations

## Problem

A storage failure must preserve the last readable document and report failure. Malformed data must not silently become empty collections. The Stage 2 storage prototype tests these constraints before module adapters and the combined restore UI exist.

## How It Works

`packages/data/src/document-store.ts` accepts a storage port, a key, a runtime validator and a fresh-document factory. This prototype supports version 1 documents. Future root versions are rejected without mutation; upgrades require an explicit migration.

A load reads the primary document first. Invalid data is preserved at `<key>:corrupt` before trying `<key>:recovery`. Recovery returns the explicit `recovered` status and leaves the corrupt primary unchanged. If preservation fails, the error propagates. If no readable document exists, load throws; it returns a fresh value only when both primary and recovery are absent.

A save serializes and validates the exact JSON representation before touching storage. It copies the previous validated value to recovery, then replaces the primary key once. A failed recovery write prevents replacement; a failed primary write leaves the previous primary readable. Returned values are newly parsed snapshots, so modifying a loaded value does not implicitly save it.

Twelve general tests cover round trips, prior-state recovery, invalid/future schemas, failures writing primary/recovery/corrupt copies, explicit corruption handling, Unicode and lossy serialization. A synthetic document exceeds 140 KB, above the approximate 20 KB backup size reported by the user. This exercises serialization/recovery behavior in a storage test double; it does not establish the actual iPhone quota or measure the combined user export.

## Gotchas

- Existing apps' export and restore are user-confirmed working. Do not request their files or repeat those checks just to run this prototype.
- This is not yet the combined PWA backup/import feature. Root/module schemas, nested reference validation, import preview, recovery export downloads, user-facing error reporting and committed-change events still need their own acceptance tests.
- Cross-tab concurrent editing is not coordinated by this prototype. Add an explicit revision/conflict policy before adopting it for shared production records.
- No user records or Readwise token are written by the diagnostic page; it does not use this store.
