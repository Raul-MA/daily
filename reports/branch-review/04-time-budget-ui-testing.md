# Time Budget: UI, accessibility, localization and test review

Comparison: `main` → `review/08-cloud-sharing-proposal`; reviewed 2026-10-18. Branch snapshot `/tmp/daily-branch-review-20261018`; Git comparison from `/workspaces/daily`.

## Findings

### P2 — Reveal the import preview when using the retained Templates file control

Changed location: `modules/time-budget/src/sections.js:17-18` (panel visibility switching).

Trigger: remain in Time Budget, expand Templates, select a valid JSON using its retained **Import templates** control. `template.js:86-89` still binds that input to `app.importTemplates(this)`. `backup-ui.js:importTemplates` sets `data-time-import-preview.hidden = false` and fills its summary, but that preview lives inside `.time-backup`, whose new Settings parent is hidden by `mountSections`. No event changes the selected panel. Consequently the user sees no preview, recovery download or confirmation after selecting a valid template backup; they must independently open Settings to discover the pending import. Route the retained picker to Settings or show its preview within the selected panel.

Evidence: deterministic source trace through the retained template input → delegated `events.js:invoke` → `backup-ui.js:importTemplates` → new `sections.js:select`. Static verification; root notified for focused browser confirmation. Updated import tests use the Settings control and omit this retained path.

### P2 — Focus a visible heading when returning to a running plan

Changed location: `apps/daily/src/shell/sidebar-controls.js:51-52` (shared dependency introduced in this comparison).

Trigger: start a budget, select Countdowns, then choose Time Budget. `mountSections` places the setup form before the timer screen in the plan panel. `showTimerScreen` hides `#setupScreen`. `visitSection` selects the first `h1,h2,summary` descendant, which is the hidden setup heading; calling `focus()` on it cannot focus the visible task. On phones `close(context, false)` also makes the clicked sidebar button inert before this failed focus attempt. This loses the promised focus handoff into the selected panel and makes keyboard/screen-reader navigation restart away from the active task. Select a visible heading or fall back to the visible panel.

Evidence: source trace through `sections.js:5`, `template.js` ordering, `methods/showTimerScreen.js`, and `sidebar-controls.js:43-53`. Root notified for browser confirmation; no runtime reproduction by this agent. The desktop sidebar acceptance only returns to an unstarted plan, where the first setup heading remains visible.

## Coverage

Read module AGENTS, COMPASS and behavior documentation. Inspected all 11 changed files: COMPASS, behavior doc, E2E helpers/localization/recovery/shell/time-budget specs, `src/methods/setupKeyboardShortcuts.js`, `src/sections.js`, `src/style.css`, `src/view.js`.

Traced `src/template.js`, `forms.js`, `events.js`, `backup-ui.js`, `countdown-ui.js`, `methods/showTimerScreen.js`; shared sidebar catalog/controls/render, draft capture/restore and `tests/e2e/sidebar.spec.js`.

- Original assertions are retained. Template selector changes scope the original summary; new section navigation makes existing acceptance reach its now-hidden controls. Added acceptance checks selected Settings survives EN/ES remounts and Space in Countdowns does not mutate the running budget.
- Panel switching only changes UI state/hidden flags and preserves mounted forms. Selected panel is retained in module UI memory; draft capture spans the whole host. New CSS explicitly hides panels despite their existing display rules.
- Source inspection confirms the new keyboard guard prevents hidden budget controls handling Space. It returns before all shortcuts, including Escape; no additional introduced user-visible Escape failure was established.

## Nonblocking gaps and limits

Changed suites do not exercise the original Templates import picker after panel separation or visible focus when returning to a running plan. These omissions correspond to the findings above. Countdown selected-panel heading semantics and initial hidden-heading page-title behavior were inspected but not raised as independent findings to avoid duplicating the focus issue.

Static review only: this agent ran no Time Budget browser/build/server commands, runtime probes, screenshots, accessibility scanners or network requests. Root owns suite execution and any browser confirmation. No source/tests changed or personal data accessed.

## Parent browser confirmation

Root independently reproduced both findings using `node /tmp/daily-review-time-probe.mjs` against the branch build, local server on 8779 and Chromium (exit 0). This is parent runtime evidence, not a probe run by this agent.

- Import: open Time Budget → expand Templates → choose a valid one-template legacy JSON. Observed preview.hidden=false, its closest panel.hidden=true, and effective visibility=false. The hidden preview summary contained 1 template, 0 tasks, 0 countdowns.
- Focus: at 320px, start a budget → choose Countdowns in the menu → choose Time Budget. Timer remained visible, but activeElement was the Time Budget menu button inside an inert ancestor; selected heading was setupTitle.
- Root also reports the full Time Budget suite passing 23 unit and 23 browser tests. Those passing tests omit both reproduced paths.
