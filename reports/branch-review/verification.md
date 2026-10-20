# Independent branch review verification

Completed 2026-10-19 against `main` `1e1caae45edd6fe318dff5a997de8b108d0bb2d4` → review head `859fd7b0f1365f90cbef22b0975f612580580e2c`. [Machine-readable results](verification.json) and [path-by-path coverage](coverage.json) accompany this report.

## Suite results

The seven app suites ran sequentially on 2026-10-18; General and final checks ran on 2026-10-19 after the requested pause. Both runs used an archive of the same pinned head, excluding uncommitted changes and personal files. The temporary archive was recreated after the pause. All 109 changed non-report files in the final archive were checked against their Git blob hashes; no mismatch was found.

| Scope | Unit passed | Native browser passed | Raw evidence |
| --- | ---: | ---: | --- |
| Plants | 28 | 14 | [suite](01-plants-tests.txt) |
| Coffee | 20 | 34 | [suite](02-coffee-tests.txt) |
| Games | 17 | 34 | [suite](03-games-tests.txt) |
| Time Budget | 23 | 23 | [suite](04-time-budget-tests.txt) |
| Piano | 78 | 19 | [suite and broad scripts](05-piano-tests.txt) |
| Reading | 57 | 31 | [suite](06-reading-tests.txt) |
| WhatsApp | 12 | 9 | [suite](07-whatsapp-tests.txt) |
| General | 85 | 37 | [suite](08-general-tests.txt) |
| **Total** | **320** | **201** | Every listed suite exited 0 |

Piano's two retained broad scripts also passed: 45 library destinations; all ten guided lessons; ordinary/guided keyboard behavior; touch checks at 320/360/390px; audio cleanup; generated-worker offline reload. General includes backup/recovery, routing/dashboard, sidebar, update/offline cases and the independently regenerated route-width matrix: 87 routes plus two setup states and diagnostics across four widths, 360 checks, zero geometry violations. [Current width summary](08-width-audit-summary.json) records its raw temporary audit hash and retention limits.

## Other checks

| Command | Result | Evidence |
| --- | --- | --- |
| `npm run lint` | Exit 0, strict policy, no warnings | [log](08-lint.txt) |
| `npm run check:js` | Exit 0, 824 JavaScript files | [log](08-syntax.txt) |
| `npm run build` | Exit 0, 708 owned assets at `/daily/` | [log](08-build.txt) |

These component commands and all scoped suites cover the existing verification gates at this head; `npm run verify` was not redundantly invoked as one wrapper command. Final report-link and patch-whitespace checks were also performed. No application code, tests, dependency manifests or policies were changed to obtain these results.

## Finding verification and limits

The passing existing suite does not exercise every required interaction. [Twelve deduplicated findings](findings.md) remain: nine P2 and three P3. Three specialists reviewed all scopes; the parent checked source references and independently reproduced concrete issues using Chromium, real transport functions with controlled audio time, and a bounded worker for pathological subdivision expansion. [Time Budget](04-time-budget-reproduction.md), [Piano](05-piano-reproduction.md) and [shared](08-shared-reproduction.md) retain steps and observed values. Browser/worker timing and static implications are identified separately.

Source review covers all changed runtime/test/documentation paths and necessary dependencies. The 54 report artifacts were reviewed for structure, provenance, outcomes and sensitive-data patterns, with large generated JSON checked structurally against its producer. This is not a claim that every unchanged implementation line was audited or every report line manually read. The cloud document is a proposal; no cloud service was implemented or tested.

The first Coffee attempt hit a review-probe server port conflict before browser assertions ran; the unchanged full rerun passed. The redundant setup-only transcript was removed during the 2026-10-20 cleanup. Optional probe setup failures are recorded in their reproduction/specialty reports and were not counted as application defects. Sandbox socket denial required an approved local browser probe outside the sandbox. No failing product assertion was skipped, weakened or hidden.

Physical iPhone behavior, screen-reader acceptance, live authenticated Readwise/Reader calls, actual Things/WhatsApp handoffs, hosting/deployment, worker coexistence with installed legacy apps and future cloud/push delivery remain outside this local review. No credentials, personal backups or authenticated responses were accessed or added to these reports.
