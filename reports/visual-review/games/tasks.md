# games visual review tasks

Scope agreed before section-by-section review: retain this app’s identity; iPhone first at 390×844, narrow check at 320×844, desktop at 1280×900. Fix spacing, alignment, typography and controls. Propose major layout changes before implementation. Synthetic fixtures only; automated test suites remain stopped.

Checklist inventoried from the shared route/sidebar catalogs and app-specific forms, disclosures and dialogs. Each task requires a screenshot of the actual view/state; a screenshot of the app landing page does not cover its other sections. Full-height captures include lower-page sections; galleries are only an inspection aid.

## Section checklist

### 1. Play — `/daily/#/games`

- [x] Capture before screenshots at the applicable sizes.
- [x] Inspect spacing, alignment, type, controls and overflow; record findings.
- [x] Apply justified visual fixes, or record that no change is needed.
- [x] Capture and inspect the final state; link evidence and note limitations.

### 2. Start new game — `/daily/#/games/new`

- [x] Capture before screenshots at the applicable sizes.
- [x] Inspect spacing, alignment, type, controls and overflow; record findings.
- [x] Apply justified visual fixes, or record that no change is needed.
- [x] Capture and inspect the final state; link evidence and note limitations.

### 3. Active game details — `/daily/#/games/session/:id`

- [x] Capture before screenshots at the applicable sizes.
- [x] Inspect spacing, alignment, type, controls and overflow; record findings.
- [x] Apply justified visual fixes, or record that no change is needed.
- [x] Capture and inspect the final state; link evidence and note limitations.

### 4. Current session — `/daily/#/games/session`

- [x] Capture before screenshots at the applicable sizes.
- [x] Inspect spacing, alignment, type, controls and overflow; record findings.
- [x] Apply justified visual fixes, or record that no change is needed.
- [x] Capture and inspect the final state; link evidence and note limitations.

### 5. Game history — `/daily/#/games/history`

- [x] Capture before screenshots at the applicable sizes.
- [x] Inspect spacing, alignment, type, controls and overflow; record findings.
- [x] Apply justified visual fixes, or record that no change is needed.
- [x] Capture and inspect the final state; link evidence and note limitations.

### 6. Historical game details — `/daily/#/games/history/:id`

- [x] Capture before screenshots at the applicable sizes.
- [x] Inspect spacing, alignment, type, controls and overflow; record findings.
- [x] Apply justified visual fixes, or record that no change is needed.
- [x] Capture and inspect the final state; link evidence and note limitations.

### 7. Game catalog — `/daily/#/games/catalog`

- [x] Capture before screenshots at the applicable sizes.
- [x] Inspect spacing, alignment, type, controls and overflow; record findings.
- [x] Apply justified visual fixes, or record that no change is needed.
- [x] Capture and inspect the final state; link evidence and note limitations.

### 8. Players — `/daily/#/games/players`

- [x] Capture before screenshots at the applicable sizes.
- [x] Inspect spacing, alignment, type, controls and overflow; record findings.
- [x] Apply justified visual fixes, or record that no change is needed.
- [x] Capture and inspect the final state; link evidence and note limitations.

### 9. Statistics — `/daily/#/games/stats`

- [x] Capture before screenshots at the applicable sizes.
- [x] Inspect spacing, alignment, type, controls and overflow; record findings.
- [x] Apply justified visual fixes, or record that no change is needed.
- [x] Capture and inspect the final state; link evidence and note limitations.

### 10. Game settings — `/daily/#/games/settings`

- [x] Capture before screenshots at the applicable sizes.
- [x] Inspect spacing, alignment, type, controls and overflow; record findings.
- [x] Apply justified visual fixes, or record that no change is needed.
- [x] Capture and inspect the final state; link evidence and note limitations.

### 11. Play: empty collection

- [x] Capture before screenshots at the applicable sizes.
- [x] Inspect spacing, alignment, type, controls and overflow; record findings.
- [x] Apply justified visual fixes, or record that no change is needed.
- [x] Capture and inspect the final state; link evidence and note limitations.

### 12. New game: game/player selector and active-session notice

- [x] Capture before screenshots at the applicable sizes.
- [x] Inspect spacing, alignment, type, controls and overflow; record findings.
- [x] Apply justified visual fixes, or record that no change is needed.
- [x] Capture and inspect the final state; link evidence and note limitations.

### 13. Session: expanded round scoring

- [x] Capture before screenshots at the applicable sizes.
- [x] Inspect spacing, alignment, type, controls and overflow; record findings.
- [x] Apply justified visual fixes, or record that no change is needed.
- [x] Capture and inspect the final state; link evidence and note limitations.

### 14. Session: completion confirmation (cancel)

- [x] Capture before screenshots at the applicable sizes.
- [x] Inspect spacing, alignment, type, controls and overflow; record findings.
- [x] Apply justified visual fixes, or record that no change is needed.
- [x] Capture and inspect the final state; link evidence and note limitations.

### 15. Games: add and edit game

- [x] Capture before screenshots at the applicable sizes.
- [x] Inspect spacing, alignment, type, controls and overflow; record findings.
- [x] Apply justified visual fixes, or record that no change is needed.
- [x] Capture and inspect the final state; link evidence and note limitations.

### 16. Players: add and edit player

- [x] Capture before screenshots at the applicable sizes.
- [x] Inspect spacing, alignment, type, controls and overflow; record findings.
- [x] Apply justified visual fixes, or record that no change is needed.
- [x] Capture and inspect the final state; link evidence and note limitations.

### 17. History: filters and empty results

- [x] Capture before screenshots at the applicable sizes.
- [x] Inspect spacing, alignment, type, controls and overflow; record findings.
- [x] Apply justified visual fixes, or record that no change is needed.
- [x] Capture and inspect the final state; link evidence and note limitations.

### 18. Settings: import preview (cancel)

- [x] Capture before screenshots at the applicable sizes.
- [x] Inspect spacing, alignment, type, controls and overflow; record findings.
- [x] Apply justified visual fixes, or record that no change is needed.
- [x] Capture and inspect the final state; link evidence and note limitations.

### 19. Spanish settings and long game/player names

- [x] Capture before screenshots at the applicable sizes.
- [x] Inspect spacing, alignment, type, controls and overflow; record findings.
- [x] Apply justified visual fixes, or record that no change is needed.
- [x] Capture and inspect the final state; link evidence and note limitations.

## Completion

- [x] Recheck shared menu/header/footer against this app’s colors and fonts.
- [x] Record every reviewed section, unresolved issue and any major proposal.
- [x] Update progress before starting the next app.

Findings: persistent backup notification obscures every title/session Finish button; statistics sections touch; compact facts form an uneven 3+1 phone grid; round Remove is below 44px; import dialog uses an unthemed native border and adjoining actions; page gutters vary from the shared shell. CSS refinement preserves ledger cards, scoring inputs, system type and the existing palette. Backup reminders now participate in page flow; temporary notifications stay fixed/dismissible and clear the header/menu. The native Finish confirmation is dismissed during capture: page screenshots cannot include browser-owned dialog chrome, so its exact text is recorded in `nativeDialog` capture metadata; no replacement dialog was invented. Final capture manifests: [routes](after/manifest.json) and [section states](after/states.json), 66 before / 66 final screenshots. All listed sections inspected, with the native-dialog limitation above. The 320px session grid was also constrained so Finish retains the page gutter.

Statistics refinements also let desktop cards fill available columns and align the six game facts in three columns; phone cards stay stacked. Settings keeps its existing inline backup warning and suppresses the duplicate backup banner, retaining its direct Export action.

Final historical-session check also corrected a full-width action group that could squeeze the title away. Header actions now wrap when needed; all 30 routed final captures report zero document overflow.
