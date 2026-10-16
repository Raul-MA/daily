# Plant behavior and storage

## Problem

Retain Stillgreen's care rules, IDs, history and Things handoff inside one PWA without writing into another installation's keys or losing unfinished forms.

## How It Works

- Routes: `#/plants`, `#/plants/new`, `#/plants/:id`, `#/plants/:id/edit`, `#/plants/settings`. Shared URL helpers encode IDs and apply the configured base.
- `connectPlants(state)` binds retained store and Things functions to the version-1 `plants` module payload. It contains `plants`, `things`, backup metadata and the persistent-storage request result. It creates no records on navigation and does not inspect/import old installation storage.
- The compatibility API retains original legacy-array/envelope reads, staged writes, checksums, recovery keys and event names. It is the default outside the bound shell for the copied source tests. Product UI is always bound to the shared document; failed writes retain previous records and emit no shared success.
- Care logs retain original types: watering, soil, fertilizer, note, skip and reschedule. Logging normal care clears the corresponding manual override. Skipping records its care type and sets local today plus the selected days. Manual dates override seasonal pauses. History edits preserve entry IDs.
- Watering/fertilizer seasons include wrap-around month ranges. Fertilizer intervals may be null during a pause. Legacy date-only strings remain local calendar dates; event times remain UTC ISO strings. Backdated input uses local noon. Existing JavaScript month-overflow behavior is retained and characterized.
- Dashboard tasks use the same care functions, include overdue/today tasks, sort by due day and link to the stable plant ID. Opening a reminder never logs care. Calendar refresh recalculates local midnight and refreshes after foreground/timezone changes without saving records.
- Plant forms preserve names, species, location, notes, difficulty, template identity, seasonal schedules and manual dates. The soil input accepts the original domain validator's 1–120 months so valid imported schedules are not truncated to the old form's narrower 60-month UI limit.
- Shared in-memory draft snapshots preserve input values, checked state, file selection and focus when language changes. Conditional care/history forms reopen with their drafts. Unrelated commits do not rebuild a mounted plant page. A dirty page receiving another-tab changes retains its draft; stale plant/history edits fail visibly instead of overwriting the newer record.
- Template refresh replaces only template-owned species/schedules while preserving user names, location, notes, history and manual overrides. Legacy Xanadu species matching remains supported.
- Things uses `Stillgreen to Things`, with the exact version/title/date/project shortcut payload. Settings require a nonempty project when enabled. Watering retains the automatic handoff; the detail page offers the direct link when configured. Opening a link does not confirm task creation.
- Styles retain source palette, controls, care rows and scoped selectors. System/serif fallbacks allow offline rendering without downloading fonts. The root dashboard keeps its separate iOS appearance.

## Backups

- **Export plants** keeps the original plant-array format.
- **Export plants and settings** writes `{app: "stillgreen", version: 1, plants, things}` as `stillgreen-migration.json`.
- Import supports the original array, a validated original storage envelope and the new migration export. Previewing performs no writes. Replacement requires an offered recovery download, revalidates the module and rejects a stale preview. The shared store retains a complete previous root recovery document before committing.
- Array/envelope imports retain current Things settings; the migration format restores them explicitly. Unsupported/invalid formats and duplicate IDs never mutate data. Import counts as a backup-relevant mutation.
- Browser storage persistence is requested once where available; the result is recorded without promising permanent retention. Old app source and user exports remain untouched.

## Gotchas

- The original seven test cases remain unchanged; twenty-one new unit cases cover care, shared-state integration, legacy export and localization. Browser coverage includes offline reload, quota failure, migration preview/cancel, draft preservation, stale edits, theme containment and language.
- The root is still localStorage: there is no transactional cross-tab compare-and-swap. UI stale-record guards reduce lost-edit risks; truly simultaneous writers still need the shared concurrency policy before release.
- Controls, validation states, template labels/defaults and all thirteen authored guides support EN/ES. The original Spanish data objects remain unchanged; `plants/localized.js` overlays detached English text or Spanish labels. Unit contracts preserve every numeric care figure and schedule. Physical iPhone/Things acceptance remains open.
- See `reports/plants-source-map.json` for source hashes and targets. New migration export behavior is not evidence that the old installed PWA already exports Things settings; its prepared migration exporter has not been released to that installation.


## Prepared original-app exporter

The existing old-app export contains plant records but omits Things preferences. A separate read-only exporter and checked patch are prepared in [legacy/exporters/plants](../../../legacy/exporters/plants/README.md). It accepts bare arrays and checksummed envelopes, retains full plant/history/schedule data, and includes enabled/project preferences. Recovery reads follow the original primary/pending/backup order, with an explicit preview label and no repair writes. Unreadable data never becomes an empty export; unknown versions stop instead of downgrading to an older backup. Original-app release and physical migration remain deferred.


## Authored text versus user records

Guide content follows the shared interface language and works offline. Selecting a new template explicitly fills its description/type in the current language. Those fields then become the user's form values: later language changes restore them verbatim, just like saved names, types, notes, history and dates. Previously saved Spanish template notes remain saved text; changing language never rewrites them. Template refresh continues to use source schedules without touching user notes.
