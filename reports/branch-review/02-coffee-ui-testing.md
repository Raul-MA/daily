# Coffee: UI, accessibility, localization and test review

Comparison: `main` → `review/08-cloud-sharing-proposal`; reviewed 2026-10-18. Branch source snapshot: `/tmp/daily-branch-review-20261018`; Git comparisons used `/workspaces/daily`. Coffee only, with shared navigation traced for Coffee integration.

## Confirmed introduced findings

None identified in this specialty pass. This does not establish the absence of defects.

## Coverage and conclusions

Inspected all seven changed files: `e2e/history-detail.spec.js`, `e2e/offline.spec.js`, `src/frontend/app/import-preview.js`, `navigation.js`, `settings.js`, `src/style.css`, and `src/view.js`. Read module AGENTS, COMPASS and `docs/behavior.md`.

Dependencies inspected: frontend `notifications.js`; shared `apps/daily/src/shell/sidebar-catalog.js`, `sidebar.js`, `sidebar-controls.js`, `sidebar.css`, `navigation.js`, `render.js`, plus `packages/platform/src/router.js`, `packages/ui/src/drafts.js` and shared sidebar acceptance. Read Coffee history-detail/offline tests and inspected relevant coverage declarations/assertions in `e2e/shared.spec.js` and `e2e/final-audit.spec.js`.

- All four removed bottom-tab destinations remain represented in the new shared sidebar with the original test IDs and English/Spanish labels. Entry detail/edit routes still map correctly, and the New alias preserves the ordinary `/coffee` form when its own navigation item is selected again.
- Removed `renderTabs()` calls and `coffee.tabs` references are consistent with removing the tabs element; source search found no remaining call/reference that would dereference the missing element.
- Coffee keeps native entry/history/insight/settings rendering and its theme/language application. Import confirmation still applies the import, closes the dialog and renders; removing its tab refresh does not remove the underlying refresh.
- Full-width `.app-shell` remains under scoped border-box CSS, avoiding a padding-induced overflow regression. Existing narrow-screen styles remain in place.
- Original history/detail assertions are retained; mobile navigation now explicitly opens the shared menu. Offline navigation-label assertions moved from deleted tabs to the actual sidebar, and an explicit count of four labels prevents vacuous success on an empty selection. The Spanish label assertion and global overflow assertion remain.

## Nonblocking gaps and preexisting observations

- The new menu integration has shared keyboard/focus acceptance, but Coffee's changed tests predominantly click links; there is no Coffee-specific keyboard traversal regression test for the four destinations.
- Coffee retains obsolete `.bottom-tabs` CSS and bottom padding after deleting the tab DOM. This is cleanup/spacing debt, not a confirmed functional defect.
- Slow asynchronous import reads use Coffee's shared mutable context without the new request/detached-form guards used in Plants. That code is unchanged versus `main`, so it is outside introduced findings for this comparison; no runtime failure is claimed here.

## Verification and limits

This Coffee review is static. No browser/build/server commands were launched for Coffee by this agent. Root reports 20 Coffee unit tests passing; its initial browser invocation encountered an occupied review-server port, which is infrastructure evidence, not a Coffee failure. The earlier Plants server owned by this agent (session 19425) was stopped with Ctrl-C, exit 130; no further server was launched. Root owns the browser rerun and authoritative suite evidence. No source/test edits, network calls or personal-data reads were made for this review.
