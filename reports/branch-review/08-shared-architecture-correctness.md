# Shared architecture and correctness review

Compared `main` (`1e1caae45edd6fe318dff5a997de8b108d0bb2d4`) with `review/08-cloud-sharing-proposal` (`859fd7b0f1365f90cbef22b0975f612580580e2c`). Read exact-head source from `/tmp/daily-branch-review-20261018` and the saved [scope inventory](scope.json). Application source was unchanged.

## Result and deduplication

No additional confirmed architecture/correctness finding beyond the existing Time Budget focus issue, TB-2. `sidebar-controls.js:50-52` chooses the first heading inside a selected panel even when that heading belongs to hidden setup content. That is the same reproduced defect already recorded in [Time Budget reproduction evidence](04-time-budget-reproduction.md), not an additional shared finding.

A possible standard-link interaction issue was sent to the UI specialist for assessment: `visitLink` prevents default on a same-hash link without checking Ctrl/Meta modifiers. It remains an unconfirmed interaction hypothesis in this report and is excluded from this reviewer's finding count.

## Runtime coverage

Reviewed all fourteen changed `apps/daily/src/` paths:

- `shell/app.js`, `render.js`, `catalog.js` and `dashboard.js`: router subscription, UI context retention, cleanup/restoration order, selected catalog destinations and navigation-only dashboard title links. Traced unchanged committed-state, activity-summary, module binding, draft and router dependencies where needed.
- New `shell/sidebar.js`, `sidebar-catalog.js`, `sidebar-controls.js`, `sidebar-icons.js`, `sidebar.css`: every catalog destination and alias, app/section separation, same-route navigation, target discovery, selected-panel dispatch, desktop collapse, mobile inert state, focus containment/dismissal, breakpoint changes and listener disposal. Opening/closing itself does not commit domain state or remount module forms.
- `shell/navigation.js`, new `footer.js`, `pwa.js`: retained installation/update host moves into the current footer slot on draw and falls back to body for recovery. Traced state/input/form-state redraws, registration listener lifetime, update gate, host removal and shell recovery replacement. Reparenting does not register another worker or recreate its subscriptions.
- `shell/style.css` and `diagnostics/style.css`: full-width/container changes, desktop sidebar offset, document scrolling, footer layout and retained responsive/dialog boundaries. Traced unchanged theme observation: it watches root replacement/module theme attributes, not recurring timer text updates.

Reviewed both changed package paths: shell EN/ES copy additions and the router's exported `paths` table. Router matching and URL construction logic are unchanged by that export.

## Tooling, tests and artifact evidence

- Read both changed scripts. Discovery retains required-count failures and updates Piano, Plants and General expected counts. The Piano contract script serializes the runtime schema and emits types/format/prompt documentation; it adds no runtime dependency, deployment step or automatic example import. Its generated material was already assessed in the Piano pass; no regeneration was needed.
- Read all six changed General browser-test/helper paths: `sidebar.spec.js`, `platform.spec.js`, `page-width.spec.js`, `width-checks.js`, `width-fixture.js`, `width-routes.js`. Traced fixture-created active/history/setup states, route enumeration, async Piano readiness, actual container-width/overflow measurements and retained storage invariants.
- The width audit derives routes from the exported router and Piano catalogs. It is a layout test, not a claim that every route's business behavior is exercised. `contentReady` checks shell/content readiness and absence of the failure screen, while domain acceptance remains in app suites.
- Read the changed migration-inventory and Piano source-map hunks, both new verification-summary JSON files and import-compatibility summary. Their historical counts differ by checkpoint; initial failures and later scoped reruns are disclosed rather than treated as clean initial runs.
- Proportionately checked all 54 changed report artifacts: loaded every text report for result/diagnostic summaries; parsed the changed structured summaries/source map and width audit; read Markdown evidence. A structural Node check found 87 enumerated routes, four widths, 360 result rows, 360 unique width/route/state combinations, measurements in every row, and zero recorded violations in `full-width-route-audit.json`. This validates artifact structure against its harness, not historical browser execution.
- Historical raw reports retain real failures, including dashboard/offline setup, initial sidebar Coffee/Time selectors, and the later Time-menu controller startup timeout. Documentation links those scoped reruns. Existing evidence is not substituted for the parent's current General/lint/syntax/build checks.

## Documentation and proposal scope

Read the changed root Compass, committed-head progress checkpoints, platform/deployment docs and cloud proposal. They distinguish review publication from deployment and explicitly keep physical-device/authenticated API/release gates deferred.

The Supabase document is planning only. Its proposed app-space boundary, document/activity atomicity, revision/idempotency flow, outbox/conflict handling, independently scoped memberships, recurring reminder/version/lease model, and JavaScript Edge compatibility gate are stated future requirements. No backend, Auth, scheduler or push implementation was introduced in this diff; absent future infrastructure is not reported as a present runtime defect. Current one-editing-tab and external-credential boundaries remain explicit.

## Verification limits

- This specialist used static inspection/dependency tracing and a read-only Node artifact check. No browser/build suite, live API, network action or personal backup inspection was run. Parent review owns current shared execution and screenshots.
- One optional summary attempt using a Node-spawned Git command failed with an environment `EPERM`; artifact inspection then used the already saved exact-path inventory and direct file reads. That setup failure is not a product finding.
- Device focus behavior beyond existing TB-2, physical iPhone lifecycle, real audio quality and production/cloud operation are not established by this pass. No new unmeasured performance concern is presented as a defect.
- Seven completed app reviews were not repeated. Shared files previously read as dependencies were reviewed here as their own scope.
