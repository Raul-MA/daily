# plants visual review tasks

Scope agreed before section-by-section review: retain this app’s identity; iPhone first at 390×844, narrow check at 320×844, desktop at 1280×900. Fix spacing, alignment, typography and controls. Propose major layout changes before implementation. Synthetic fixtures only; automated test suites remain stopped.

Checklist inventoried from the shared route/sidebar catalogs and app-specific forms, disclosures and dialogs. Each task requires a screenshot of the actual view/state; a screenshot of the app landing page does not cover its other sections. Full-height captures include lower-page sections; galleries are only an inspection aid.

## Section checklist

### 1. My plants — `/daily/#/plants`

- [x] Capture before screenshots at the applicable sizes.
- [x] Inspect spacing, alignment, type, controls and overflow; record findings.
- [x] Apply justified visual fixes, or record that no change is needed.
- [x] Capture and inspect the final state; link evidence and note limitations.

### 2. Add new plant — `/daily/#/plants/new`

- [x] Capture before screenshots at the applicable sizes.
- [x] Inspect spacing, alignment, type, controls and overflow; record findings.
- [x] Apply justified visual fixes, or record that no change is needed.
- [x] Capture and inspect the final state; link evidence and note limitations.

### 3. Plant settings — `/daily/#/plants/settings`

- [x] Capture before screenshots at the applicable sizes.
- [x] Inspect spacing, alignment, type, controls and overflow; record findings.
- [x] Apply justified visual fixes, or record that no change is needed.
- [x] Capture and inspect the final state; link evidence and note limitations.

### 4. Edit plant — `/daily/#/plants/plant-one/edit`

- [x] Capture before screenshots at the applicable sizes.
- [x] Inspect spacing, alignment, type, controls and overflow; record findings.
- [x] Apply justified visual fixes, or record that no change is needed.
- [x] Capture and inspect the final state; link evidence and note limitations.

### 5. Plant details — `/daily/#/plants/plant-one`

- [x] Capture before screenshots at the applicable sizes.
- [x] Inspect spacing, alignment, type, controls and overflow; record findings.
- [x] Apply justified visual fixes, or record that no change is needed.
- [x] Capture and inspect the final state; link evidence and note limitations.

### 6. My plants: empty collection

- [x] Capture before screenshots at the applicable sizes.
- [x] Inspect spacing, alignment, type, controls and overflow; record findings.
- [x] Apply justified visual fixes, or record that no change is needed.
- [x] Capture and inspect the final state; link evidence and note limitations.

### 7. Plant details: expanded watering log form

- [x] Capture before screenshots at the applicable sizes.
- [x] Inspect spacing, alignment, type, controls and overflow; record findings.
- [x] Apply justified visual fixes, or record that no change is needed.
- [x] Capture and inspect the final state; link evidence and note limitations.

### 8. Plant details: reschedule and skip forms

- [x] Capture before screenshots at the applicable sizes.
- [x] Inspect spacing, alignment, type, controls and overflow; record findings.
- [x] Apply justified visual fixes, or record that no change is needed.
- [x] Capture and inspect the final state; link evidence and note limitations.

### 9. Plant details: observations and history edit

- [x] Capture before screenshots at the applicable sizes.
- [x] Inspect spacing, alignment, type, controls and overflow; record findings.
- [x] Apply justified visual fixes, or record that no change is needed.
- [x] Capture and inspect the final state; link evidence and note limitations.

### 10. Plant details: expanded care guide

- [x] Capture before screenshots at the applicable sizes.
- [x] Inspect spacing, alignment, type, controls and overflow; record findings.
- [x] Apply justified visual fixes, or record that no change is needed.
- [x] Capture and inspect the final state; link evidence and note limitations.

### 11. Plant details: delete confirmation (cancel)

- [x] Capture before screenshots at the applicable sizes.
- [x] Inspect spacing, alignment, type, controls and overflow; record findings.
- [x] Apply justified visual fixes, or record that no change is needed.
- [x] Capture and inspect the final state; link evidence and note limitations.

### 12. Add plant: selected template and populated care schedule

- [x] Capture before screenshots at the applicable sizes.
- [x] Inspect spacing, alignment, type, controls and overflow; record findings.
- [x] Apply justified visual fixes, or record that no change is needed.
- [x] Capture and inspect the final state; link evidence and note limitations.

### 13. Plant settings: import preview (cancel)

- [x] Capture before screenshots at the applicable sizes.
- [x] Inspect spacing, alignment, type, controls and overflow; record findings.
- [x] Apply justified visual fixes, or record that no change is needed.
- [x] Capture and inspect the final state; link evidence and note limitations.

### 14. Plant settings: invalid file feedback

- [x] Capture before screenshots at the applicable sizes.
- [x] Inspect spacing, alignment, type, controls and overflow; record findings.
- [x] Apply justified visual fixes, or record that no change is needed.
- [x] Capture and inspect the final state; link evidence and note limitations.

### 15. Plant settings: refresh-template confirmation (cancel)

- [x] Capture before screenshots at the applicable sizes.
- [x] Inspect spacing, alignment, type, controls and overflow; record findings.
- [x] Apply justified visual fixes, or record that no change is needed.
- [x] Capture and inspect the final state; link evidence and note limitations.

### 16. Spanish settings and long plant name

- [x] Capture before screenshots at the applicable sizes.
- [x] Inspect spacing, alignment, type, controls and overflow; record findings.
- [x] Apply justified visual fixes, or record that no change is needed.
- [x] Capture and inspect the final state; link evidence and note limitations.

## Completion

- [x] Recheck shared menu/header/footer against this app’s colors and fonts.
- [x] Record every reviewed section, unresolved issue and any major proposal.
- [x] Update progress before starting the next app.

Findings: 38px form fields, tiny difficulty buttons in a native fieldset outline, crowded care/save buttons, weak Things/backup section separation, top-left modal placement, clipped narrow history actions and overly long guide lines on desktop. CSS repairs preserve botanical colors, serif hierarchy, the borderless four-column history table and existing actions. Sources: routed `before/manifest.json` and extra `before/states.json`; final captures pending.

Final evidence: [routed before](before/manifest.json), [routed final](after/manifest.json), [section/state before](before/states.json), [section/state final](after/states.json). 54 before and 54 final captures cover the five routes plus care, empty, guide, template, dialog, error, translated and long-name states. All three widths have zero document overflow. The borderless history remains a four-column table with wrapping actions; inline editing fills the table width. Shared header/gutters align; no domain behavior changed. Automated suites remain stopped.

Final Spanish inspection exposed an awkward split in the narrow Actions heading/date. Narrow column proportions now reserve 35% for action labels and keep dates on one line; the translated long-name/history screenshots were recaptured and inspected. Dates and action labels now fit without awkward letter splits.
