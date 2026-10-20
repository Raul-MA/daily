# Shared platform: UI, accessibility, localization and test review

Comparison `main` (`1e1caae`) → `review/08-cloud-sharing-proposal` (`859fd7b`), reviewed 2026-10-19 after the saved review checkpoint. Source inspection uses the exact committed-head archive `/tmp/daily-branch-review-20261018`; Git comparisons use `/workspaces/daily`. The seven completed app scopes were not restarted.

## Introduced findings

### P2 — Keep the keyboard skip link above the desktop sidebar

Changed location: `apps/daily/src/shell/sidebar.css:3`.

At desktop widths the new fixed opaque sidebar covers the full left edge at z-index 50. The retained shell skip link appears on focus at top 8px / left 12px with z-index 5 (`shell/style.css`). Keyboard users tabbing to Skip to content therefore focus a link painted behind the sidebar. Its action can still run if activated blindly, but its visible focus/label is hidden. Raise the skip link above the sidebar or position the focused link outside its occupied region.

Evidence: deterministic CSS stacking/geometry trace through new sidebar CSS, retained focused skip-link rules and render order. Parent notified for mounted confirmation; this agent ran no browser probe. This regression is independent of TB-2's hidden heading focus handoff.

### P2 — Clear drawer scroll locking when replacing the shell with recovery UI

Changed location: `apps/daily/src/shell/sidebar.css:34` (body overflow lock keyed only to retained root state).

On a phone, open Apps and then receive a root-storage corruption event from another tab. `renderShell` falls through to `failure()`, which replaces the root's children with the storage recovery screen but preserves `data-menu-open="true"`. No sidebar/backdrop/close button remains. `syncSidebar` returns immediately without an aside, so its form-state listener cannot clear the stale value. The new body selector continues applying overflow:hidden. On a short viewport the long recovery UI cannot be scrolled normally to its lower restore/diagnostic controls. Reset drawer state on the failure transition, or require an actual open sidebar when applying the body lock.

Evidence: source trace through `app.js:storageRefresh`, `render.js:failure`, `sidebar-controls.js:syncSidebar` and mobile CSS. Parent notified for a mounted check; no claim of runtime probe by this agent.

### P3 — Preserve modified-click defaults on current sidebar links

Changed location: `apps/daily/src/shell/sidebar-controls.js:63`.

Ctrl/Cmd-click the sidebar link for the currently open destination. `visitLink` intercepts every click on a same-hash link and calls preventDefault, including modifier clicks. This suppresses the normal link action for opening the destination separately; allow modified clicks to retain browser defaults before handling ordinary same-page navigation.

Evidence: root’s real Chromium Control-click instrumentation observed `{control:"current-sidebar-link", prevented:true}` and `{control:"reference-link", prevented:false}` for an otherwise identical same-URL plain anchor control, using a temporary probe fixture rather than editing application source. The source has no Ctrl/Meta modifier guard. The probe exited 0. This establishes the unintended event cancellation; no successful popup/new-tab count is claimed, since the earlier popup-wait control was inconclusive.

## Existing finding deduplicated

TB-2 already records `sidebar-controls.js` choosing the hidden setup heading when returning to a running Time Budget plan, leaving focus inside the inert phone menu. It is not counted again as a shared finding. Its prior parent browser evidence remains in [Time Budget reproduction](04-time-budget-reproduction.md).

## Runtime and test coverage inspected

All 14 changed app paths were reviewed: diagnostic `style.css`; shell `app.js`, `catalog.js`, `dashboard.js`, new `footer.js`, `navigation.js`, `pwa.js`, `render.js`, `sidebar-catalog.js`, `sidebar-controls.js`, `sidebar-icons.js`, `sidebar.css`, `sidebar.js`, `style.css`.

Reviewed both changed package paths: shell translations and router route export. Reviewed both script paths: discovery counts and Piano contract generator. Reviewed all six changed shared browser files: platform/sidebar/page-width specs, width checker, width fixture and width route enumeration. Dependencies traced include shared theme/interactions/committed rendering, draft/PWA lifecycle and recovery-view integration previously inspected during the app passes.

- Drawer opens with a labeled close button, background inerting and aria-modal; Escape/backdrop restore opener focus, navigation resets menu state, and breakpoint changes synchronize visibility. The new desktop offset matches full-width content geometry. Only the concrete failures above and deduplicated TB-2 are raised; ordinary menu preferences are not bugs.
- Every app's detail/settings route is recognized by the expanded catalog. Shared section labels have EN/ES pairs; icons are aria-hidden and generated only from fixed path strings.
- Dashboard title links use existing catalog destinations; their new acceptance follows all five links and compares unchanged saved storage. Quick actions retains its own non-link heading. Link hit targets now have minimum 44px height.
- The retained PWA host is attached to each new footer slot on draw, with a body fallback in recovery. Registration/listeners remain owned by the same PWA instance. Footer save status retains role=status. Static tracing is distinct from root's General update/offline execution.
- The route registry is exported without changing route parsing/encoding. Width enumeration derives registered URLs, Piano destinations and lesson states; the new test audits content bounds/overflow at 1600/900/390/320, with separate Time/Coffee setup states and diagnostics.
- Inspected all changed assertion hunks. Existing navigation/storage/theme assertions remain. Platform viewport bounds now explicitly compare against viewport minus the new sidebar offset; this documents the intentional sidebar layout rather than dropping the width invariant. New document-scroll assertions require wheel scrolling to move the shared header, footer reachability and inner scrollTop zero.
- Discovery increases Piano units by 20, Plants/Piano native browsers by one/five and General by four. It still throws for missing expected discovery rather than masking absent tests. Contract generator remains a plain Node writer with fixed local output paths; it derives schema/types/prompt from the runtime schema and preserves the documented example/fixture boundary.

## Documentation and artifact review

Read committed root COMPASS and focused deployment/platform/progress changes from the archive, plus the cloud proposal's status, UI/data boundaries and acceptance design. It explicitly authorizes no cloud implementation/setup/deployment and preserves local-only use, independent app spaces, EN/ES, explicit opt-in and deferred physical delivery. No nonexistent cloud UI is treated as an introduced runtime defect; no web claims were independently researched in this local code review.

Inspected the 54 changed report paths proportionately: source/inventory mapping diffs, structured Piano/sidebar verification manifests, compatibility summary, every text report's final status/tail, and generated width-audit structure. The width JSON parses as 87 routes, 360 state/width results, four widths and zero recorded violations. Large generated JSON was checked structurally, not claimed as a manual line-by-line audit. Historical red/transient report failures remain explicit, with documented clean reruns; those historical claims are not substituted for the independent current review checks. Source mapping labels the player authored/new rather than pretending it is retained original code.

## Nonblocking test gaps and limits

- Sidebar tests check menu focus containment/Escape, but do not check the visible skip-link layer or recovery entered while the drawer is open. Their recovery-host test runs with the menu closed at desktop width.
- Width checks skip absent or hidden matching nodes; they are strong geometry regression checks for mounted content, but do not independently assert every expected inner selector exists. They do not certify zoom/large-text, screen-reader announcements or physical safe-area behavior.
- The existing Time Budget documentation says hidden setup sections are unavailable during an active session; its implemented menu intentionally exposes the plan panel and uses hidden inner setup/timer screens. This wording should be clarified, without counting a separate runtime issue.
- Report timestamps/counts describe intermediate implementation checkpoints. Their known failures and current acceptance must remain distinct; the independent root verification report owns final pass/fail claims.

This agent performed static diff/dependency review and read-only report-structure checks only for shared scope. No browser, build, server, screenshot, screen reader, network/API, cloud service or personal-data access occurred. No application/test files were edited. Root owns General/lint/syntax/build execution and any mounted reproduction appended below.

## Parent mounted confirmation and current checks

Root independently ran `/tmp/daily-review-shared-probe.mjs` with Chromium against the committed-head build (exit 0). These are parent-run browser observations, separate from this agent’s static review:

- Skip link: focused=true; bounding rect x=12, y=8, width=149.515625, height=47. At its center, elementFromPoint returned SPAN.sidebar-brand. Link z-index was 5 and sidebar z-index 50, confirming that visible focus/label is covered.
- Recovery: at 320×500, open Apps then trigger the corrupt-root recovery transition. Root retained menuOpen=true, sidebar count became zero and body overflow remained hidden. Document height was 812px; a 1000px wheel movement left scrollY=0, confirming normal scrolling is blocked while lower recovery content exceeds the viewport.
- Root General suite passes 85 unit and 37 browser cases; strict lint also passes. Passing suites omit these two transitions. Other final checks remain root-owned.

The architecture specialist identified the modified-click concern. Parent’s first popup-wait probe was inconclusive, so no popup behavior is claimed from it. A subsequent real Control-click event probe confirmed unintended default prevention against a normal same-URL anchor control, supporting the P3 finding above. Shared specialty total: three new findings, two P2 and one P3; TB-2 remains deduplicated.
