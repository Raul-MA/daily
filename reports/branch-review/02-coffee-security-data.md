# Coffee security and data safety review

## Scope and result

Compared `main` (`1e1caae45edd6fe318dff5a997de8b108d0bb2d4`) with `review/08-cloud-sharing-proposal` (`859fd7b0f1365f90cbef22b0975f612580580e2c`), reading the exact source snapshot at `/tmp/daily-branch-review-20261018`. No source edits or network requests were made.

No confirmed introduced security or data safety defect was found. The Coffee diff is seven files, 14 added / 38 removed lines. Most Coffee domain logic is already on main; this report covers the changed navigation/layout integration and the affected import/preferences callbacks.

## Coverage and evidence

Read the complete diff and resulting changed source for:

- `src/frontend/app/import-preview.js`, `navigation.js`, `settings.js`: removal of module-tab rendering after import/preferences changes and from route rendering.
- `src/view.js`: removal of the tabs node/context reference, with existing form dirty tracking and setup/render lifecycle retained.
- `src/style.css`: removal of the page width cap.
- `e2e/history-detail.spec.js`, `e2e/offline.spec.js`: mobile drawer access and replacement sidebar-label assertions.

Read module AGENTS/Compass and these necessary dependencies: `src/frontend/app/context.js`, `notifications.js`, `src/service.js`, `src/imports.js`, the Coffee entries in `apps/daily/src/shell/sidebar-catalog.js`, and the shared router declarations. The shared module-store and draft implementation were already read in the preceding Plants gate.

Checks performed:

- Removed `renderTabs()` only creates localized static navigation buttons and their route listeners; it performs no persistence, validation, transaction or authorization work. Its removal from post-import/preferences callbacks does not bypass those guards.
- Import application still calls `coffee.service.applyImport()` before rerendering. The existing import service requires an issued preview, checks the serialized current root against the preview snapshot, validates references/payload, preserves shared language and saves through the shared state boundary. Recovery export/explicit confirmation is unchanged.
- The changed mount markup remains a fixed string. No newly interpolated user content, executable HTML sink, remote endpoint, credential access or URL construction was added.
- Existing preview summary and toast/error rendering use `textContent`. Recovery downloads use local Blob URLs. Those behaviors are unchanged and were checked as call-path context.
- Sidebar destinations are fixed Coffee routes; the New destination explicitly aliases the root Coffee route. No changed navigation line writes domain data.
- Existing module dirty listeners and disposal remain present after removing the module navigation container.

## Limits and non-findings

No unresolved candidate was identified. No independent browser suite or security exploit harness was run by this specialist; the parent runs the Coffee regression suite and other specialists examine UI, architecture, correctness and tests. This review does not certify unmodified import file-read concurrency, all historical HTML rendering, shared cross-tab storage serialization, legacy adapters or physical-device behavior. Potential defects in unchanged paths are not counted as introduced findings merely because those dependencies were read.
