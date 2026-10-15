# Implementation progress

Updated: 2026-10-15. Local repo: `/workspaces/daily`, branch `main`.

## Current instruction and next step

The user explicitly requested **local work only, no workflows**, then clarified **HTML/CSS/JavaScript only**. Verify the plain-JavaScript replacement against the same tests before removing Vite/TypeScript. GitHub Actions deployment was removed locally. Do not push, configure Pages, deploy or add workflows until explicitly requested. No remote changes were made for this instruction.

Stage 1 is complete. Stage 2 local preparation is complete; live API checks and installed-device coexistence are deferred, not claimed passing. **Stage 3 platform implementation is in progress locally**, tests first and one module at a time. Routing, preference persistence and shell/dashboard acceptance tests have been added before implementation. Do not ask the user to finish a hosted Readwise check before continuing.

Keep Readwise and Reader API requests wired to the documented endpoints. The user will enter a token later and observe success or failure. Preserve honest loading/error states and the Daily Review link fallback. Unknown per-card scheduling APIs must not be invented.

## Completed and user-confirmed

- Initialized this repo and copied all 25 discovered source test/helper files before application code. Source commits, hashes, assertion counts and migrated destinations are in `reports/migration-test-inventory.md` and `reports/source-tests.json`.
- Strict shared ESLint, TypeScript, Vite, scoped sequential runners and discovery guards are installed. No skipped tests or relaxed lint thresholds.
- Original baselines pass: plants 7, coffee browser 21, games browser 24, piano unit 41, piano full browser/offline, WhatsApp 3 groups. New-app feature suites remain red because migration is unfinished.
- User confirms all existing apps export and restore successfully, most backups have fewer than 50 entries, and backup size is approximately 20 KB. No personal backup files were requested or copied. Existing export/restore checks do not need repeating.
- User confirms existing Time Budget survives lock/background/closing and reopening with correct timing. Reader works on the iPhone. Daily Review is new and has no prior live verification.
- Local EN/ES diagnostic at `/daily/diagnostics.html`: explicit submission, memory-only token, three sequential real GET endpoints, status-only results, timeout/error handling, no response-content persistence, origin label and direct Daily Review link.
- Version-1 document-store prototype validates serialized data, preserves prior/recovery/corrupt copies and rejects future root versions. Twelve tests pass, including failed writes, Unicode and synthetic data exceeding 140 KB. Combined import UI, domain schemas/reference validation and cross-tab policy remain future work.
- Five legacy cache-cleanup patches are prepared with source SHA checks; all pass ownership tests and `git apply --check`. The original repos and installed workers are unchanged. Release/coexistence checks are deferred until remote work and installation resume.
- Coffee's unrelated documentation, personal backup and Excel additions remain untouched and excluded.

## Platform checkpoint before removing Vite

- Implemented hash routing, accessible shell, responsive navigation-only dashboard, EN/ES, widget order/visibility and quick-action settings.
- Shared module store validates payloads, preserves unrelated data and emits only after successful commits.
- Timestamp activities survive reload, support explicit pause/resume/completion, independent countdowns and singleton budget/game/piano rules. Dashboard and shared indicator navigate without timer mutations.
- Generated manifest and offline worker cache built assets only; authenticated/external requests bypass caching. Update UI waits for explicit application and blocks active/paused activities or dirty forms in the current page. Cross-tab unsaved-form update coordination remains pending.
- **54 general unit tests and 17 browser tests pass**, including production offline reopening of Home, Settings and diagnostics. Lint, TypeScript and build pass for this checkpoint. Evidence: `reports/platform-general.txt`, `reports/platform-lint.txt`, `reports/platform-typecheck.txt`, `reports/platform-build.txt`.
- This is platform evidence, not module parity. No app modules are migrated. Do not claim full verification passing.
- Next: prepare a plain-JavaScript candidate while retaining this working implementation; run the same assertions before switching tools. Then continue sequentially with plants.

## Verification evidence

| Check | Result | Evidence |
| --- | --- | --- |
| Original suites | Baselines pass | `reports/baseline-*.txt` |
| Current general unit suite | 25 cases pass | `reports/stage2-unit.txt` |
| General diagnostic browser suite | 3 mocked cases pass | `reports/readwise-diagnostic-general.txt` |
| Diagnostic/storage red reconstruction | 18 named cases fail with source absent | `reports/stage2-reconstructed-red.txt` |
| Legacy ownership regression | Original 5 guards fail; prepared fixes pass | `reports/legacy-workers-red.txt`, `reports/stage2-unit.txt` |
| Lint / typecheck / build | Pass for Stage 2 implementation | `reports/stage2-lint.txt`, `reports/stage2-typecheck.txt`, `reports/stage2-build.txt` |
| Whole app suites | Last full run exits 1; missing apps remain unfinished | `reports/red-all.txt` |

The initial diagnostic/storage red logs contained file-level summaries; the reconstruction is additional evidence, not a replacement claim about those initial logs. See `docs/testing.md`.

## Resume

1. Read `AGENTS.md`, `COMPASS.md`, this file and the authoritative `docs/pwa-consolidation-plan.md`.
2. Finish the plain HTML/CSS/JavaScript transition using the verified platform checkpoint above. Preserve all assertions, including offline and settings browser checks. Then begin plants, retaining its original appearance and care rules.
3. Keep the diagnostic and real API endpoints available. Authenticated success is unverified and deferred to the user's token test; it is not a dependency for local platform work.
4. Run general plus affected module suites for shared changes. Add Time Budget/Reader characterization tests and replacement piano continuation/worker/route contracts before their modules are implemented.
5. Save local progress after each increment. Do not add workflows or push the local workflow deletion automatically.

## Stages

1. Tests first: complete.
2. Constraints: local preparation complete; live API/device/release evidence explicitly deferred by user.
3. Platform: in progress, local only. First increment: router, shell, shared language and dashboard customization.
4. Plants: pending.
5. Coffee then games: pending.
6. Time Budget then piano: pending.
7. Reading then WhatsApp: pending; retain API calls for later token testing.
8. Release/migration: deferred; full product and physical-device acceptance remain required before completion.

## Saved checkpoints and remote history

- `1344b79`: initial test-first bootstrap.
- `565912d`: diagnostic, recovery prototype, legacy patches and historical preview workflow.
- `dffda47`: patch context formatting fix.
- `f9b9eca`: progress update pushed after unsetting `GITHUB_TOKEN`; remote is `https://github.com/Raul-MA/daily.git`.
- On 2026-10-14 the preview workflow failed at `configure-pages`: Pages was configured for legacy branch publishing. A proposed switch to Actions was interrupted and is no longer authorized under the local-only instruction. Hosting is unverified and no further remote troubleshooting is needed now.
