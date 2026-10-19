# WhatsApp migration exporter

These are prepared local artifacts; original source and installations are unchanged. See the [shared migration procedure](../../../docs/legacy-exporters.md) for the later release, installed-context and coexistence requirements.

`npm run prepare:legacy-whatsapp` checks the pinned original HTML and writes `legacy/patches/schedule-whatsapp-export.patch`. It adds the old app's export link and standalone EN/ES page under `daily-migration/`. Source commit, checksum and exact key are in `provenance.json`. Preparation verifies the copied native version-1 draft validator. Packaging tests apply only in a disposable copy and reject changed HTML without replacing an existing patch.

Only `whatsapp-later-draft` is read. The exporter whitelists recipient, date, time and message, preserving Unicode/newlines and original expired or incomplete values. Missing or explicitly null data exports a null draft without initializing a key. Extra properties, unrelated credentials and prior handoff links are excluded. Invalid JSON/calendar/clock/field types or blocked storage stop download without changing original data.

Preview renders recipient, original date/time and message as plain text. Download reads and validates a fresh snapshot. It never creates a Things link, launches another app, clears a draft or sends a message. Import through Daily → WhatsApp, using its preview/recovery/confirmation workflow. Expired reminders remain expired; check the imported date before creating a reminder. Opening either app cannot confirm Things task creation or delivery.
