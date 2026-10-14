# One daily PWA: research and implementation plan

Status: implementation started 2026-10-13 in the new local `daily/` Git repository. Stage 1 test-first bootstrap is complete; feature implementation and deployment have not started. See [progress / resume](./progress.md) for current evidence and the exact next step.

## Implementation contract: tests first, ESLint required from day one

1. **The first implementation step is to copy the existing tests and E2E suites into the new repo, before copying or implementing application logic.** Inventory source commits, test cases, fixtures, and intentional behavior changes. Run the original suites where possible to distinguish existing failures from migration failures.
2. Add only the minimum test runner, browser harness, route setup, and strict shared ESLint configuration needed to run them. Record the initial red results against the unimplemented apps. Missing behavior should cause failures; broken test discovery or a server that never starts is not adequate red-stage evidence. Already-independent passing tests need not be deliberately broken.
3. Preserve assertions and coverage while adapting imports, routes, and test organization. Imported tests must also satisfy ESLint: split oversized files/functions and move explanatory comments into documentation. No skipped tests, weaker assertions, blanket exclusions, inline disables, or legacy lint exemptions to manufacture success.
4. Implement/refactor one module at a time until every test in its suite passes. Add characterization tests first for uncovered behavior and for Time Budget/Reader, which have no discovered suites. Record approved differences, such as piano continuation, with replacement acceptance tests before implementation.
5. Keep general/platform tests separate from module suites. A coffee-only change can run coffee unit/integration and E2E tests; shared changes require the general and affected module suites. Full verification runs all suites, strict lint, typechecking, and the build before release or declaring the migration complete.

ESLint is blocking for **all authored code, imported code, tests, and scripts from the outset**. This replaces the earlier advisory legacy-report proposal. During test-first bootstrap the feature suites are intentionally red and reported honestly; lint remains mandatory. A module is not complete until its tests pass, and the PWA is not complete until all suites pass.

## 1. Agreed outcome

Create a new monorepo that deploys one personal, installable PWA to GitHub Pages. Its home screen is a configurable daily dashboard. All seven existing apps remain available inside the same installation, with their functionality and individual visual styles preserved initially.

The primary device is an iPhone. Application records and preferences remain local, with export/import; there is no new account system, application backend, or cross-device sync. Readwise and Reader remain external services accessed directly using the user's token. Existing Things and WhatsApp integrations retain their current behavior.

The dashboard and all app interfaces support English and Spanish. A shared language setting drives separate app translation dictionaries without requiring a visual redesign.

### Default dashboard

| Widget | Initial behavior |
| --- | --- |
| Plants needing attention | Show overdue and today's care tasks, ordered by urgency. Each reminder links to that specific plant by stable ID; tapping never completes care. Preserve existing care and reminder rules. |
| Running activities | Show active time budget, countdowns, board-game session, and piano practice with elapsed/remaining time and links to their modules. Controls stay inside the modules. |
| Readwise Daily Review | Show the scheduled Daily Review, not a feed of recently reviewed entries. Show available highlights and service-reported completion, with a direct review link when embedding is unavailable. |
| Reader picks | Initially show three distinct eligible documents. Saved picker settings control count, maximum remaining reading time, progress, locations, and priority behavior. |
| Quick actions | Open the current coffee logging form; open game-session setup for today; create a timer or time budget. Opening a form does not create an incomplete record. |
| Piano | Open a random piano exercise, return to the last exercise, or resume persisted practice. |

Plants and running activities occupy the top of the initial layout. Widgets can be added, removed, and reordered; this configuration persists. Removing a widget neither removes its app nor stops its activities. A compact shared running-activity indicator remains available outside the dashboard.

Use the accepted iOS dashboard design: three columns on desktop (1100px and wider), two on tablet, one on phones. Cards show summaries and navigation links only for now. Logging, timer controls, plant care, review interaction, and picker controls belong in their corresponding modules; settings own widget customization.

All apps are also reachable through a shared app menu, including WhatsApp Later and the full Reader picker. Quick actions have configurable visibility, but every function remains reachable inside its app.

### Defaults chosen where the interview left detail open

- Support both the existing Time Budget workflow and simple named countdowns. Allow multiple independent countdowns, while preserving one active time budget and the board-game app's one-active-session rule.
- The requested reading content is the current scheduled Daily Review, never recently reviewed or recently created highlights. The API returns the latest available review; if its day cannot be established, label it honestly and offer the Daily Review link rather than calling it today's review.
- Persist both the last opened piano exercise and completed practice records. A running guided session has separate resumable state.
- Keep Reader picks stable when navigating away and back. Provide Pick again; replace invalid/finished picks after refreshed metadata. Do not reshuffle on every dashboard render.
- Preserve the picker's existing default maximum of ten remaining minutes until the user changes it; offer Any length explicitly. Three is the default count, not a permanent dashboard constraint.

## 2. Repository findings

Reviewed the six local repositories and a temporary checkout of [random-readwise](https://github.com/Raul-MA/random-readwise) at commit `b3892b2417b8167d0cd063c31b2b69da781fd4a9`.

| Repository | Existing capability and structure | Integration implications |
| --- | --- | --- |
| `stillgreen` | Browser modules; care schedules, history, seasonal rules, manual due dates, Things shortcut integration; versioned localStorage with recovery copies. | Reuse `care/care.js` and `care/reminders.js`. Preserve recovery behavior and plant identities. Current plant export does not include Things settings. |
| `coffee-tracker` | Vanilla modules with reusable browser-side domain logic in `backend/`; coffee forms, beans, history, insights, EN/ES. | Adapt in-memory navigation and global DOM access. Preserve backup merge/replace semantics and tool setup. Coffee Excel is explicitly excluded: do not port, implement, or test it in this repo. |
| `game-tracker` | Browser-side domain modules, hash routes, active session, player/game management, scoring, history, statistics. | Preserve collaborative games, archive rules, player references, and one active game. Existing backups are replace-only. |
| `timeBudget` | Deadline budgeting, task timers, reallocation, templates, active-session persistence. | Extract timer ownership from page rendering. README is outdated: code already saves active sessions, but export covers only templates. |
| `toniq` | Modular jazz lessons and exercises, shared music data, audio/diagrams, route cleanup. No persistent practice state. | Add practice persistence and random-exercise selection. Current guided practice pauses on visibility loss and loses progress on navigation; agreed timer continuation requires a deliberate behavior change. Some asset paths assume `/toniq/`. |
| `schedule-whatsapp` | Local draft; creates Things URL containing a WhatsApp link; no autonomous sending or notification scheduler. | Preserve draft clearing and explicit external handoff. Do not claim task creation or message delivery can be confirmed. |
| `random-readwise` | Reader API client, pagination, filtering, weighted priority buckets, 1/3/5 picks, 15-minute session cache, optional saved token and last item, shortcut URL parameters. | Extract API and picker logic from one page script. Add a Daily Review client, configurable dashboard count, and exportable preferences. Existing preferences already use localStorage. |

The apps are compatible with static hosting and do not require a runtime framework migration. Their `backend` directories are browser code, not servers.

Five of the original service workers remove all caches except their own during activation: plants, coffee, games, Time Budget, and Toniq. That can affect sibling apps on the same origin. Reader and WhatsApp already limit cleanup by cache prefix. Consolidation must include a safe transition for old workers as well as a single new worker.

The apps also use global CSS, document-wide selectors, and different navigation systems. Importing their entry scripts into one page unchanged would produce conflicts. These are integration tasks, not reasons to retain separate PWAs.

Existing tests cover coffee and game workflows, plant storage and Things links, Toniq music/practice/offline behavior, and WhatsApp URL construction. No test suite was found in the Reader checkout or Time Budget repository. Tests were inspected but not executed for this planning task.

Coffee has existing uncommitted documentation, a backup file, and Excel-related additions. These remain untouched. Migration must explicitly inventory them; personal backups must not enter a public deployment.

## 3. Recommended architecture

Use a new repository, with npm workspaces, one lockfile, one build, and one GitHub Pages deployment. Use Vite to bundle the existing ES modules and new code. Keep the apps in vanilla JavaScript initially; use TypeScript for new shared contracts, persistence, routing, timers, and integration code. A complete conversion of existing apps is unnecessary.

The working name below is only a placeholder.

```text
daily/
  AGENTS.md
  README.md
  COMPASS.md
  .codex/skills/compass-docs/
  package.json
  eslint.config.mjs
  tsconfig.base.json
  apps/
    daily/
      src/                 # Shell, dashboard, widget registry, app menu
      public/              # Static assets and the single manifest
      e2e/
  modules/
    plants/
    coffee/
    games/
    time-budget/
    piano/
    whatsapp/
    reading/               # Reader picker and Readwise review
  packages/
    platform/              # Router, lifecycle, activity registry, timers
    data/                  # Local persistence, backup/import, migrations
    ui/                    # Dashboard and shared shell components
    i18n/                  # Locale selection, dictionaries, formatting
    eslint-config/         # User-specified shared rules and local plugin
  tests/
    general/               # Platform, shared contracts, cross-module integration
    e2e/                   # Whole-PWA navigation, migration, offline/update flows
  scripts/                 # Build checks and scoped/full test orchestration
  docs/
    architecture.md
    routing.md
    storage-and-migrations.md
    timers-and-lifecycle.md
    offline-and-updates.md
    styling-and-accessibility.md
    integrations.md
    lint-policy.md
    testing.md
    deployment.md
    decisions/
  reports/
    migration-test-inventory.md
```

Every app module gets its own `AGENTS.md`, `COMPASS.md`, `docs/`, `src/`, `test/`, and `e2e/`. Root docs own common policy; module docs own domain rules. Do not copy the shared ESLint configuration into each module. Coffee Excel utilities and their dependencies are outside this migration.

### Module boundaries

Each module registers metadata, routes, and optional dashboard providers. A page exposes a mount function and returns cleanup. Cleanup removes page event listeners and rendering intervals; it never implicitly stops a persisted activity.

Dashboard widgets use the same domain functions as their full apps. They do not inspect another app's DOM, reinterpret raw localStorage, or keep a second copy of its business data. Shared events notify widgets after committed changes. Failed saves must not produce a successful-looking dashboard state.

The shell owns navigation, language, installation, service-worker updates, and ongoing-activity presentation. Modules own their records, business rules, page UI, and domain settings. Share date helpers, escaping, IDs, backup infrastructure, and common controls when behavior is genuinely shared; retain distinct coffee/game/plant validation.

### Preserve each app's appearance

Use the accepted [iOS demo](../../daily-dashboard-demo/index.html?design=ios) as the dashboard visual reference, with three desktop columns and navigation-only cards. Do not ship the alternative design experiments. Mount each app under a module wrapper with scoped styles and module-specific CSS variables, preserving its current appearance. Adapt global `html`, `body`, and `:root` rules to the module boundary and audit overlays, dialogs, focus, and safe areas. Scope selectors to the mount container. Keep the common Home/App menu small and visually neutral.

Use before/after screenshots of existing flows to verify visual preservation. An iframe-based launcher would reduce initial CSS work but complicate routing, timers, accessibility, and data updates; it is not the recommended final architecture.

### URL management

Use one hash router so GitHub Pages can serve deep links without server rewrites:

```text
/daily/#/
/daily/#/plants
/daily/#/plants/PLANT_ID
/daily/#/coffee/new
/daily/#/games/new
/daily/#/games/session/SESSION_ID
/daily/#/time
/daily/#/piano/exercises/EXERCISE_ID
/daily/#/piano/learn?lesson=LESSON_ID
/daily/#/reading/picker?count=3&minutes=15
/daily/#/whatsapp
/daily/#/settings
```

Build URLs through one helper, with stable IDs, encoding, allowlisted routes, and a configurable deployment base. No hardcoded repository prefix. Browser Back/Forward, reload, offline reopening, and returning from external apps must work.

Retain Reader shortcut parameters through a documented compatibility parser. Explicit URL parameters override saved picker preferences for that launch; changing controls or choosing Save preferences persists settings. Merely following a shortcut should not overwrite permanent preferences. Map old Toniq lesson and game session routes where possible. Redirecting an old site must never bypass its export/migration screen.

## 4. Readwise and Reader

### Persisted picker settings

Store picker settings in localStorage through the common data layer and include them in the full backup. Expose them both from Reader and the central Settings page; both views edit the same values.

| Setting | Behavior |
| --- | --- |
| Number of items | Positive whole number; retain 1/3/5 shortcuts and add a custom input. Proposed UI cap: 20. Default 3. |
| Maximum time remaining | Any length, presets, or a positive custom minute value. Based on estimated remaining time, not total document length. |
| Progress | Unfinished, started, or unread. |
| Locations | Inbox, Later, Shortlist; selection and priority order. |
| Selection policy | Preserve started-first behavior by default; allow uniform random sampling among all eligible fetched items. |
| Remember last item | Preserve existing optional Continue reading behavior and revalidation. |
| Cache/scan limits | Preserve the existing advanced controls, with bounded input and clear refresh behavior. |
| Shortcut behavior | Preserve URL updates and automatic opening for a single result in the full picker. Dashboard never automatically sends the user away. |

Use the settings to request N distinct picks. Return fewer when the eligible pool is smaller and explain why. Exclude archived/completed items and child highlights/notes. Deduplicate document IDs across pages and locations. Keep unknown reading durations out of a finite time budget unless the user explicitly includes unknown-duration items; show them as unknown, not zero minutes.

Reuse the current remaining-time estimate and location/progress filters, but distinguish randomness within the scanned pool from randomness across the entire library. The existing scan cap means the latter cannot be promised. Cache metadata, not complete articles, and expose last refresh time and whether scanning was truncated.

Cache and persist the current picks separately from preferences so route changes do not reshuffle them. Pick again uses cached metadata when fresh; Refresh updates data from Readwise. Cancel obsolete requests and discard results if the token or settings changed mid-request. Clear account-specific caches when changing/forgetting the token.

### Scheduled Daily Review, Q&A interface, and feedback

Fetch the scheduled review through `GET https://readwise.io/api/v2/review/`, not a recently-reviewed feed or Reader's document list. It returns the latest available review, highlights, review URL, and completion state; a missing review returns 404. Completion has a separate POST endpoint. [Readwise API](https://readwise.io/api_deets).

The dashboard stays summary-and-link only. In the reading module, the requested feedback buttons are **Never, Soon, Later, Someday**, under “Show this highlight again,” as shown in the user's `toniq/Screenshot 2026-10-12 at 8.22.08 p.m..png`. The screenshot is a reference for these actions only, not the card layout, typography, colors, or overall design. Keep the accepted iOS three-column dashboard design unchanged. Question/answer reveal remains a separate requested capability where actual Q&A content is available.

The Readwise module must include a Q&A presentation for available question/answer cards: show the question first with the answer hidden, provide an explicit Reveal answer action, then show the answer and applicable review feedback. Reset answer visibility when moving to another card. Support English/Spanish controls, keyboard access, and screen-reader announcements. Ordinary highlights remain ordinary highlights, not fabricated questions. This Q&A interface is required alongside the feedback controls, not replaced by them; it does not add inline interactions to the dashboard.

These are highlight-resurfacing controls, not necessarily Mastery-card controls. Verify the API behavior for each action before implementation, especially Never; do not infer that it deletes a highlight or removes a Mastery card. The [Readwise Mastery guide](https://docs.readwise.io/readwise/guides/mastery) describes a related but distinct card-review flow and is not sufficient to establish the pictured highlight controls' API semantics.

Research did not establish a documented API for structured Mastery cards or per-card scheduling feedback. The desired Q&A UI is explicit; live data and feedback synchronization remain capability-gated. Verify before implementing, without inventing Q&A from ordinary highlights, faking scheduling locally, or depending on private endpoints. Write tests first for question-only initial state, answer reveal, hidden answers on card changes, ordinary-highlight rendering, feedback success/failure, and explicit completion. Fixture-based UI tests do not prove live API support; if real card data is unavailable, use the agreed direct-review fallback and document the integration limitation.

If embedding or review interaction is unsupported, use the returned review URL or [Open Daily Review](https://readwise.io/dailyreview). This is an accepted outcome, not a reason to introduce a backend. Missing credentials and unavailable data also retain that link. Opening or displaying a review never marks it complete. A future embedded completion action must be explicit and reflect server success.

Show retrieval freshness, distinguish cached data from current data, and never label a review as today's unless its day is established. A missing review is an empty state rather than an app-wide error.

### Credentials and connectivity

Reuse the existing token model: memory by default, optional persistent saving on the installed PWA. Never include tokens in URLs, Git, bundled assets, logs, routine backups, or service-worker response caches. Re-enter the token after migration/restore. Reader preferences are always persistable independently of whether the token is remembered.

Readwise requests go directly from the iPhone to Readwise. No proxy or cloud database is included. Verify authenticated CORS access for the auth, Reader-list, and Daily-Review endpoints from the actual Pages origin early; inspecting code and API documentation does not verify that behavior. No personal token or authenticated API call was used in this research. If an endpoint cannot be called from the browser, document that constraint and offer an explicit cached-data/Shortcuts-import fallback; a proxy would require changing the local-only architecture.

Show local widgets immediately. Reading widgets load independently, honor rate limits, and show cached data with a stale/offline label when necessary. API failures must not block coffee, plants, games, or timers. Cached metadata does not make full Reader documents available offline inside this PWA.

## 5. Timers and ongoing activities

The timer service belongs to the app platform, outside page components. Persist stable IDs, status, start/end timestamps, paused duration, and domain references. Use timestamps to derive elapsed/remaining time; rendering intervals only refresh the display. Save on transitions, not every tick.

Navigating from Time Budget or piano to Home does not cancel the activity. Dashboard and app pages subscribe to one state source. Pausing, resuming, completing, or adjusting a budget updates all views. Reopening after suspension reconstructs the correct elapsed state and overdue status from saved timestamps.

For piano, preserve lesson, block, filters, current generated prompt, reveal state, and timing sufficiently to resume without silently replacing the exercise. Freeze the displayed prompt sequence while hidden; on return, calculate elapsed time and display any budget overrun without replaying missed prompts or automatically completing the session. Explicit pause still stops time. This replaces Toniq's current automatic pause-on-hide behavior intentionally.

Keep simple countdowns separate from Time Budget's reallocation rules. Starting a second time budget must offer the existing active one rather than overwrite it. Starting a game from Home follows the same active-session constraint as the game app.

iOS can suspend or terminate web execution when locked or backgrounded. Correct elapsed-time reconstruction is achievable; continuous background JavaScript, exact alarm delivery while suspended, or audible background piano cannot be promised by this static PWA. Keep existing reminder channels and permission behavior. Do not add push infrastructure. Test both ordinary resume and a complete app-process restart on a physical iPhone.

## 6. Local data and migration

### Storage approach

Start with a versioned localStorage document managed by the shared data package. It contains global preferences plus separately versioned module payloads, preserving original record IDs and domain shapes. Store Reader preferences here explicitly. Tokens remain in a separate local key and are excluded from backup/export. Large or disposable reading caches should be separate from the authoritative record document.

One validated root-document replacement provides a clear all-or-nothing boundary for a combined restore. Keep domain adapters so this choice can change without rewriting UI. Evaluate the largest actual user backups before committing to this storage layout: synchronous serialization and storage quotas are real limits. If records exceed a practical budget, move records to IndexedDB while keeping preferences in localStorage, and document restore recovery across both stores before adopting that alternative.

Preserve Stillgreen's corruption detection/recovery protections in the shared layer. Storage failures retain the previous readable state and visibly report that saving failed. Never silently replace malformed data with an empty collection. Request persistent storage where available, but treat user exports as the recovery mechanism rather than promising permanent browser retention.

### Import compatibility

| Source | Preserve/import | Gap to address before retirement |
| --- | --- | --- |
| Coffee | Existing JSON backup: entries, beans, settings; retain merge and replace flows. | Verify referenced bean IDs and legacy normalization; exclude personal backup files from deployment. |
| Games | Existing full JSON backup: players, games, sessions, settings; retain replace-only behavior. | Preserve snapshots, archived records, collaborative outcomes, timing, and active session. |
| Plants | Existing plant-array exports and supported storage envelope. | Add a migration export including Things settings and relevant preferences; current export includes plants only. |
| Time Budget | Existing template JSON; migrate active budget/tasks/timing as well. | Add a migration export for current state; existing export only covers templates. |
| Piano | No historical persistent data exists to recover. | New tracking starts at migration; never invent prior progress. |
| WhatsApp | Saved draft and selected local reminder time. | Add a small export/import path; preserve validation for times that have since passed. |
| Reader | Preferences, optional remembered item, and current picks where useful. | Add export/import; exclude credentials and disposable API cache. |

The new import screen identifies supported formats using schema validation and app identity, with explicit source selection when ambiguous. It previews record counts and replacement/merge behavior, validates nested references, and creates a recovery export before replacing existing records. Reject unsupported future versions without mutation. Full-app restore and per-module import are separate choices.

Export a versioned full-PWA JSON backup including dashboard layout, language, all module records/preferences, and ongoing activity state. Preserve existing domain JSON export/import formats; do not implement coffee Excel features. Explain that restoring a running timer preserves its original start time and may show it as overdue.

### Actual iPhone migration

1. Add the missing migration exporters to old apps where needed; release them before retirement.
2. Open each currently installed PWA and export from that installation to Files. Do not rely on Safari tabs sharing the installed app's data.
3. Install the combined PWA, import exports, and compare counts and representative records/history.
4. Re-enter the Readwise token and test Things/Reader/WhatsApp handoffs.
5. Export a combined backup and verify restore in a separate test installation/profile.
6. Keep old installations and exports until validation is complete. Removing an icon or deleting a repo is not part of automatic migration.

Browser storage is origin-based, not repository-path-based, but that does not establish that a new iOS installation can see another installed PWA's storage. Same-origin auto-detection may be offered as a convenience after validation; exports are the guaranteed migration path under our control.

Prefer a dedicated origin for the new PWA if one is available, especially with a saved Readwise token. A new repository under the same `raul-ma.github.io` host is not a separate origin. GitHub Pages remains compatible with either a project path or a custom domain; repository/domain naming is a deployment detail, not a blocker to implementation planning.

## 7. One offline and update lifecycle

Ship one manifest, stable install identity, service-worker scope, and installation flow. Feature modules do not register their old service workers. Generate the offline asset list from the build so lazy-loaded routes, piano audio, diagrams, translations, and CSS are covered.

Precache the required app shell and module assets; explicitly handle large optional media downloads if measurements show a need. Verify offline access to every included app, not just Home. Bundle required fonts locally or use suitable local fallbacks rather than depending on Google Fonts for offline rendering.

Cache only the new app's owned resources and clean only its named cache versions. Authenticated API responses use the explicit reading-data cache, not generic service-worker caching. Hold the current version during an activity or unsaved form, offer an update, and preserve persisted sessions across activation.

Before old apps and the new PWA coexist on the same origin, release cache-cleanup fixes to the five old workers. Do not broadly unregister workers or clear origin storage. Document scope-specific retirement and account for users who have not yet loaded the updated old apps; a dedicated new origin avoids this cache coexistence dependency but still requires data imports.

## 8. Shared ESLint policy and documentation

Adopt the user's supplied rule set for every application, package, test, and script. The exact configuration is recorded in [pwa-eslint-policy.md](./pwa-eslint-policy.md). Preserve all thresholds and the no-comments plugin, with monorepo path/runtime adjustments described there.

The new repo has mandatory full-scope lint from day one. Imported code is refactored into compliant units as it enters; there is no grandfathered debt baseline or report-only exception. Reports can aid diagnosis but cannot convert a failing lint run into success.

Measured raw file sizes illustrate the refactoring needed: coffee app 1,088 lines; games app 1,483; Time Budget 1,275; Reader app 788; plant detail 705. These are raw line counts, not ESLint findings. Use the copied tests to protect behavior while splitting code; actual lint diagnostics remain to be collected during implementation.

### Documentation ownership

| Document | Responsibility |
| --- | --- |
| Root `AGENTS.md` | Shared working rules, mandatory lint for all code, test-first migration, documentation obligations, validation expectations. |
| Root `COMPASS.md` | Repo map, commands, ownership boundaries, links to deeper docs. |
| Root `README.md` | User-facing setup, installation, local-data model, backup and migration entry points. |
| Shared `docs/` | Routing/base paths, state and events, storage/versions, timers, updates, i18n, integrations, strict lint policy, test strategy, deployment. |
| Module `AGENTS.md` | Domain-specific constraints; reference shared policy without weakening it. |
| Module `COMPASS.md` and `docs/` | Routes, data model, invariants, import formats, settings, tests, known limitations, domain workflows. |
| `docs/decisions/` | Significant choices and alternatives: one PWA, storage approach, style preservation, timer semantics, test-first migration. |

Use the existing `compass-docs` skill, staged under `daily/.codex/skills/compass-docs/` with its references. Keep root/module Compass files short routers and complex explanations in focused deep dives; update both when behavior or paths change. Its Anori-specific examples are not rules for this PWA: this project uses root `AGENTS.md`, EN/ES, and the module structure above. This plan and the lint policy now live in the repo's `docs/`, with workspace relocation pointers and one authoritative copy of each.

Move useful explanations from removed source comments into module/shared docs as affected code is refactored. Use clear names and small functions in source. Document types in `.ts` declarations and external docs rather than introducing JSDoc that violates the requested comment ban. Preserve legal notices in appropriate license files; do not delete required attribution merely to satisfy lint.

Retain the useful existing coffee/game Compass documents, Toniq deep dives, plant Things instructions, and Reader shortcut documentation. Reconcile stale descriptions with the inspected code. Cloud/Azure proposal documents must remain clearly labeled historical proposals, not the current local-only architecture.

## 9. Delivery sequence and acceptance gates

| Stage | Deliverable | Done when |
| --- | --- | --- |
| 1. Copy tests first; record red | Copy all existing unit/integration and E2E suites with safe fixtures, source mapping, and the minimum runnable harness. Set up mandatory shared lint and docs before application implementation. | Tests are discovered and executed; absent features produce recorded red results; lint passes for imported tests/harness; no assertions are weakened or tests skipped; no personal data/secrets enter tracked sources. |
| 2. Prove constraints | iPhone tests for Readwise endpoints, exports, background timer restoration, service-worker coexistence; backup-size/storage feasibility check. | Live integration feasibility is known, storage layout validated, and any fallback is recorded before dependent work. |
| 3. Platform foundation | Test-first shell, manifest, router, EN/ES, settings, data boundary, activities/timers, Pages build, and iOS three-column home. | General suite passes for implemented contracts; deep links/reload work under the real base; all introduced code passes lint; cards navigate without mutations. |
| 4. Plants and daily home | Full plants module, attention widget, layout settings, import/export, existing Things behavior. | Plant suites pass; reminder taps open the correct plant without completing care; imported schedules and existing appearance are preserved. |
| 5. Coffee and games | Full coffee/game modules and dashboard quick actions/resume. | Existing workflow suites pass through the shared shell; no coffee/bean/history/scoring/statistics functions are lost. |
| 6. Time and piano | Full Time Budget and Toniq modules, named countdowns, persistent activities, random/last exercise widgets. | Navigation, lock/resume, explicit pause, reload, and process restart preserve state and calculate elapsed time correctly; piano content/assets work offline. |
| 7. Reading and WhatsApp | Test-first Reader settings/picker, scheduled Daily Review or direct-link fallback, conditional review UI, WhatsApp draft migration. | Module suites pass; settings survive relaunch/restore; N/time filters and shortcuts work; API errors stay isolated; review scheduling is either verified or handed off to Readwise. |
| 8. Release migration | Complete localization, legacy exporters, combined backup recovery, offline/update tests, iPhone installation guide. | All seven parity checklists pass, real iPhone migration is verified, and one installation provides every retained function. |

Stages are development increments, not permission to call the migration complete with missing apps. Preserve the original repositories until the full parity and data migration gates pass. Source history can remain in the originals with recorded source commits; importing complete Git histories is optional and does not affect runtime architecture.

### General and per-module test suites

These commands are now installed for test bootstrap. Their full product scopes remain acceptance requirements; a passing harness check alone does not fulfill them.

| Command | Scope |
| --- | --- |
| `npm run test:general` | Shared packages, platform contracts, dashboard, routing, and whole-PWA integration/E2E: backup, offline, updates, and cross-module lifecycle. |
| `npm run test:coffee` | Only coffee unit/integration and coffee E2E workflows mounted through the shell. |
| `npm run test:plants`, `test:games`, `test:time-budget`, `test:piano`, `test:reading`, `test:whatsapp` | Equivalent isolated suites for each module. |
| `npm run test:all` | General suite plus every module suite, including all E2E tests. |
| `npm run verify` | Blocking full lint, typecheck, all tests, and production build. |

Module suites own domain behavior; general suites own shared contracts and cross-module behavior. Use isolated storage/browser contexts, deterministic clocks, and mocked external APIs. A coffee change does not require unrelated piano/reading tests during its development loop. Changes to shared storage, routing, i18n, timer contracts, or shell require general plus affected module suites. Full verification is required before merging a completed migration increment or releasing; the initial red bootstrap is explicitly incomplete and must not be labeled release-ready.

Track each source test and its migrated destination, including fixture provenance. Test runners must fail on suite errors and missing expected test discovery. Do not mask failures with expected-failure flags. Document justified behavior changes and retain coverage of the original invariant. Collect full-suite results throughout migration: remaining red app suites are unfinished work, not exemptions.

### Verification priorities

- Copy and run existing suites before app logic; retain assertions through refactoring and update only documented, approved behavior differences such as piano continuation.
- Verify dashboard three/two/one-column breakpoints, navigation-only cards, and plant links that never mark care complete.
- Test legacy backup fixtures, Unicode, conflicting IDs, invalid/future schemas, quota failures, corrupt storage, canceled imports, and restore without partial mutation.
- Test Reader pagination, duplicate IDs, priority versus uniform selection, fewer-than-N matches, unknown durations, stale caches, token changes, unauthorized responses, and throttling with mocked responses. Confirm authenticated behavior separately on iPhone.
- Test widget removal/reordering persistence and independence: removing a timer widget cannot stop the timer; a reading failure cannot prevent plant care or logging.
- Verify timers with a controllable clock, then physical iPhone lock/background/termination scenarios. Test local midnight, timezone changes, and daylight-saving boundaries for due tasks and reminder inputs.
- Verify styles per module, narrow-screen layout, keyboard/focus behavior, safe areas, and both languages. Translation changes must not translate stored plant/player/bean names or saved user text.
- Verify a Pages subpath deployment, direct hash links, old shortcut compatibility, all-module offline startup, and version upgrades with active sessions and unsaved forms.

Implementation evidence now belongs to [progress](./progress.md) and [test inventory](../reports/migration-test-inventory.md). Imported suites and a minimal harness have been verified at the initial red stage; production modules and deployment remain pending. Authenticated API behavior and physical iPhone migration/background checks have not been established.

## 10. References

- [Reader Picker source](https://github.com/Raul-MA/random-readwise/tree/b3892b2417b8167d0cd063c31b2b69da781fd4a9): inspected settings, filtering, token handling, shortcut parsing, and caching.
- [Readwise API](https://readwise.io/api_deets): latest Daily Review endpoint and token authentication.
- [Readwise Mastery](https://docs.readwise.io/readwise/guides/mastery): Q&A review and scheduling semantics; not a public API contract for those interactions.
- [Reader API](https://readwise.io/reader_api): document filtering, pagination, and response metadata.
- [GitHub Pages setup](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site): static deployment and custom build workflows.
- [Vite production builds](https://vite.dev/guide/build): static output and deployment base paths.
- [npm workspaces](https://docs.npmjs.com/cli/using-npm/workspaces/): shared repository package management.
- [MDN offline/background operation](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Offline_and_background_operation): service-worker lifecycle and background limitations.
- [WebKit storage policy](https://webkit.org/blog/14403/updates-to-storage-policy/): quotas, persistence, and storage eviction considerations.
- [ESLint flat-config migration](https://eslint.org/docs/latest/use/configure/migration-guide) and [typed linting project service](https://typescript-eslint.io/blog/project-service/): configuration paths and TypeScript project ownership.
