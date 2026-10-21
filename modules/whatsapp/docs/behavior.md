# WhatsApp drafts and Things handoff

## Problem

Preserve WhatsApp Later's local-time composer, exact nested URL encoding and fallback behavior while moving drafts and recovery into Daily. The untouched source is `/workspaces/schedule-whatsapp`, commit `941d4cdb71dc38c4512bea836d4292dd8c96e541`. Source hashes/destinations are in `reports/whatsapp-source-map.json`. Deployment instructions in its README are historical; work remains local.

## How It Works

`app.js` contains pure Things/WhatsApp URL and local date/text validation functions. A recipient labels `WhatsApp {recipient}` in Things; it is not a phone number or selected chat. Notes contain the recipient-free `https://wa.me/?text=…` URL, encoded again as a Things query parameter. `when` remains `YYYY-MM-DD@HH:mm`, without UTC conversion. Preserve Unicode, punctuation and line breaks exactly.

A reminder must be in the future and survive local date/time round-trip validation. Invalid calendar times and daylight-saving gaps reject; ambiguous fall-back times follow the device's local interpretation. The title limit is 4,000 characters including the prefix. Notes allow 10,000 characters including the encoded WhatsApp URL. Unsupported surrogate text rejects without deleting the draft. Defaults are about one hour ahead, rounded up to the next minute.

`service.js` owns version 1 of `daily:v1.modules.whatsapp`, `{draft:null | {recipient,date,time,message}}`. Startup/read/navigation never initializes records. Input saves retain incomplete drafts and expired times; expired times remain visible and must be corrected before handoff. Imported dates/times must have valid calendar/clock structure, but need not be future. Root commits preserve other apps and preferences. A private revision symbol rejects stale edits; quota failures keep previous primary records and visibly retain the current controls.

`controller.js` binds the source composer. Create validates, builds the URL and clears the canonical draft successfully before resetting controls and attempting the Things handoff. A failed clear prevents handoff and retains the draft. The previous source allowed storage failures silently; the shared-data contract deliberately reports failed writes instead. Opening Things does not establish task creation or automatic WhatsApp sending. The user chooses a chat and presses Send.

The submitted Things URL remains in page-session memory for Copy link after clearing the composer. Editing clears that fallback; reload starts a new page session. Clipboard denial exposes a focused, selected read-only link. Language remounts retain the handoff/manual-copy fallback and saved user text. The native view scopes original CSS, translates controls/errors EN/ES, rechecks local time on foreground/pageshow and uses a disposed 15-second validation timer. It does not create notifications or schedule background work.

`imports.js` supports `{app:"daily-whatsapp",schemaVersion:1,data:{draft}}` and migration `{app:"whatsapp-later",schemaVersion:1,draft}`. Preview is read-only, shows draft count/replacement behavior and requires a recovery download before confirmation. Cancel leaves data intact; stale/tampered/future/invalid previews reject. Replace is one root commit and leaves unrelated apps/language intact. Full-root recovery and per-module backup are separate downloads. Delivery of the original-app migration exporter remains a Stage 8 gate.

## Gotchas

- This is a Things reminder composer, not automatic WhatsApp sending. Real iPhone Things/WhatsApp handoffs remain deferred; browser fixtures verify URL generation/state changes only.
- Native uses one shared manifest/worker. Original private icon/PNG/worker assertions remain in the source baseline. Replacement native assertions validate the generated shared install identity/vector dimensions/assets and worker-owned cleanup, offline responses and external bypass. The shared build generates PNG install assets; actual installed-device acceptance remains deferred.
- Stale browser coverage suppresses the storage event before bootstrap to model a missed event; otherwise clean autosaved forms correctly refresh to the newer tab state. Backend revision checks still prevent a late stale save. Dirty failed-save drafts retain their original revision through language changes.
- Autosaved drafts survive reload and release the update hold after event propagation. A generation-checked zero-delay task clears only the successful input's dirty flag; disposal cancels it. A microtask is too early in native browser event dispatch. Failed-save/import forms remain dirty and block activation; save errors survive language changes. Invalid import files have a visible Cancel action which clears only the import form, preserving saved records.
- Shared storage recovery preserves corrupt/previous records; it does not promise permanent iOS retention. Keep user exports and original installations until actual migration is accepted.

## Tests

`baseline-whatsapp-complete.txt` passes the three unchanged-source test cases and one source phone characterization. Tests preserve exact encoding, long/invalid Unicode/date/clock cases, four timezones and DST gaps, clear-before-navigation, copy fallback and invalid draft retention. Native VM/controller adapters use the actual functions/controller/service with safe memory storage ports. The original manifest/worker block stays selectable; native checks assert the shared replacement.

Native unit/controller and browser contracts cover shared state, phone appearance, language remounts, Things/copy/manual fallback, expired drafts, stale/quota failures, recovery import, offline reopening and dirty-form update protection. Current verification is in [progress](../../../docs/progress.md), with source assertion mapping in the [migration inventory](../../../reports/migration-test-inventory.md). Original assertions and early missing-module reports remain retained.

The browser handoff test intercepts and cancels only `things:` navigation through Chromium's Navigation API, capturing the URL and stored draft at that boundary. Attempting the actual external protocol in headless Chromium blocks subsequent input. The test asserts that the draft is already cleared at handoff, uses the real Copy link click and clipboard, waits for successful-copy status, and compares the clipboard with the captured URL before retaining every original nested URL assertion. Real iPhone handoff acceptance remains separate.


## Prepared original-app exporter

A separate read-only export page and checked patch are prepared in [legacy/exporters/whatsapp](../../../legacy/exporters/whatsapp/README.md). It reads only the saved draft, whitelists recipient/date/time/message and preserves expired/incomplete Unicode data through actual native import. Malformed records fail unchanged; unrelated keys and prior handoff fields are excluded. The exporter does not launch Things or clear/send a message. Original source and installations remain untouched; later release and physical migration are deferred.

## App settings

`#/whatsapp/settings` owns the WhatsApp settings destination, accessible from the hub and its app menu. It presents the existing protected draft backup/import controls without displaying the composer. The composer remains mounted but hidden so existing import validation and draft refresh use the same controller; navigation itself never saves or launches. The original composer backup controls remain available for compatibility. Daily settings contains only the full-app backup, not WhatsApp-specific controls.

Visual review aligns composer/settings gutters with the shared shell, separates backup/import controls and preserves the green system dark palette. Date/time remain paired at 390px and stack below 360px so native values fit. The nine-section screenshot inventory and synthetic fallback/import evidence are in [visual tasks](../../../reports/visual-review/whatsapp/tasks.md); visual capture does not replace the paused regression suites or real iPhone handoff acceptance.
