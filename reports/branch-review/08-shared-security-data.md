# Shared platform security and data safety review

## Scope and result

Compared `main` (`1e1caae45edd6fe318dff5a997de8b108d0bb2d4`) with `review/08-cloud-sharing-proposal` (`859fd7b0f1365f90cbef22b0975f612580580e2c`). Reviewed the exact committed-head archive at `/tmp/daily-branch-review-20261018`, with comparisons from `git -C /workspaces/daily`. This final scope contains 83 paths after the seven completed apps: 14 app-shell/diagnostics, two packages, two scripts, six shared E2E files, five root/docs files and 54 report artifacts. The exact inventory is [scope.json](scope.json).

No additional confirmed introduced security or data safety defect was found. The shared focus failure already recorded as TB-2 is the same `visitSection()`/inert-focus defect, not a new finding. Earlier Piano draft/import/resource findings remain valid and are not counted again here.

## Runtime and tooling coverage

Read complete changed code/diffs for all 14 app paths: `apps/daily/src/diagnostics/style.css` and shell `app.js`, `catalog.js`, `dashboard.js`, `footer.js`, `navigation.js`, `pwa.js`, `render.js`, `sidebar-catalog.js`, `sidebar-controls.js`, `sidebar-icons.js`, `sidebar.css`, `sidebar.js`, `style.css`.

Read both package changes (`packages/i18n/src/shell.js`, `packages/platform/src/router.js`) and both script changes (`scripts/discovery.mjs`, `scripts/piano-player-contract.mjs`). Necessary unchanged dependencies included shell `interactions.js`, `committed.js`, `elements.js`, shared draft capture/restore and the update gate. Earlier app reviews already established the relevant module draft/service boundaries; their entire code was not re-audited.

Checks and static evidence:

- App switcher, section, widget-title and footer labels use DOM `textContent` through `element()` or equivalent. The new SVG `innerHTML` sink uses only hardcoded path strings selected by static app/section names. No imported string becomes script/HTML, an external destination or a sidebar target selector.
- New sidebar/title links call the existing route builder with fixed allowlisted pages. The builder validates the base and encodes IDs/query values. Exporting the route table for test enumeration changes no route matching or encoding behavior.
- Sidebar open/close/resize and section focus/scroll update in-memory UI and DOM properties; they do not call module save, import or activity transition operations. Same-route clicks avoid remounting. Different-route disposal/remount remains the existing navigation policy. Dashboard title links use the shared static widget catalog and add no domain write.
- PWA `attachSystem()` moves the retained system host into the current footer or body fallback. Existing listeners/registration survive reparenting. Read the entire changed module: `blocked()` still checks all `[data-unsaved="true"]` nodes and activities before enabling or activating updates, and rechecks on click. Root rendering dispatches form-state after restoration; recovery failure dispatches it after replacing the root so the PWA host can reach its body fallback. No recovery/import authorization or credential cleanup is removed by this change.
- Mobile inert behavior makes the footer/PWA system unreachable while the drawer is modal, consistent with the rest of the page. It does not change dirty/activity state or the worker's activation gate. The known target-focus defect is TB-2, not a security bypass.
- Changed CSS imports only the local sidebar stylesheet; no external resource URL or sensitive content is introduced. Width/background changes do not alter hidden controls, validation or storage.
- Discovery increases expected counts rather than bypassing missing-test failures. The contract generator writes four fixed documentation paths from the runtime schema and static conventions; no user-controlled file path, shell execution, credential access or network request exists. Schema/prompt equivalence was already independently checked during Piano review; this pass reviewed the generator itself without regenerating source files.

## Test and artifact coverage

Read all six shared E2E changes: `page-width.spec.js`, `platform.spec.js`, `sidebar.spec.js`, `width-checks.js`, `width-fixture.js`, `width-routes.js`. Fixtures derive from synthetic test data, write isolated browser storage and abort Readwise API calls for width testing. No personal backup or token is loaded. Existing platform storage-equality assertions remain after title-link navigation; sidebar checks assert unchanged storage/drafts. Test adequacy and source-assertion preservation are separately reviewed by the UI/testing specialist; reading these assertions does not certify untested combinations.

Enumerated and programmatically read every one of the 54 changed `reports/` artifacts from the archive. Checked file sizes/line counts and searched for recognizable private keys, GitHub token literals, JWTs and long literal Bearer/Readwise Authorization credentials; no match was found. This targeted scan is not a guarantee that arbitrary sensitive prose cannot exist. Directly read the personal-import compatibility summary and supplied-selection record: they contain file names, dates, aggregate counts and test outcomes, not the supplied backup payloads. No personal input files were opened.

Parsed all changed JSON artifacts. Structurally inspected `full-width-route-audit.json`: 87 routes, four widths, 360 result entries, zero recorded violations. Reviewed the producing test and its output fields: route names and geometry, not account/record content. Read both verification summaries and the source-map delta; native authored player files are explicitly identified separately from legacy provenance, rather than claiming copied-source hashes for authored code. Reviewed migration inventory additions and raw log pass/failure/count signals across all text artifacts. Initial red/transient failures remain present, including the General update timeout with the separately recorded retry. Historical report counts describe successive checkpoints, not a single identical source snapshot.

No report was treated as independently rerun evidence or cryptographically authenticated provenance. Parent owns the new General/lint/syntax/build results. The large generated geometry audit was checked structurally and against its producer, not represented as line-by-line handwritten logic.

## Documentation and cloud proposal

Read committed root `COMPASS.md`, `docs/deployment.md`, `docs/platform.md`, the changed committed `docs/progress.md` checkpoint material and the full `docs/supabase-sharing-push-plan.md`. These are the remaining five documentation paths. Existing required root instructions, progress and authoritative consolidation plan were read before app work; this pass uses archive/Git versions rather than dirty working-tree progress content.

The cloud document is explicitly a proposal and adds no runtime dependency, account, migration, upload or permission. Its security contracts include independent per-app spaces, database membership enforcement/grants, trusted validation paths, atomic revision/idempotency operations, local/cloud separation, account-scoped caches/outbox, recovery on conflicts/revocation, secret-free exports/logs, invitation identity/expiry/rate limits, push endpoint validation, scheduler authentication, recipient opt-in and generic notification content. Those are future implementation requirements, not evidence that a hosted system is secure. Stage 0, JavaScript Edge compatibility, database deny-path tests, physical delivery and remote acceptance remain deferred. No unimplemented proposal measure is classified as an introduced runtime vulnerability.

## Limits and next step

This specialist performed source tracing, targeted artifact scanning and structural JSON/provenance inspection. No new browser, build, network/API, live-account or personal-data action was performed in this shared pass. Existing worker multi-tab activation, storage durability and all unchanged authentication/cache internals were not independently stress-tested. The parent runs General and final local checks, consolidates all specialties and deduplicates the existing nine findings. Application code remains unchanged.
