# daily visual review tasks

Scope agreed before section-by-section review: retain this app’s identity; iPhone first at 390×844, narrow check at 320×844, desktop at 1280×900. Fix spacing, alignment, typography and controls. Propose major layout changes before implementation. Synthetic fixtures only; automated test suites remain stopped.

Checklist inventoried from the shared route/sidebar catalogs and app-specific forms, disclosures and dialogs. Each task requires a screenshot of the actual view/state; a screenshot of the app landing page does not cover its other sections. Full-height captures include lower-page sections; galleries are only an inspection aid.

## Section checklist

### 1. Daily dashboard — `/daily/#/`

- [x] Capture before screenshots at the applicable sizes.
- [x] Inspect spacing, alignment, type, controls and overflow; record findings.
- [x] Apply justified visual fixes, or record that no change is needed.
- [x] Capture and inspect the final state; link evidence and note limitations.

### 2. Daily settings — `/daily/#/settings`

- [x] Capture before screenshots at the applicable sizes.
- [x] Inspect spacing, alignment, type, controls and overflow; record findings.
- [x] Apply justified visual fixes, or record that no change is needed.
- [x] Capture and inspect the final state; link evidence and note limitations.

### 3. Missing-page screen — `/daily/#/not-a-route`

- [x] Capture before screenshots at the applicable sizes.
- [x] Inspect spacing, alignment, type, controls and overflow; record findings.
- [x] Apply justified visual fixes, or record that no change is needed.
- [x] Capture and inspect the final state; link evidence and note limitations.

### 4. Phone drawer open and keyboard focus

- [x] Capture before screenshots at the applicable sizes.
- [x] Inspect spacing, alignment, type, controls and overflow; record findings.
- [x] Apply justified visual fixes, or record that no change is needed.
- [x] Capture and inspect the final state; link evidence and note limitations.

### 5. Collapsed desktop sidebar

- [x] Capture before screenshots at the applicable sizes.
- [x] Inspect spacing, alignment, type, controls and overflow; record findings.
- [x] Apply justified visual fixes, or record that no change is needed.
- [x] Capture and inspect the final state; link evidence and note limitations.

### 6. Connection diagnostics

- [x] Capture before screenshots at the applicable sizes.
- [x] Inspect spacing, alignment, type, controls and overflow; record findings.
- [x] Apply justified visual fixes, or record that no change is needed.
- [x] Capture and inspect the final state; link evidence and note limitations.

### 7. Unreadable-data recovery

- [x] Capture before screenshots at the applicable sizes.
- [x] Inspect spacing, alignment, type, controls and overflow; record findings.
- [x] Apply justified visual fixes, or record that no change is needed.
- [x] Capture and inspect the final state; link evidence and note limitations.

### 8. Daily backup preview and cancel

- [x] Capture before screenshots at the applicable sizes.
- [x] Inspect spacing, alignment, type, controls and overflow; record findings.
- [x] Apply justified visual fixes, or record that no change is needed.
- [x] Capture and inspect the final state; link evidence and note limitations.

### 9. Spanish hub and long labels

- [x] Capture before screenshots at the applicable sizes.
- [x] Inspect spacing, alignment, type, controls and overflow; record findings.
- [x] Apply justified visual fixes, or record that no change is needed.
- [x] Capture and inspect the final state; link evidence and note limitations.

## Completion

- [x] Recheck shared menu/header/footer against this app’s colors and fonts.
- [x] Record every reviewed section, unresolved issue and any major proposal.
- [x] Update progress before starting the next app.

Evidence: [routed before captures](before/manifest.json), [routed final captures](after/manifest.json), [additional states before](before/states.json), [additional states final](after/states.json). The open phone drawer and diagnostics are included in routed captures. Full-page hub screenshots include widget, quick-action and backup sections. No layout overhaul; recovery paragraph leading and standalone footer gutters also refined. All captures use synthetic data. Automated regression suites remain stopped.

## Approved follow-up: compact running activities

- [x] User approved one expandable Running row on iPhone.
- [x] Baseline full-list screenshots retained in `before/manifest.json`.
- [x] Record collapsed/expanded phone and full-list desktop acceptance without starting activities or saving domain data.
- [x] Implement the disclosure and preserve existing activity destinations.
- [x] Capture and inspect collapsed/expanded states at all three widths; update evidence.

Approved Running follow-up evidence: six `after/state-running-*.png` captures (collapsed/expanded × 390/320/1280) listed in `after/states.json`. Phone starts collapsed, expands to the same links; desktop always displays the full list. Existing General case records the DOM/storage invariants but remains unrun.
