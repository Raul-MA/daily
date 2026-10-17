# Implementation progress

Updated: 2026-10-17. Repo: `/workspaces/daily`, branch `feature/piano-exercise-player`.

## Current status and resume

**The original local migration, preview follow-up and imported Piano player are complete locally. Affected/shared checks pass; no verification jobs remain active.** See the player checkpoint below.

Work remains **local only**, using **plain HTML/CSS/JavaScript**. No workflows, pushes, Pages configuration or deployments are authorized. Preserve real Readwise/Reader requests for the user's later private-token checks. Do not request personal tokens or exports.

**Next acceptance work is deferred:** follow [device validation](device-validation.md) when the user resumes actual iPhone, Things, authenticated API, worker-coexistence or release testing. Do not treat those checks as passed or start remote work automatically. The current storage policy is **one editing tab at a time**; revision checks reject ordinary stale saves but do not serialize simultaneous cross-tab writers.

Local preview: `npm run dev`, then `http://127.0.0.1:5173/daily/`. Preparation copies native assets; rebuild after source edits.

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
