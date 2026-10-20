# Plants: UI, accessibility, localization and test review

Comparison: `main` → `review/08-cloud-sharing-proposal`; reviewed 2026-10-18. Source inspection used the exact branch snapshot `/tmp/daily-branch-review-20261018`, with Git comparisons from `/workspaces/daily`. This report concerns Plants only; shared sidebar dependencies were traced only as they affect Plants.

## Confirmed introduced findings

None identified in this specialty pass. This is limited evidence, not a claim that Plants has no defects.

## What was checked

- Read every Plants diff: `COMPASS.md`, `docs/behavior.md`, `e2e/import-selection.spec.js`, `e2e/plants.spec.js`, `src/style.css`, `src/ui/backup.js`, `src/ui/list.js`, `src/ui/view.js`.
- Traced dependencies: `src/ui/elements.js`, `src/styles/global.css`, `src/styles/plants.css`, `src/styles/settings.css`, `e2e/localization.spec.js`; shared `packages/ui/src/drafts.js`, `apps/daily/src/shell/render.js`, `pwa.js`, `sidebar.js`, `sidebar-catalog.js`, `sidebar-controls.js`, `sidebar.css`, `sidebar-icons.js`, and `tests/e2e/sidebar.spec.js`.
- Checked CSS cascade: the new final `display: block` overrides the original desktop flex-row frame; descendant universal `box-sizing: border-box` avoids a width-plus-padding regression. Full-width overrides target the native form/detail/settings containers, and cards now stack in one column.
- Checked removed module navigation against sidebar catalog: My plants, Add plant and Plant settings remain available in English and Spanish. The shared mobile menu has labels, focus containment, Escape/backdrop close and same-route handling; its existing acceptance assertions explicitly exercise Plants navigation and draft retention.
- Checked automatic import flow: selection invokes read-only preview, replacement remains disabled until recovery link activation, cancel retains the selected file for explicit retry, invalid JSON produces a role=alert near the control, and the request identity plus attached-form checks reject stale/detached asynchronous reads.
- Compared changed test assertions. No existing assertion was removed or weakened; removal of the explicit Preview click reflects the deliberately added automatic-preview acceptance. Added checks cover unchanged storage on selection/cancel/error, recovery gating, reload persistence, two-card column order and widths at 1280/900/320px.
- Existing localization acceptance checks user-authored text remains unchanged through language changes, Spanish authored guides, offline reload, schedule data preservation and 320px overflow.

## Nonblocking test gaps

- No new deterministic slow-file race tests cover selecting A then B with A resolving last, or navigating away before a read resolves. The implementation has explicit guards, but the new test only exercises sequential resolved reads.
- The automatic-dialog test uses pointer actions; it does not assert the focused element after automatic opening, Escape close, or return focus to the file input. Native `showModal()` provides baseline modal behavior, but exact keyboard interaction is unverified here.
- The changed layout acceptance checks list cards; complete form/detail/settings width coverage depends on shared route-width acceptance maintained by the root reviewer.

## Verification and limits

This agent performed static diff review and dependency tracing only. No browser suite, accessibility scanner, screen reader, physical device, screenshots or runtime probe was run by this agent; root review owns sequential suite execution. Existing test code was inspected, not treated as proof it passes now. No source files or tests were edited. No personal backups or authenticated services were accessed.

## Optional probe follow-up

An isolated probe `/tmp/plants-ui-review-probe.mjs` attempted slow-read and modal checks. Initial sandbox Chromium launch failed with a socket permission error. An approved retry reached the real two-record preview but stopped on a probe-only wording mismatch (`2 plant(s)` versus the expected `2 plants`). Therefore this attempt does not establish that the remaining race/focus checks passed. A subsequent rerun was interrupted; no result is claimed. The owned server session was stopped (exit 130). Root separately reports the full Plants suite passing: 28 unit and 14 browser cases, with a 320px screenshot inspected. These suite results are root evidence, distinct from this agent’s incomplete optional probe.
