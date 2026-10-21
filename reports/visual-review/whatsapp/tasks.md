# whatsapp visual review tasks

Scope agreed before section-by-section review: retain this app’s identity; iPhone first at 390×844, narrow check at 320×844, desktop at 1280×900. Fix spacing, alignment, typography and controls. Propose major layout changes before implementation. Synthetic fixtures only; automated test suites remain stopped.

Checklist inventoried from the shared route/sidebar catalogs and app-specific forms, disclosures and dialogs. Each task requires a screenshot of the actual view/state; a screenshot of the app landing page does not cover its other sections. Full-height captures include lower-page sections; galleries are only an inspection aid.

## Section checklist

### 1. WhatsApp settings — `/daily/#/whatsapp/settings`

- [x] Capture before screenshots at the applicable sizes.
- [x] Inspect spacing, alignment, type, controls and overflow; record findings.
- [x] Apply justified visual fixes, or record that no change is needed.
- [x] Capture and inspect the final state; link evidence and note limitations.

### 2. Compose WhatsApp reminder — `/daily/#/whatsapp`

- [x] Capture before screenshots at the applicable sizes.
- [x] Inspect spacing, alignment, type, controls and overflow; record findings.
- [x] Apply justified visual fixes, or record that no change is needed.
- [x] Capture and inspect the final state; link evidence and note limitations.

### 3. Compose: empty form

- [x] Capture before screenshots at the applicable sizes.
- [x] Inspect spacing, alignment, type, controls and overflow; record findings.
- [x] Apply justified visual fixes, or record that no change is needed.
- [x] Capture and inspect the final state; link evidence and note limitations.

### 4. Compose: populated valid reminder

- [x] Capture before screenshots at the applicable sizes.
- [x] Inspect spacing, alignment, type, controls and overflow; record findings.
- [x] Apply justified visual fixes, or record that no change is needed.
- [x] Capture and inspect the final state; link evidence and note limitations.

### 5. Compose: expired-time validation

- [x] Capture before screenshots at the applicable sizes.
- [x] Inspect spacing, alignment, type, controls and overflow; record findings.
- [x] Apply justified visual fixes, or record that no change is needed.
- [x] Capture and inspect the final state; link evidence and note limitations.

### 6. Compose: manual-copy fallback

- [x] Capture before screenshots at the applicable sizes.
- [x] Inspect spacing, alignment, type, controls and overflow; record findings.
- [x] Apply justified visual fixes, or record that no change is needed.
- [x] Capture and inspect the final state; link evidence and note limitations.

### 7. Settings: draft backup/export

- [x] Capture before screenshots at the applicable sizes.
- [x] Inspect spacing, alignment, type, controls and overflow; record findings.
- [x] Apply justified visual fixes, or record that no change is needed.
- [x] Capture and inspect the final state; link evidence and note limitations.

### 8. Settings: import preview and recovery controls

- [x] Capture before screenshots at the applicable sizes.
- [x] Inspect spacing, alignment, type, controls and overflow; record findings.
- [x] Apply justified visual fixes, or record that no change is needed.
- [x] Capture and inspect the final state; link evidence and note limitations.

### 9. Spanish composer/settings and long recipient/message

- [x] Capture before screenshots at the applicable sizes.
- [x] Inspect spacing, alignment, type, controls and overflow; record findings.
- [x] Apply justified visual fixes, or record that no change is needed.
- [x] Capture and inspect the final state; link evidence and note limitations.

## Completion

- [x] Recheck shared menu/header/footer against this app’s colors and fonts.
- [x] Record every reviewed section, unresolved issue and any major proposal.
- [x] Update progress before starting the next app.

Completion: [route captures](after/manifest.json) and [state captures](after/states.json) contain 36 before / 36 final screenshots across 390, 320 and 1280px. All nine sections are inspected, including expired-time validation, manual copy, import preview/recovery, invalid import, Spanish long text and dark composer/settings. Scoped CSS aligns gutters and backup controls, improves recovery text spacing and stacks date/time only below 360px to prevent clipped native fields. No document overflow. Synthetic clipboard denial exposes the real manual fallback; no Things navigation or actual message is triggered. Native file-picker chrome and physical iPhone handoffs remain unverified; automated suites remain stopped.
