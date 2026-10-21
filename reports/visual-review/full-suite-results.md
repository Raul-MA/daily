# Visual review regression verification

Completed locally on 2026-10-21 after the user resumed all tests.

| Suite | Unit | Browser |
| --- | ---: | ---: |
| General | 85 | 43 |
| Plants | 31 | 19 |
| Coffee | 20 | 34 |
| Games | 17 | 34 |
| Time Budget | 23 | 25 |
| Piano | 84 | 25 |
| Reading | 57 | 32 |
| WhatsApp | 12 | 9 |
| Total passing | 329 | 221 |

Both retained Piano broad UI/offline smoke scripts also pass. No cases were skipped, assertions weakened or timeouts increased.

The [initial full verification](full-verification-settings-locator-red.txt) ran every scope: all seven module suites passed, and General had 42 browser passes plus one obsolete Spanish settings-link locator failure. The locator changes from `Ajustes` to `Ajustes de Daily` to follow the approved menu/settings split. Every offline Home/settings reload, language persistence and diagnostics assertion remains intact. The [complete General rerun](../visual-review-general-final.txt) exits 0 with 85 unit / 43 browser passes. Application code did not change during verification. These transcripts establish the combined passing result; the first uninterrupted `npm run verify` retains its nonzero exit rather than being relabeled green.

Strict lint and the final 719-asset build pass in [static output](static-final.txt). The initial full transcript records the 843-file syntax pass; all seven nested screenshot helpers and the corrected offline test also pass explicit syntax checks. `git diff --check` passes.

The [sandbox failure](full-verification-sandbox.txt) records localhost binding denied with EPERM; the complete rerun used approved local server/browser permissions. This is separate from the settings locator failure. Physical iPhone, actual Things/WhatsApp handoffs, live API access and deployment remain deferred. The user subsequently authorized a local commit of the changes and verification evidence; no push or deployment is authorized.
