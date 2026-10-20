# Plants verification

## Current behavior

Plant import replacement downloads a recovery copy automatically; validation, cancellation, stale-preview and storage protections remain. Dashboard and Plants reminders group by watering, soil change and fertilizer, with urgency retained inside each group. Rows show the saved plant name and the shared status chip. Care history is a borderless table with inline edit/delete and contained scrolling on narrow screens.

Things actions live only on individual plant detail cards, separately for watering, soil and fertilizer with a future date in the existing plan. Each click opens one direct Things URL with that exact date. Buttons remain enabled after opening, without sent tracking. No Things actions remain on reminder lists, and there is no shortcut setup or automatic handoff. Legacy settings/exports and original shortcut-helper assertions remain compatible. Actual Things task creation requires later device acceptance; opening the same task again can create a duplicate.

## Evidence

| Check | Result | Retained evidence |
| --- | --- | --- |
| Plants | 31 unit / 18 browser pass | [Module](plants-planned-things-green.txt) |
| General | 85 unit / 40 browser pass, including 360 route/width checks | [General](plants-planned-things-general.txt), [width audit](full-width-route-audit.json) |
| Static gate | Full strict lint, 831-file syntax and 709-asset build pass | [Static checks](plants-planned-things-static.txt) |
| Import acceptance before fix | Disabled replacement reproduced | [Import red](plants-replace-button-red.txt) |
| Grouping/history acceptance before fix | Missing groups and table reproduced | [Presentation red](plants-presentation-red.txt) |
| Chip refinement before fix | Redundant care type reproduced | [Chip red](plants-reminder-chips-red.txt) |
| Shortcut removal before fix | Existing setup control reproduced | [Shortcut red](plants-remove-things-red.txt) |
| Direct URL implementation before fix | Missing helper and action reproduced | [Unit red](plants-direct-things-red.txt), [browser red](plants-direct-things-browser-red.txt) |
| Final interview before fix | Reminder-list placement violates plant-detail requirement; today/overdue/paused exclusion already passed | [Planned-date red](plants-planned-things-red.txt) |

The original seven Stillgreen unit cases remain unchanged. Three direct-URL unit contracts and four browser cases extend the initial 28-unit / 14-browser module scope to 31 / 18. Native replacement and integration prerequisites were deliberately adapted after replacement acceptance was recorded. See [source mapping](plants-source-map.json) and [test inventory](migration-test-inventory.md).

## Superseded checkpoints

The import-only scope passed 28 unit / 14 browser. Group/history and shortcut-removal checkpoints passed 28 / 16. Earlier bulk and individual-reminder-list actions passed 31 / 17 before the interview replaced that placement with future planned care on plant details. Those passing TXT transcripts are consolidated here; their results do not describe current UI placement. Behavioral-red captures remain.

The first General presentation run passed 85 unit / 39 of 40 browser cases and reported 70px overflow on a Piano exercise at 1600px; [the failure remains](plants-presentation-general.txt). Later General runs passed unchanged Piano code, including the final gate above. No all-app release verification, push, deployment, authenticated API or physical-device handoff is claimed.
