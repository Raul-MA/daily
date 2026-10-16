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
- Native uses one shared manifest/worker. Original private icon/PNG/worker assertions remain in the source baseline. Replacement native assertions validate the generated shared install identity/vector dimensions/assets and worker-owned cleanup, offline responses and external bypass. Proper shared PNG install assets remain a final release gate.
- Stale browser coverage suppresses the storage event before bootstrap to model a missed event; otherwise clean autosaved forms correctly refresh to the newer tab state. Backend revision checks still prevent a late stale save. Dirty failed-save drafts retain their original revision through language changes.
- Autosaved drafts survive reload. The shell input listener currently can re-mark a successful autosave dirty and hold activation conservatively; ordering/update acceptance needs the Stage 8 audit. Failed-save/import forms must remain dirty and block activation. Clear/discard after invalid previews also needs that audit.
- Shared storage recovery preserves corrupt/previous records; it does not promise permanent iOS retention. Keep user exports and original installations until actual migration is accepted.

## Tests

`baseline-whatsapp-complete.txt` passes the three unchanged-source test cases and one source phone characterization. Tests preserve exact encoding, long/invalid Unicode/date/clock cases, four timezones and DST gaps, clear-before-navigation, copy fallback and invalid draft retention. Native VM/controller adapters use the actual functions/controller/service with safe memory storage ports. The original manifest/worker block stays selectable; native checks assert the shared replacement.

Nine native unit cases include six new service/restore contracts. Seven browser cases cover source phone appearance (320/390px, light/dark), autosave/Home/reload/EN-ES, Things/copy/manual fallback, expired drafts, stale/quota failures, protected recovery import and 320px shared-worker offline reopening. Reports and final shared regressions are tracked in root progress. Original assertions were not skipped; early missing-module reports are retained.
