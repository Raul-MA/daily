# Consolidated branch findings

Review completed 2026-10-19. Comparison: `main` (`1e1caae45edd6fe318dff5a997de8b108d0bb2d4`) → `review/08-cloud-sharing-proposal` (`859fd7b0f1365f90cbef22b0975f612580580e2c`). **12 confirmed findings: nine P2 and three P3**, deduplicated across specialists. Two independently reproduce the supplied earlier review; ten are additional. [Index and coverage](README.md) and [verification](verification.md) record the complete scope and evidence. Application code remains unchanged. P2 fixes are recommended before merging; P3 items are lower-priority interaction defects.

| ID | Priority | Area | Finding | Source |
| --- | --- | --- | --- | --- |
| TB-1 | P2 | Time Budget correctness/UI | Templates import prepares its preview in hidden Settings | [sections.js:17](/workspaces/daily/modules/time-budget/src/sections.js:17) |
| TB-2 | P2 | Time Budget accessibility | Returning to a running plan leaves focus inside the inert menu | [sidebar-controls.js:51](/workspaces/daily/apps/daily/src/shell/sidebar-controls.js:51) |
| PI-1 | P2 | Piano data safety | Player drafts bypass shared preservation and update tracking | [controls.js:4](/workspaces/daily/modules/piano/src/player/controls.js:4) |
| PI-2 | P2 | Piano audio correctness | Short loops skip repetitions instead of filling the lookahead window | [transport.js:27](/workspaces/daily/modules/piano/src/player/transport.js:27) |
| PI-3 | P2 | Piano asynchronous lifecycle | A pending import commits after leaving the player | [page-actions.js:97](/workspaces/daily/modules/piano/src/player/page-actions.js:97) |
| PI-4 | P2 | Piano performance/availability | Accepted subdivision data causes unbounded quadratic scheduling work | [timing.js:48](/workspaces/daily/modules/piano/src/player/timing.js:48) |
| PI-5 | P2 | Piano localization | Spanish import errors retain English validation explanations | [page.js:9](/workspaces/daily/modules/piano/src/player/page.js:9) |
| PI-6 | P3 | Piano keyboard/UI | Choosing a correction note closes its editor and drops focus | [page-actions.js:91](/workspaces/daily/modules/piano/src/player/page-actions.js:91) |
| PI-7 | P3 | Piano UI | Successful import leaves the focused heading off-screen | [page-actions.js:85](/workspaces/daily/modules/piano/src/player/page-actions.js:85) |
| SH-1 | P2 | Shared accessibility | Desktop sidebar covers the focused skip link | [sidebar.css:3](/workspaces/daily/apps/daily/src/shell/sidebar.css:3) |
| SH-2 | P2 | Shared recovery/lifecycle | Entering recovery with the phone drawer open leaves scrolling locked | [sidebar.css:34](/workspaces/daily/apps/daily/src/shell/sidebar.css:34) |
| SH-3 | P3 | Shared navigation | Current sidebar links cancel modified-click defaults | [sidebar-controls.js:63](/workspaces/daily/apps/daily/src/shell/sidebar-controls.js:63) |

## Time Budget

**TB-1.** Open Time Budget → Templates → Import templates and choose a valid legacy file. The existing importer unhides its preview, but the new section wrapper keeps its Settings ancestor hidden. Recovery and confirmation cannot be seen without independently discovering Settings. Parent Chromium probe observed preview.hidden=false, parent.hidden=true and no preview client rectangles. Select the preview's panel or display it beside the initiating control.

**TB-2.** Start a plan on mobile, visit Countdowns, then return through the Time Budget menu button. The shared navigation chooses the first heading, hidden `#setupTitle`, instead of a heading in the active timer. The drawer closes and becomes inert, while focus remains on its Time Budget button. Select a visible focus destination after changing panels. [Browser evidence for both](04-time-budget-reproduction.md).

## Piano

**PI-1.** Paste JSON or edit a correction/name, then change language before saving. The controls lack identified forms and dirty-state integration. Parent Chromium probe erased 1885 pasted characters; no form or dirty marker existed beforehand. They also do not block service-worker update activation through the shared draft gate. Register drafts with the existing form mechanism. This confirms the supplied earlier draft finding.

**PI-2.** A valid 10-tick loop at 120 BPM schedules only through 10.4167ms initially. The next 25ms pump jumps to repetition 5, leaving intervening audio unscheduled. Independent real-transport controlled-clock probes reproduce this. Append repetitions until the lookahead horizon is covered. This confirms the supplied earlier audio finding.

**PI-3.** Select a slowly read file and navigate away before it resolves. The file and drop paths await text without disposal/request checks, then persist and rerender. Parent Chromium probe left the route on Home while persisted selection changed to the late exercise. Older reads can also supersede a newer selection. Check request identity and disposal before mutation on both paths.

**PI-4.** A 473-byte validated exercise generates 1,966,080 subdivision positions. Each growing-grid `.some()` scan makes expansion quadratic; even beat-only mode and narrow loops construct the full subdivision grid before filtering. Real grid execution did not finish within a bounded 1500ms worker run. Its synchronous browser call blocks interaction. Bound work, generate only the required range/mode and avoid quadratic deduplication. No full freeze duration is claimed.

**PI-5.** Choose Español and import `{}`. The Spanish interface reports six `$.field: required` messages. `copy()` receives the whole composed error, for which dictionaries and phrase patterns have no translation. Canonical field paths can remain unchanged; localize the authored explanations and dynamic player errors.

**PI-6.** Open Correct a note and choose another note. The change handler rerenders the entire page, closes the disclosure and discards select focus. Parent Chromium probe selected `n2`, observed details.open=false and activeElement=BODY. Preserve disclosure/focus or update only the editor controls.

**PI-7.** Import another exercise from the bottom of the populated player page. Success resets the unscrollable inner container rather than the document and focuses the heading with preventScroll. Parent Chromium probe retained scrollY=2621 with the focused heading at −2405.86px. Scroll the document or reveal the heading after success.

[Piano reproduction details and bounded performance fixture](05-piano-reproduction.md); specialist reports supply additional coverage and test-gap evidence.


## Shared platform

**SH-1.** At desktop width, focus Skip to content. The new fixed sidebar is at z-index 50 and occupies the link's focused top-left position; the retained skip link is at z-index 5. Parent Chromium hit testing returned `SPAN.sidebar-brand` at the focused link's center. The label and focus outline are hidden behind the sidebar. Raise or reposition the skip link so keyboard focus stays visible.

**SH-2.** On a phone, open Apps and then enter storage recovery following a corruption event from another tab. Recovery replaces the root children, but retained `data-menu-open=true` still applies body overflow:hidden. The sidebar and its close control are gone. Parent Chromium observed an 812px document in a 500px viewport, with scrollY still 0 after a 1000px wheel attempt. Clear drawer state when entering recovery or require an actual open drawer for the lock.

**SH-3.** Ctrl-click the current sidebar anchor. Its same-hash handler prevents the default without checking modifiers; a real browser click had defaultPrevented=true compared with false on an ordinary identical-URL anchor. This overrides native modified-link activation. Restrict the same-route focus/scroll behavior to ordinary clicks. No popup-count result is claimed.

[Shared Chromium reproduction details](08-shared-reproduction.md). The existing TB-2 shared focus bug is counted once under Time Budget, not repeated here.
