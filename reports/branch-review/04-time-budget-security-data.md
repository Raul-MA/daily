# Time Budget security and data safety review

## Scope and result

Compared `main` (`1e1caae45edd6fe318dff5a997de8b108d0bb2d4`) with `review/08-cloud-sharing-proposal` (`859fd7b0f1365f90cbef22b0975f612580580e2c`), using the source snapshot `/tmp/daily-branch-review-20261018`. No source edits, browser/build runs or network requests.

No confirmed introduced security or data safety defect was found. The changed feature separates the mounted budget, countdown and backup controls into three panels; domain timer and import implementations largely predate this diff.

## Coverage and evidence

Read module AGENTS/Compass and the complete diff for all eleven changed paths: `COMPASS.md`, `docs/behavior.md`, five files in `e2e/` (`helpers.js`, `localization.spec.js`, `recovery.spec.js`, `shell.spec.js`, `time-budget.spec.js`), `src/methods/setupKeyboardShortcuts.js`, `src/sections.js`, `src/style.css`, and `src/view.js`. The E2E inventory includes the helper and four specs; the full Git inventory is eleven paths.

Read resulting changed implementation and necessary dependencies: `src/lifecycle.js`, `src/forms.js`, `src/backup-ui.js`, `src/countdown-ui.js`, `src/events.js`, `src/imports.js`, and shared `apps/daily/src/shell/sidebar.js`, `sidebar-controls.js`, plus previously reviewed catalog/draft behavior.

- `mountSections()` moves existing DOM nodes and toggles `hidden`; it does not remount forms, call a save API, pause a clock or change a persisted session. `ui.section` stores only one of three static panel identifiers in UI memory. Its lookup falls back to the plan for an unknown value.
- New heading text uses `textContent`. Section selectors and `daily:show-section` handlers are static local integration points; no imported string becomes executable code, HTML, a navigation destination or a selector.
- Hidden forms remain descendants of the app host. Existing draft capture, expected-state stamping and `ensureFresh()` query the whole host rather than visible nodes, so switching panels does not remove their stale-write protection or draft eligibility.
- Existing import reads still use request identities and a disposed flag. Preview/recovery/confirmation remains required, and `budgetImports.applyImport()` checks issued preview identity, unchanged root state and unchanged preview before replacement. Hiding the Settings panel does not apply its preview.
- The new keyboard guard prevents Space from mutating a timer when its panel is hidden. The existing action path still calls `ensureFresh()` before a timer mutation. The guard does not disable validation or execute an alternate action.
- Presentation and countdown timers continue independently of panel visibility; the existing mount disposal still stops their presentation resources. Nothing in the changed section code creates a second activity or persistence timer.
- Test diffs retain import cancellation/recovery, active session and independent countdown assertions, with section navigation added before affected controls. New checks assert that Space outside the plan leaves storage unchanged.

## Limits and non-findings

No unresolved security/data candidate was identified. This specialist did not execute the module suite; the parent runs it, and other specialists own correctness, architecture, UI/accessibility and test quality. This pass does not certify all unchanged keyboard/modal UX, full timer math, shared storage concurrency, legacy adapters or physical-device suspension. Static reasoning about retained import guards is distinguished from an independently executed race test.
