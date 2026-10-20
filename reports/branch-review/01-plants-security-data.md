# Plants security and data safety review

## Scope and result

Compared `main` (`1e1caae45edd6fe318dff5a997de8b108d0bb2d4`) to `review/08-cloud-sharing-proposal` (`859fd7b0f1365f90cbef22b0975f612580580e2c`). Source was read from `/tmp/daily-branch-review-20261018`; diff metadata came from `/workspaces/daily`. No source was edited.

No confirmed introduced security or data safety defect was found in the changed Plants code. This is a scoped review, not a claim that the entire Plants implementation is free of defects. Relative to this main commit, Plants has eight changed files and 83 added / 18 removed lines; most module implementation already exists on main.

## Checks and evidence

- Read all eight changed paths: `COMPASS.md`, `docs/behavior.md`, `e2e/import-selection.spec.js`, `e2e/plants.spec.js`, `src/style.css`, `src/ui/backup.js`, `src/ui/list.js`, and `src/ui/view.js` under `modules/plants/`.
- Examined automatic import preview for accidental replacement, asynchronous stale reads and detached forms. `previewFile()` checks both the form connection and a per-form WeakMap request identity after `file.text()`. A later selection replaces that identity, including a selection with no file. Parsing happens only after those checks.
- Followed preview into unchanged `modules/plants/src/service.js`: preview builds a candidate without saving; apply rejects changed module state using the serialized expected snapshot and validates the candidate before saving. Explicit confirmation and recovery-download gating remain in the existing dialog.
- Followed changed error rendering into unchanged `src/ui/elements.js`: errors and preview counts use `textContent`; selection does not introduce HTML interpretation or a user-controlled navigation destination. Recovery download uses a locally constructed Blob URL.
- Read unchanged `src/store/validation.js` and `packages/data/src/module-store.js` for nested validation, duplicate IDs and save validation. Read unchanged `packages/ui/src/drafts.js` and Plants settings for context on form IDs and file restoration. These dependency reads establish the behavior reached by the changed import UI, rather than a separate whole-module audit.
- Layout/list/navigation edits introduce no new storage or external request operations. No secrets, authentication headers, remote endpoint, dynamic script, HTML sink or user-supplied URL handling was added in the changed Plants paths.
- Parent reviewer reports the exact snapshot's Plants suite passed 28 unit and 14 browser cases. This specialist did not independently run those suites or a browser exploit test.

## Limits and non-findings

No unresolved hypothesis met the threshold for a finding. Existing import-dialog recovery gating and module persistence were inspected only as dependencies; unchanged behavior is not presented as an introduced regression. This pass does not certify unmodified Things handoffs, legacy adapters, shared shell/storage internals or physical-device behavior. Other specialists own correctness, architecture, accessibility/UI and test adequacy.

The initial inventory command used the unpacked snapshot as a Git directory and failed; it was corrected to use `git -C /workspaces/daily`. `rg` is unavailable, so inventory used `find` and direct reads. Neither limitation prevented inspection of the complete changed Plants diff.
