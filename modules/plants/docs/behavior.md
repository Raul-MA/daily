# Plant behavior and storage

## Problem

Retain Stillgreen's care rules, IDs, history and Things handoff inside one PWA without writing into another installation's keys or losing unfinished forms.

## How It Works

- Visual review retains the app palette and typography. Native page gutters match the shared shell (20px phone, 36px desktop); root/app-shell padding must not be counted twice. Scoped styles own touch targets, wrapping narrow rows and bounded themed dialogs. Screenshot/checklist evidence lives in `reports/visual-review/plants/tasks.md`; automated suites remain stopped for this review.

- Routes: `#/plants`, `#/plants/new`, `#/plants/:id`, `#/plants/:id/edit`, `#/plants/settings`. Shared URL helpers encode IDs and apply the configured base.
- `connectPlants(state)` binds retained store and Things functions to the version-1 `plants` module payload. It contains `plants`, `things`, backup metadata and the persistent-storage request result. It creates no records on navigation and does not inspect/import old installation storage.
- The compatibility API retains original legacy-array/envelope reads, staged writes, checksums, recovery keys and event names. It is the default outside the bound shell for the copied source tests. Product UI is always bound to the shared document; failed writes retain previous records and emit no shared success.
- Care logs retain original types: watering, soil, fertilizer, note, skip and reschedule. Logging normal care clears the corresponding manual override. Skipping records its care type and sets local today plus the selected days. Manual dates override seasonal pauses. History edits preserve entry IDs. Care history is a borderless table of date, care type, note and edit/delete actions, newest first; inline editing spans the row and narrow screens scroll the table horizontally without widening the page.
- Watering/fertilizer seasons include wrap-around month ranges. Fertilizer intervals may be null during a pause. Legacy date-only strings remain local calendar dates; event times remain UTC ISO strings. Backdated input uses local noon. Existing JavaScript month-overflow behavior is retained and characterized.
- Dashboard tasks use the same care functions, include overdue/today tasks, group by watering, soil change and fertilizer, sort by due day within each group and link to the stable plant ID. Empty groups are omitted in both the Plants list and the Daily dashboard widget. Reminder rows show only the plant name and status chip; group headings carry the care type. Chips share the plant cards’ pill styles on both screens. Opening a reminder never logs care. Calendar refresh recalculates local midnight and refreshes after foreground/timezone changes without saving records.
- Plant forms preserve names, species, location, notes, difficulty, template identity, seasonal schedules and manual dates. The soil input accepts the original domain validator's 1–120 months so valid imported schedules are not truncated to the old form's narrower 60-month UI limit.
- Shared in-memory draft snapshots preserve input values, checked state, file selection and focus when language changes. Conditional care/history forms reopen with their drafts. Unrelated commits do not rebuild a mounted plant page. A dirty page receiving another-tab changes retains its draft; stale plant/history edits fail visibly instead of overwriting the newer record.
- Template refresh replaces only template-owned species/schedules while preserving user names, location, notes, history and manual overrides. Legacy Xanadu species matching remains supported.
- Only the individual plant detail page offers Add to Things 3, separately for watering, soil and fertilizer with a future planned date. Each click opens `things:///add` with `title`, `notes`, `when`, `list` and `reveal=true`. Titles use the localized care type and saved plant name; `when` is exactly the displayed planned date. Notes include species, location, the planned date, original plant notes and a reminder to check the plant and record completed care in Daily. Plant settings retains the exact saved/imported project name; an empty saved project defaults to `Plantas`. The legacy enabled flag does not gate explicit clicks. There is no Apple Shortcut dependency or automatic handoff after recording care. Today, overdue, paused and missing-date care have no future action; dashboard and reminder lists remain navigation-only. Buttons stay enabled after use and never mark care complete. Existing settings and backup formats remain compatible; the unused bulk Things JSON builder remains characterized.
- In Plant settings, Create project opens `things:///add-project?title=…&reveal=true` for the currently entered name. Create the project once in Things and save that exact name in Daily. Blank/whitespace-only input is rejected; project drafts survive language changes. The direct integration creates one task per click without duplicate detection, recurrence or completion sync. Device task creation remains unverified.
- Styles retain source palette, controls, care rows and scoped selectors. System/serif fallbacks allow offline rendering without downloading fonts. The root dashboard keeps its separate iOS appearance.
- Native Plants pages use normal vertical document flow: heading, care reminders and plant list stack in one column at every width. Plant cards form successive rows across the available container width; list, form, detail and settings pages share this full-width contract. The standalone source's desktop flex-row frame must not arrange the native heading/body beside each other. Shared navigation belongs to Daily's sidebar.

## Backups

- **Export plants** keeps the original plant-array format.
- **Export plants and settings** writes `{app: "stillgreen", version: 1, plants, things}` as `stillgreen-migration.json`.
- Import supports the original array, a validated original storage envelope and the new migration export. Previewing performs no writes. Replace plants is enabled immediately and starts a recovery download before applying the replacement; the separate recovery link remains available, and using it avoids a duplicate download. Replacement revalidates the module and rejects a stale preview; save errors stay visible inside the dialog. The shared store retains a complete previous root recovery document before committing.
- Selecting a file opens its preview immediately. The Preview import button can reopen a canceled preview without selecting the file again. Invalid-file errors appear beside the file control and scroll into view; superseded reads and detached forms cannot open a late preview. Selection and preview never replace records automatically.
- Array/envelope imports retain current Things settings; the migration format restores them explicitly. Unsupported/invalid formats and duplicate IDs never mutate data. Import counts as a backup-relevant mutation.
- Browser storage persistence is requested once where available; the result is recorded without promising permanent retention. Old app source and user exports remain untouched.

## Gotchas

- The seven original test cases remain discovered; the shortcut URL case now checks equivalent direct Things title/date/project fields after the user approved removing the shortcut. Twenty-four new unit cases cover care, shared-state integration, legacy export, localization and direct Things URLs. Browser coverage includes offline reload, quota failure, migration preview/cancel, draft preservation, stale edits, theme containment and language.
- The root is still localStorage: there is no transactional cross-tab compare-and-swap. UI stale-record guards reduce lost-edit risks; truly simultaneous writers still need the shared concurrency policy before release.
- Controls, validation states, template labels/defaults and all sixteen authored guides support EN/ES. The original thirteen Spanish data objects remain unchanged; three new templates have [researched care and documented default assumptions](care-research.md). `plants/localized.js` overlays detached English text or Spanish labels. Unit contracts preserve every numeric care figure and schedule. Physical iPhone acceptance remains open; the Apple Shortcut handoff was removed at the user’s request.
- See `reports/plants-source-map.json` for source hashes and targets. New migration export behavior is not evidence that the old installed PWA already exports Things settings; its prepared migration exporter has not been released to that installation.


## Prepared original-app exporter

The existing old-app export contains plant records but omits Things preferences. A separate read-only exporter and checked patch are prepared in [legacy/exporters/plants](../../../legacy/exporters/plants/README.md). It accepts bare arrays and checksummed envelopes, retains full plant/history/schedule data, and includes enabled/project preferences. Recovery reads follow the original primary/pending/backup order, with an explicit preview label and no repair writes. Unreadable data never becomes an empty export; unknown versions stop instead of downgrading to an older backup. Original-app release and physical migration remain deferred.


## Authored text versus user records

Guide content follows the shared interface language and works offline. Selecting a new template explicitly fills its description/type in the current language. Those fields then become the user's form values: later language changes restore them verbatim, just like saved names, types, notes, history and dates. Previously saved Spanish template notes remain saved text; changing language never rewrites them. Template refresh continues to use source schedules without touching user notes.
