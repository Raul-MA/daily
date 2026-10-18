# Implementation progress

Updated: 2026-10-18. Repo: `/workspaces/daily`, branch `review/08-cloud-sharing-proposal`.

## Current status and resume

**Time Budget now has separate Time Budget, Countdowns and Settings menu panels; local verification is complete.** See the menu checkpoint below.

**All-route full-width layout and dashboard title links are implemented locally. The 360-check route/width audit and all app regression suites pass.** See the full-width checkpoint below.

Application implementation remains **local**, using **plain HTML/CSS/JavaScript**. On 2026-10-18 the user authorized pushing review branches and creating PRs. Workflows, Pages/hosting configuration, cloud setup and deployments remain deferred. Preserve real Readwise/Reader requests for the user's later private-token checks. Do not request personal tokens or exports.

**Next acceptance work is deferred:** follow [device validation](device-validation.md) when the user resumes actual iPhone, Things, authenticated API, worker-coexistence or release testing. Do not treat those checks as passed or start remote work automatically. The current storage policy is **one editing tab at a time**; revision checks reject ordinary stale saves but do not serialize simultaneous cross-tab writers.

Local preview: `npm run dev`, then `http://127.0.0.1:5173/daily/`. Preparation copies native assets; rebuild after source edits.

## Remote review publication (2026-10-18)

- The user requested pushing the completed work and opening PRs arranged for review. Existing commits are preserved; eight review branches separate platform/core apps, Time/Piano, Reader/WhatsApp, backup/localization/recovery, Piano player/themes, shared navigation/layout/import previews, Time Budget sections, and the future cloud proposal.
- Validation is recorded in the implementation checkpoints below; initial red/transient reports remain available. No runtime code changed for publication. Personal JSON backups and incidental WhatsApp screenshot churn stay outside the commits. No workflow, hosting configuration or deployment was added.
- Review the code PRs in this order; each PR targets the preceding branch:

1. [Native platform + Plants/Coffee/Games](https://github.com/Raul-MA/daily/pull/1)
2. [Time Budget + Piano](https://github.com/Raul-MA/daily/pull/2)
3. [Reader + WhatsApp](https://github.com/Raul-MA/daily/pull/3)
4. [Backups, localization + recovery](https://github.com/Raul-MA/daily/pull/4)
5. [Piano exercise player + themes](https://github.com/Raul-MA/daily/pull/5)
6. [Shared navigation, full-width pages + import previews](https://github.com/Raul-MA/daily/pull/6)
7. [Time Budget menu sections](https://github.com/Raul-MA/daily/pull/7)
8. [Cloud sharing and scheduled push proposal — documentation only](https://github.com/Raul-MA/daily/pull/8)

- All eight review branches and PRs are published. The first PR targets `main`; every later PR targets its predecessor. Exact next step: review and merge in order, retargeting dependents after each parent lands. No PR was merged automatically. Physical-device, authenticated API and deployment acceptance remain deferred.

## Time Budget menu sections (2026-10-18)

- Replaced Time Budget's scrolling menu targets with three mutually exclusive sections: Time Budget (plan/templates), Countdowns, and Settings (backups/import/recovery). Switching retains mounted drafts and independent running clocks without saved-data changes; language remount retains the selected section. A full page reload starts at the plan. Space ignores the hidden budget panel.
- Acceptance recorded before implementation in [menu red](../reports/time-menu-red.txt). Existing source assertions remain; General sidebar coverage now checks panel isolation and retained drafts, while module countdown/import/localization tests navigate to their controls. Discovery and source mapping remain current.
- Verification: [module](../reports/time-menu-module.txt) passes 23 unit / 23 browser cases; the final language/keyboard refinements pass both [focused cases](../reports/time-menu-final-cases.txt). [General](../reports/time-menu-general.txt) passes 85 unit and 36 browser cases, including the 360-check width audit and all sidebar cases; its final service-worker controller startup timed out, then the unchanged [update case](../reports/time-menu-updates.txt) passes against a stable build. The initial failure remains recorded. Full strict [lint](../reports/time-menu-lint.txt), [824-file syntax](../reports/time-menu-syntax.txt), [708-asset build](../reports/time-menu-build.txt) and whitespace checks pass.
- Exact next step: refresh the local preview and review the three menu panels. No local implementation remains pending for this request. Work remains local only; deferred physical/API/release acceptance and earlier unrelated checkpoints are unchanged.

## Supabase, app sharing and push proposal (2026-10-18)

- Follow-up: scheduled push is an explicit initial requirement for every app: one-time and recurring schedules, per-app management, personal/shared audiences with recipient opt-in, timezone/quiet-hour rules, cancellation/version checks and missed-occurrence handling. Added scheduling acceptance criteria and updated the push foundation stage. Documentation only; local links and whitespace checks pass; no runtime tests were needed. Next step remains proposal review, followed by Stage 0 only when implementation is requested.
- Added [the focused proposal](supabase-sharing-push-plan.md) for optional cloud persistence across all seven apps, independent app-space memberships (Coffee and Games can have different audiences), database-enforced roles, offline conflicts/recovery, and Web Push through scheduled Edge Functions. Root Compass links to it; the consolidation plan remains authoritative for current behavior.
- Evidence: inspected shared storage/activities/backup boundaries and all module Compass files; checked official Supabase RLS, Edge runtime/scheduling and Apple/WebKit push documentation, linked in the proposal. JavaScript-only Edge entry compatibility is an explicit future validation gate; no compatibility or delivery success is claimed.
- Planning only: no application code, personal data, dependencies, services, migrations, invitations or deployments changed. No application tests or test mappings changed. Documentation links and patch whitespace checked locally; runtime suites were not run for this documentation-only request. Existing unrelated working-tree changes remain untouched.
- Exact next step: review the proposal. If the user requests implementation, start its Stage 0 locally with acceptance contracts and the JavaScript Edge runtime spike, then proceed one stage/app at a time. Remote setup and physical-device push acceptance remain deferred. Existing implementation checkpoints below retain their own pending work.

## Supplied backup compatibility (2026-10-18)

- UI follow-up: Plants previously did nothing on file selection until the separate Preview import button was pressed. File selection now opens the read-only preview immediately, matching Coffee/Games; the button remains available to retry after cancel. Invalid-file errors appear beside the file control and scroll into view. Superseded file reads and detached forms are ignored. Recovery download and explicit replacement remain required.
- Acceptance was recorded before implementation in [selection red](../reports/plants-import-selection-red.txt). All **28 unit / 14 browser cases pass** in [Plants regression](../reports/plants-import-selection.txt), and the exact supplied `plantas.json` passes automatic selection, recovery download, confirmation and reload in [supplied-file evidence](../reports/plants-supplied-selection.txt). Full strict [lint](../reports/plants-import-selection-lint.txt), [syntax](../reports/plants-import-selection-syntax.txt) and the browser runner's static build pass. Discovery/source mapping and Plants docs are current. Next: reload the local preview, select `plantas.json`, review 7 plants, download recovery and explicitly confirm replacement. No live user storage was changed; physical-device acceptance remains deferred.

- All three supplied exports import unchanged into their respective Daily apps: Games (2 players, 9 games, 14 sessions), Coffee (5 beans, 10 entries), Plants (7 plants, 68 care records). [Compatibility evidence](../reports/personal-import-compatibility.md) records service and Chromium checks, including recovery downloads, confirmation and reload persistence. Coffee services pass both merge and replacement; the browser replacement flow passes. No app changes were needed, and personal backups remain outside tracked fixtures and shipped assets.
- This request is complete. Next migration step, when the user resumes it: open each app's Settings, select the respective JSON, review counts, download recovery and confirm; complete Coffee's initial tools setup first if shown. Games and Plants replace their respective module data; Coffee offers merge or replacement. Physical-device/API/release acceptance remains deferred; the separate full-width regression checkpoint below is unchanged.

## Full-width pages and dashboard title links (2026-10-18)

- All page layouts now use 100% of the available container beside the sidebar, preserving normal padding, app colors and component/dialog sizing. This supersedes the earlier 620px Plants list cap: list, forms, details and settings fill the container, and cards remain stacked in one column. Coffee, Games, Time Budget, Piano, Reader, WhatsApp, dashboard/settings and diagnostics page caps are also removed. Settings quick-action labels clear the floated section legend, avoiding horizontal overflow.
- The route acceptance test derives its matrix from the router, Piano destinations and lessons. [Route audit](../reports/full-width-route-audit.json) and [browser evidence](../reports/full-width-routes.txt) pass all 360 checks: 87 hash URLs plus two setup states and standalone diagnostics, each at 1600/900/390/320px. The initial pre-fix audit found 77 width mismatches. Desktop/phone captures are retained locally in `/tmp/daily-full-width-review`.
- App-linked dashboard card titles/icons now navigate to Plants, Time Budget, Daily Review, Reader and Piano. The existing navigation test checks these destinations and unchanged saved data. The earlier General run passed navigation but had a transient offline manifest 404; all three offline cases passed unchanged on rerun in [offline evidence](../reports/dashboard-title-links-offline.txt).
- Verification completed: [all suites](../reports/full-width-all.txt) pass 320 unique units / 200 native browser cases and both retained Piano scripts; full strict [lint](../reports/full-width-lint.txt) and [822-file syntax](../reports/full-width-syntax.txt) pass. Plants’ subsequent file-selection acceptance increases its browser suite to 14 and the native total to 201; its clean regression is linked above. Next: review the local preview. No deployment occurred.

## Shared sidebar, page scroll and footer (2026-10-18)

- One generic sidebar replaces the module-specific Plants, Coffee, Games and Piano navigation. Each app's sections appear first, with app switching in a separate bottom section; outside apps, Apps starts at the top. App colors/font follow the existing shared theme, including dark mode. Desktop has a collapsible 248px sidebar; below 900px a hamburger drawer contains focus and dismisses with Escape, close, backdrop or navigation. Both open and close controls stay on the left. Collapsing preserves the mounted app and drafts without domain writes.
- Piano's fixed frame and inner vertical scroller are removed: header, content and footer share the document scroll. The shell/body backgrounds match the app. The shared footer puts preview/save/PWA details on one compact row with responsive wrapping. PWA system ownership/listeners survive navigation through a retained host attached to the new footer slot.
- Plants no longer inherits the standalone desktop flex-row frame. Its title, reminders and cards stack vertically; plant cards use one column inside a centered 620px list. The replacement layout acceptance caught the original defect in [red evidence](../reports/plants-column-red.txt), then passed at 1280/900/320px. All 28 units / 13 browser cases pass in [Plants regression](../reports/plants-column-regression.txt); desktop/phone captures were reviewed.
- Acceptance was recorded before implementation: [scroll red](../reports/page-scroll-red.txt) and [sidebar red](../reports/sidebar-red.txt). Shared verification passed 85 units / 36 browser cases before the final left-control/top-Apps refinement in [General evidence](../reports/sidebar-general.txt). Existing module assertions remain; mobile tests open the new drawer before navigating. General discovery increases by three to 36; unique totals are 320 unit and 199 browser cases.
- Verification is complete: **320 unique unit tests and 199 native browser cases pass**, plus both retained Piano scripts (45 Library destinations, all ten lessons, phone widths 320/360/390, audio cleanup and offline reload). [All-scope evidence](../reports/sidebar-all.txt) retains the initial three failures: Coffee's duplicate New-route remount, fixed by preserving the existing form alias, and two ambiguous Time Budget Templates selectors, now scoped to the original summary. Clean full [Coffee](../reports/sidebar-coffee.txt) (20 / 34) and [Time Budget](../reports/sidebar-time-budget.txt) (23 / 23) reruns pass. The final [13 shared layout cases](../reports/sidebar-platform.txt) pass again after the Plants change, covering footer/recovery retention, app colors, left controls, top/bottom Apps placement, same-page mobile navigation/drafts and single document scrolling. All source assertions remain; no cases were skipped.
- Strict [lint](../reports/sidebar-lint.txt), [818-file syntax](../reports/sidebar-syntax.txt), [707-asset build](../reports/sidebar-build.txt), discovery and whitespace checks pass. Final sidebar/footer/Plants desktop and phone captures were reviewed; WhatsApp's date/time-only screenshot churn was discarded. [Verification summary](../reports/sidebar-verification.json) maps final reports and counts. Next: refresh the running local preview and review the changes; physical-device/API/release work remains deferred. No deployment or remote work occurred.

## Imported Piano exercise player (2026-10-17)

Implemented locally in `modules/piano/src/player/`; open Piano → Library → Your music → Exercise player. The collection starts empty. Reuses the original samples, exact-octave keyboard, scoped styling, Daily Piano service and generated shared worker. [Player deep dive](../modules/piano/docs/exercise-player.md) routes to the versioned schema, generated types, valid documentation example, format guide and paste-ready transcription prompt.

- Content and practice preferences persist separately inside optional `piano.data.playerLibrary`; old Piano data remains valid. Attachments use a separate IndexedDB store with stable references and separate downloads. JSON/Daily backups do not contain score blobs.
- The AudioContext transport handles written tempi, speed, independent tracks, accent strength, seeking, pause/resume, sustain, half-open loops, gaps, metronome/count-in and bounded acceleration. Player audio pauses on hide and cancels on navigation; existing guided-session continuation is unchanged.
- Acceptance: 20 new domain/integration cases bring Piano to 78 units; all pass in [unit evidence](../reports/piano-player-unit.txt). The 14 existing native cases pass in [Piano regression](../reports/piano-player-regression.txt); the five final player browser cases pass in [player browser evidence](../reports/piano-player-browser.txt), including the supplied timing JSON, missing scores, text escaping and keyboard focus/scroll retention. Both retained broad scripts pass, covering all 45 Library routes, phone widths 320/360/390 and offline reload. [General regression](../reports/piano-player-general.txt) passes 85 units and 33 browser cases. Original assertions remain intact; discovery/source mapping updated.
- Strict [lint](../reports/piano-player-lint.txt), [syntax](../reports/piano-player-syntax.txt) (812 JS files), [build](../reports/piano-player-build.txt) (701 assets), discovery and whitespace checks pass. The 320px player screenshot was reviewed; the empty-state file input overflow found by the retained matrix was fixed without weakening assertions. Documentation, example and test exercise stay outside shipped assets and the user collection. [Verification summary](../reports/piano-player-verification.json).
- The [adapted test JSON](../modules/piano/test/fixtures/timing-test.json) preserves all thirteen complete pasted events. Its missing wrapper assumes 960 TPQ, two 4/4 measures, quarter BPM 120 and length 7680; the dangling opening note is omitted. It passes exact timing at 50% and real-browser practice at 25%.
- Next acceptance is physical iPhone audio/background and the existing deferred device/API/release checklist. No local implementation or checks remain pending; no deployment or remote work occurred. Unaffected app-specific suites were not rerun for this Piano-only feature; shared integration was rerun.

## Preview feedback follow-up

- 2026-10-17: standalone apps now fill the viewport width instead of sitting inside the gray shell frame. Internal app content sizing and dashboard/settings padding remain intact. Enabled buttons/menu summaries dim on mouse hover; links underline. Touch hover is excluded.
- Shared header/footer colors and font follow the mounted app, including explicit and system dark-mode changes; Home restores the dashboard style. Theme observation excludes timer text updates.
- Added two General browser cases covering all apps plus Daily Review at 1600/900/390/320px, dashboard reset, hover feedback and theme changes. General browser count is now 33 (191 total); unit count remains 300. All app suites and both retained Piano scripts pass in [sequential regression](../reports/app-width-all.txt). The final shared theme is also covered by fresh [General](../reports/app-style-general.txt), [Plants](../reports/app-style-plants.txt) and [Coffee](../reports/app-style-coffee.txt) runs, each exiting 0. Strict lint and syntax checks pass (787 JavaScript files); static preparation includes 680 assets.
- The first new width check caught Plants' separate desktop limit; it is fixed without weakening assertions. WhatsApp's regenerated module captures were reviewed and their date/time-only churn discarded. Next: refresh the running local preview and review appearance; physical-device/API/release acceptance remains deferred as above.

## Original full verification

Complete evidence: [full verification](../reports/final-verification.txt) and [machine-readable summary](../reports/final-verification-summary.json). Tested runtime checkpoint: `83926e9`; subsequent changes are documentation/report updates only.

| Scope | Unit | Native browser |
| --- | ---: | ---: |
| General | 85 | 31 |
| Plants | 28 | 13 |
| Coffee | 20 | 34 |
| Games | 17 | 34 |
| Time Budget | 23 | 23 |
| Piano | 58 | 14 |
| Reader / Daily Review | 57 | 31 |
| WhatsApp | 12 | 9 |
| **Total** | **300** | **189** |

Strict lint passes without warnings or exemptions. Native JavaScript syntax checks pass for 786 files; this is not typechecking. Both retained broad Piano scripts pass: 44 library destinations, exact-octave reveals, all ten lessons in piano/away modes, phone layouts at 320/360/390px, touch/audio cleanup and generated-worker offline reload. Static preparation produces 679 owned files/assets at `/daily/`; standalone legacy exporters and personal files are excluded.

No original assertions were removed or skipped. Intentional behavior changes, red results and fixture-only corrections are documented in the [test inventory](../reports/migration-test-inventory.md). Regenerated WhatsApp screenshots were visually reviewed: only current date/time changed, so the reviewed reference captures were retained.

## Delivered locally

- One accessible shell, seven complete native apps, shared EN/ES, accepted three/two/one-column dashboard, stable links, configurable widgets and quick actions. Dashboard navigation does not create domain records.
- Original app workflows and scoped appearance: plant care/history/Things; Coffee entries/beans/history/insights/tools; Games scoring/history/statistics; Time Budget allocation/reallocation/templates/countdowns; the complete Piano course/exercise/reference/audio library; Reader selection/settings and Daily Review/fallback; WhatsApp drafts and Things handoff.
- Timestamp activities survive navigation/reload without tick writes or automatic completion. Explicit pause/finish remains explicit; hidden Piano views freeze prompt progression while elapsed practice continues. Delayed Budget permission responses cannot start disposed or navigated-away plans.
- Validated `daily:v1`, versioned domain adapters, corrupt/recovery preservation, visible storage failures, stale-form guards and draft retention through language changes. User names, notes, messages and canonical musical data remain unchanged.
- Full-PWA export/restore with domain/reference validation, count preview, recovery download, stale/tamper protection, one primary replacement, original timer timestamps, draft reset and honest credential-cleanup reporting. The attention screen can preserve unreadable root snapshots and restore a valid full backup without clearing unrelated storage. Future root versions remain preserved/exportable.
- Real Readwise/Reader endpoints remain in place. Tokens and disposable account caches are separate from backups and worker assets; account changes invalidate stale requests. Authored errors are localized. Daily Review completion needs server confirmation; unsupported scheduling/Q&A behavior uses the documented fallback.
- One manifest, PNG/Apple icons, owned offline assets and safe updates requiring every open Daily tab to report safe. Authenticated/external requests bypass the worker. Durable storage is requested where available, without a retention guarantee.
- Four prepared legacy migration exporters and five scoped worker-cleanup patches, with schema/source checks and disposable packaging tests. Original repos/installations/data remain untouched; releases are deferred. Coffee Excel and unrelated personal/source documentation are excluded.

## Deferred acceptance and user-confirmed facts

- Physical iPhone installation, lock/background/process restart, actual Things handoffs, authenticated Readwise/Reader CORS/response behavior and old-worker coexistence require later device evidence. Browser mocks do not establish these results. See [device checklist](device-validation.md), [constraints](constraints.md) and [legacy workers](legacy-workers.md).
- Existing original apps export and restore successfully. Most backups contain fewer than 50 entries and are approximately 20 KB. The original Time Budget survives lock/reopening; Reader works on the user's iPhone. Daily Review is new. Do not ask the user to repeat those original-app checks or supply personal files.
- Local synthetic storage coverage exceeds 140 KB. Actual installed-browser storage retention/quota and final migration still require the deferred device session; exports remain the recovery mechanism.
- The remote already exists at `https://github.com/Raul-MA/daily.git`. Remote work remains suspended by the user's instruction.

## Checkpoints and references

- `6788dc2`: Piano localization, language-only ordinary exercise snapshots and nested prompt validation.
- `82835e8`: Budget delayed-permission cancellation and timestamp bounds.
- `5c3a0e2`: Reader authored errors, cache/timestamp validation and guarded recovery downloads.
- `83926e9`: Shared unreadable-root recovery, persistence request, activity bounds and synchronized standalone exporters.
- [Checkpoint history](implementation-history.md) preserves detailed earlier evidence. Session IDs and old “next steps” there are historical, not active instructions.
- [Authoritative plan](pwa-consolidation-plan.md), [platform](platform.md), [storage/migrations](storage-and-migrations.md), [testing](testing.md), [test inventory](../reports/migration-test-inventory.md) and module Compass files describe current contracts.
