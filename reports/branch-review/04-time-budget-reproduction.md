# Time Budget browser reproductions

Reviewed head `859fd7b0f1365f90cbef22b0975f612580580e2c`, isolated archive; Chromium 1228, 320 × 900 viewport, disposable browser storage. Parent ran `/tmp/daily-review-time-probe.mjs` with a temporary local server on port 8779; exit 0. Both server and browser were closed by the probe. No runtime source was edited.

## P2: Template import preview is hidden

1. Open `#/time`, expand Templates and select a valid legacy template JSON file with its original Import templates control.
2. Wait for import parsing. The preview contains `1 templates · 0 active tasks · 0 countdowns` and its own `hidden` property is false.
3. Its ancestor `[data-menu-panel=settings]` still has `hidden=true`; the preview has no client rectangles. Recovery and confirmation controls are invisible until the user independently switches to Settings.

Changed source: `modules/time-budget/src/sections.js:10` assigns the backup panel to Settings; lines 15–18 hide it while the original importer remains in the plan. The existing import function unhides only its child preview. Select the preview panel when this importer is used, or keep its preview with the initiating control.

## P2: Returning to a running plan loses keyboard focus

1. At 320px, set a finish time and tasks, start a plan, open Apps and select Countdowns.
2. Open Apps again and select Time Budget.
3. The timer is visible, but `document.activeElement` is still the Time Budget sidebar button and its `closest('[inert]')` is non-null. The panel target chosen by shared navigation is hidden `#setupTitle`.

Changed source: `apps/daily/src/shell/sidebar-controls.js:51` chooses the first heading without checking visibility; `modules/time-budget/src/sections.js:5` places hidden setup before the visible timer in the plan panel. Select a visible focus target after switching panels.

## Existing suite result

The unmodified branch suite passes all 23 unit and 23 browser checks. These additional interactions are not covered by those passing assertions. This review reports findings only and does not fix them.
