# reading visual review tasks

Scope agreed before section-by-section review: retain this app’s identity; iPhone first at 390×844, narrow check at 320×844, desktop at 1280×900. Fix spacing, alignment, typography and controls. Propose major layout changes before implementation. Synthetic fixtures only; automated test suites remain stopped.

Checklist inventoried from the shared route/sidebar catalogs and app-specific forms, disclosures and dialogs. Each task requires a screenshot of the actual view/state; a screenshot of the app landing page does not cover its other sections. Full-height captures include lower-page sections; galleries are only an inspection aid.

## Section checklist

### 1. Reader settings — `/daily/#/reading/settings`

- [x] Capture before screenshots at the applicable sizes.
- [x] Inspect spacing, alignment, type, controls and overflow; record findings.
- [x] Apply justified visual fixes, or record that no change is needed.
- [x] Capture and inspect the final state; link evidence and note limitations.

### 2. Reader picker — `/daily/#/reading/picker`

- [x] Capture before screenshots at the applicable sizes.
- [x] Inspect spacing, alignment, type, controls and overflow; record findings.
- [x] Apply justified visual fixes, or record that no change is needed.
- [x] Capture and inspect the final state; link evidence and note limitations.

### 3. Daily Review — `/daily/#/reading/review`

- [x] Capture before screenshots at the applicable sizes.
- [x] Inspect spacing, alignment, type, controls and overflow; record findings.
- [x] Apply justified visual fixes, or record that no change is needed.
- [x] Capture and inspect the final state; link evidence and note limitations.

### 4. Reader picker: saved results and remembered item

- [x] Capture before screenshots at the applicable sizes.
- [x] Inspect spacing, alignment, type, controls and overflow; record findings.
- [x] Apply justified visual fixes, or record that no change is needed.
- [x] Capture and inspect the final state; link evidence and note limitations.

### 5. Reader picker: empty results

- [x] Capture before screenshots at the applicable sizes.
- [x] Inspect spacing, alignment, type, controls and overflow; record findings.
- [x] Apply justified visual fixes, or record that no change is needed.
- [x] Capture and inspect the final state; link evidence and note limitations.

### 6. Reader picker: settings/token dialog

- [x] Capture before screenshots at the applicable sizes.
- [x] Inspect spacing, alignment, type, controls and overflow; record findings.
- [x] Apply justified visual fixes, or record that no change is needed.
- [x] Capture and inspect the final state; link evidence and note limitations.

### 7. Reader settings: all preference groups

- [x] Capture before screenshots at the applicable sizes.
- [x] Inspect spacing, alignment, type, controls and overflow; record findings.
- [x] Apply justified visual fixes, or record that no change is needed.
- [x] Capture and inspect the final state; link evidence and note limitations.

### 8. Daily Review: ordinary highlight and fixed action bar

- [x] Capture before screenshots at the applicable sizes.
- [x] Inspect spacing, alignment, type, controls and overflow; record findings.
- [x] Apply justified visual fixes, or record that no change is needed.
- [x] Capture and inspect the final state; link evidence and note limitations.

### 9. Daily Review: long highlight and progress

- [x] Capture before screenshots at the applicable sizes.
- [x] Inspect spacing, alignment, type, controls and overflow; record findings.
- [x] Apply justified visual fixes, or record that no change is needed.
- [x] Capture and inspect the final state; link evidence and note limitations.

### 10. Daily Review: no credentials and request-error fallback

- [x] Capture before screenshots at the applicable sizes.
- [x] Inspect spacing, alignment, type, controls and overflow; record findings.
- [x] Apply justified visual fixes, or record that no change is needed.
- [x] Capture and inspect the final state; link evidence and note limitations.

### 11. Reader: import preview and cancel

- [x] Capture before screenshots at the applicable sizes.
- [x] Inspect spacing, alignment, type, controls and overflow; record findings.
- [x] Apply justified visual fixes, or record that no change is needed.
- [x] Capture and inspect the final state; link evidence and note limitations.

### 12. Spanish settings and review controls

- [x] Capture before screenshots at the applicable sizes.
- [x] Inspect spacing, alignment, type, controls and overflow; record findings.
- [x] Apply justified visual fixes, or record that no change is needed.
- [x] Capture and inspect the final state; link evidence and note limitations.

## Completion

- [x] Recheck shared menu/header/footer against this app’s colors and fonts.
- [x] Record every reviewed section, unresolved issue and any major proposal.
- [x] Update progress before starting the next app.

Baseline: 63 route/state screenshots across all three widths, plus focused backup crops. Additional captures cover custom picker fields, dialog middle/lower sections, review progress/options, invalid import and a deliberately scrolled long-review viewport. Findings and scoped CSS repairs are recorded in [review log](../review.md). Final inspection is complete.

Completion: [routes](after/manifest.json) and [states](after/states.json) contain 63 before / 63 final captures, plus focused backup/feedback crops. Every inventoried section is inspected, with zero document overflow. Long-review and feedback viewports explicitly verify clearance above the fixed action bar. Feedback links use paired phone/four-column desktop alignment; review errors reuse the existing error color. Live APIs and physical devices remain unverified; suites stay paused.
