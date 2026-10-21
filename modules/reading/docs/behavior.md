# Reading behavior and recovery

## Problem

Reader Picker and the new Daily Review share Daily's routing, preferences and offline lifecycle while keeping credentials outside authoritative records. Source commit `b3892b2417b8167d0cd063c31b2b69da781fd4a9` is pinned at `/workspaces/.daily-reader-source` for baseline tests; it is not a runtime dependency. Source hashes and split destinations are in `reports/reading-source-map.json`. Local acceptance passes; see root progress for completed reports.

## How It Works

`service.js` owns version 1 of `daily:v1.modules.reading`: settings, persistent current picks and optional remembered item. Reads never initialize storage. Revision checks reject stale writes; failed commits preserve the previous root and unrelated modules. Page/widget rendering never reshuffles picks or opens Reader. Picker and global Settings edit the same preferences. Scoped source HTML/CSS preserves the original appearance, with added custom controls and shared navigation. English/Spanish translation leaves fetched titles and user text untouched. Dirty controls, dialogs, invalid custom values and token drafts survive language changes.

`metadata.js` retains `ceil(total minutes × (1 − progress))` and the 238-word estimate. Unknown duration is null. `selection.js` deduplicates IDs, excludes archived/completed/child records and supports counts 1–20. Original policy prioritizes started items, then unread by ordered locations; uniform policy samples the eligible pool uniformly. Finite budgets exclude unknown duration unless enabled. The bounded scan is not whole-library randomness.

`client.js` makes real direct requests with Token headers. It scans locations sequentially, bounds each page by the remaining allowance and rejects malformed/repeated cursors. `rate-limit.js` enforces a rolling local 20/minute cap and Retry-After cooldown; there is no automatic retry. `request.js` combines caller cancellation and a 20-second deadline, with no-store/omit-credentials/no-referrer fetch options. The auth test handles its empty 204 response separately. Actual authenticated/browser-origin success remains deferred to the user.

`cache.js` stores minimized metadata in memory and a disposable session key. `review/cache.js` stores a separate account-scoped latest review. Opaque account IDs, not tokens, associate caches. Picks distinguish selection time from fetch time; page and widgets show freshness and truncated-scan notices. Offline reopening retains saved picks/highlights; a failed refresh keeps previous data and reports failure. This does not cache full Reader articles.

`credentials.js` uses memory by default. Explicit session retention uses `daily:readwise:session:v1`; installed-app retention uses `daily:readwise:token:v1`. Neither belongs in root exports or worker caches. `account-epoch.js` keeps an opaque local account generation outside backups. Changing/forgetting credentials invalidates old tabs, late results and stale session credentials; affected tabs must reconnect. Account/preferences changes reject pending results. Forget removes credentials before attempting root cleanup, so a quota failure cannot silently retain the token. Errors remain visible and previous canonical data is preserved if it cannot be replaced.

`service-actions.js` revalidates remembered items by ID. Finished, archived, missing and child items disappear; failed requests retain the prior item. Opening a saved pick remembers it only when enabled. Disabling that preference removes the remembered item.

`review/service.js` retrieves the latest available scheduled review, not an invented review for today's date. Explicit completion preflights the displayed ID, then POSTs only if it is still current and incomplete; completion requires a matching server confirmation. Language changes retain pending confirmation. Review failures remain isolated from local apps. Home uses independent providers and a fifteen-minute freshness window, without retry loops after errors.

`review/presentation.js` and `review/cards.js` can present explicitly supported structured Q&A with reveal/focus/next-card reset. The documented API currently supplies ordinary highlights; these never become fabricated questions. The review uses one large highlight card, source metadata above the text, a progress count/dots and a fixed bottom Discard/Master/Frequency/Done bar in Reader’s existing light style. Discard, Master and Frequency open the current Readwise review; they do not perform those actions automatically. The Readwise options disclosure retains Never/Soon/Later/Someday as explicit links to choose feedback in Readwise. Done advances locally; the final Done submits explicit review completion and waits for server confirmation. Previous card allows revisiting highlights without submitting completion. The final Done retains the accessible name “Mark review complete” (EN) / “Marcar repaso completado” (ES). No private scheduling/delete endpoint is invented. The direct Daily Review link remains available without a token or when requests fail.

`imports.js` accepts `{app:"daily-reading",schemaVersion:1,data}` and legacy `{app:"reader-picker",schemaVersion:1,settings,lastItem}`. Legacy defaults/aliases normalize through a whitelist; tokens and disposable caches are excluded. Preview is read-only, shows counts and explains replacement, preserves unrelated apps, and requires a recovery download before confirmation. Stale/tampered previews reject. Cancel remains visible after invalid JSON selection and through language changes, clears only the import form and preserves unsaved token/preferences. Import restores Reader records atomically and then removes credentials; if credential cleanup fails after the root commit, the UI reports that distinction. Imported picks remain available while the user reenters a token.

## Gotchas

- Only persistent metadata/preferences/selection belong in Reader backup. Root recovery excludes credential/cache keys as well. An unsaved token draft is never exported.
- Public [Reader docs](https://readwise.io/reader_api) and [Readwise docs](https://readwise.io/api_deets), rechecked 2026-10-16, establish list/latest-review/completion requests but do not establish structured Q&A or per-card scheduling support. Browser fixtures prove request handling, not live access or CORS.
- Counts 2–20 are an intentional addition. The original invalid-count fixture now uses 21; original fallback assertions remain alongside new custom-count contracts.
- Worker caching covers owned code/CSS, not authenticated API responses. Original private manifest/worker/icons are replaced by the shared installation assets.
- Current local backup and cross-module verification is recorded in [progress](../../../docs/progress.md). Legacy exporter release and actual iPhone/live API acceptance remain deferred.

## Shortcuts and evidence

Use `/daily/#/reading/picker?count=1&minutes=10&run=1&open=auto` to open one fitting result. Use `count=3&minutes=15&run=1` for three choices, `progress=started` for started-only, and `locations=inbox,later` for ordered Inbox/Later selection. In iOS Shortcuts use **URL**, then **Open URLs**. Existing search parameters before the hash are also parsed; hash parameters take precedence.

Supported parameters: `count` 1–20, `minutes` 0–10000 (0 = any), `progress` unfinished/started/unread, ordered `locations` inbox/new/later/shortlist, `scan` 100–2000 per location, boolean `run` (alias `auto`), `open` and `refresh`. Launch overrides do not replace saved defaults. An auto-run opened before token entry resumes after Save. Update-URL settings generate a reusable token-free URL; only an explicit single-result picker launch can auto-open Reader. Home widgets never redirect.

Source characterization and native assertion adaptations are mapped in the [migration inventory](../../../reports/migration-test-inventory.md); [progress](../../../docs/progress.md) records verification. Historical reports remain evidence of their pinned checkpoints, including failed import-cancel fixtures and the later correction.

## Prepared old-app exporter

A separate read-only page and patch are prepared in [legacy/exporters/reader](../../../legacy/exporters/reader/README.md). It reads v2 preferences, or v1 only when v2 is absent, and whitelists known settings. Legacy token properties and remember-token options are excluded. The remembered-item key is read only when enabled; minimized safe metadata excludes bodies and unknown fields. Separate token/cache keys are never read. Malformed data fails unchanged rather than resetting or falling back to older settings. Import uses the existing protected `reader-picker` format and requires token reentry in Daily. The pinned source checkout and installed apps remain untouched; release and physical migration are deferred.

## Final locale and recovery boundaries

Authored request/import/review errors have exact EN/ES presentation. Status codes and throttling retain their structured messages; the changed-latest-review error explicitly requests refresh rather than claiming a form conflict. Unknown external error detail and fetched article titles remain verbatim. Item-save failures use the same translator in Reader and Home, prevent navigation and retain the previous root. The destructive Reader-only confirmation follows the shared language.

Persisted pick timestamps reject finite values outside the JavaScript Date range. Disposable metadata/review caches with invalid, negative or future timestamps are ignored; saved picks remain unchanged. A clock moving backward therefore cannot keep a cached pool fresh indefinitely. Recovery downloads report storage failures visibly and set the recovery gate only after a successful download. Superseded/disposed file-read failures cannot replace a current preview message.

These local checks use mocked Readwise responses. Real endpoint requests and fallback links remain unchanged; private-token and installed-iPhone acceptance remain deferred.

## App settings

`#/reading/settings` owns the Reader preferences form previously mounted in Daily settings. The hub and Reader menu link here; changing the route does not save preferences. Language remounts preserve unsaved fields, and the picker and this page edit the same validated module settings. Token connection and per-pick overrides remain available in the picker. Daily settings mounts no Reader form.

Visual review retains the picker palette and serif review layout while matching shell gutters, enlarging reorder/checkbox targets, separating backup actions and bounding token dialogs. Secondary review actions share button sizing; feedback links pair on phones and form four columns on desktop. Empty status gaps and redundant viewport minimums are removed. Review errors use the existing error color. The fixed action bar and server-confirmed completion contract remain.
