# Pages deployment repair

## Diagnosis and acceptance

On 2026-10-19, the public `/daily/` returned HTTP 200 with Jekyll-generated README HTML, not the app shell. Pages API reported `build_type: legacy`, source `main:/`, after merge `dcbec77`. The application entry point is generated in untracked `dist/` by `npm run build`; the repository root is not deployable app output.

The user authorized the Pages workflow, repository configuration change and deployment. Acceptance: build and fully verify the native app at `/daily/`, publish only `dist/`, confirm a successful Actions deployment, then load the public dashboard, module routes, manifest and service worker in a fresh browser context. Existing physical-device/API acceptance remains deferred.

## Verification before deployment

- Workflow YAML parses successfully; actionlint v1.7.12 exits 0. Official action tags were resolved through GitHub's API and pinned to commits. The existing `github-pages` environment allows `main`.
- Initial full local verification passed lint/syntax and reached General's existing browser assertions with two failures. `tests/e2e/page-width.spec.js:42` found 9px overflow at `/daily/#/settings` at 320px; `tests/e2e/storage-recovery.spec.js:44` found horizontal overflow during recovery at the same width. The width audit identified the backup form heading, buttons, label, file input and status extending to x=329. Initial transcript: `/tmp/daily-pages-verify.txt` (session-local).
- Corrective CSS bounds the backup form/label grid tracks with `minmax(0,1fr)` and permits the file input to shrink. Existing test assertions remain unchanged; no new tests or source-map adaptations are required.
- Full green verification and live deployment evidence are pending.
- The authorized Pages-source PUT returned HTTP 403 (`Resource not accessible by integration`); a follow-up GET still reports `legacy`. The user was asked to switch the source to GitHub Actions in repository settings. This is an integration permission restriction, not an automatic approval-review rejection.
