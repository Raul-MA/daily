# Implementation progress

Updated: 2026-10-14. Repository: `/workspaces/daily`, local Git branch `main`. Target: `https://raul-ma.github.io/daily/`. No remote or deployment exists.

## Current step

Stage 1 is complete: source suites copied first, baseline preservation verified, runnable new-app red results recorded, and full strict lint passes. Stage 2 research/checklist is prepared; physical evidence and diagnostic hosting are pending. No app module implementation has begun.

## Completed

- Initialized a fresh local repository; moved authoritative plan/lint policy into `docs/`. Workspace originals are relocation pointers.
- Copied all 25 discovered test/helper files before application logic. Original source commits/hashes and migrated file mappings are in `reports/source-tests.json` and `reports/migration-test-inventory.md`.
- Refactored imported workflows into small helpers/scenarios under the unchanged strict ESLint thresholds. No assertions dropped: plants 14, coffee 147, games 136, piano 275, WhatsApp 37 assertion call sites match their sources.
- Installed pinned npm dependencies and lockfile, shared ESLint config, TypeScript check, Vite harness, scoped runners and expected-discovery guards. Tests run sequentially with one browser worker and no retries.
- Kept coffee uncommitted docs, personal backup and Excel additions untouched and out of Daily. Only its backup file-size metadata was examined (20,124 bytes); the complete storage gate remains pending.
- User confirmed the project-hosted GitHub Pages origin, recorded in `docs/constraints.md`.
- Rechecked public Readwise/Reader documentation. Authenticated CORS, structured Q&A and feedback capability remain unverified; direct-review fallback remains required.
- User reports every app exports successfully and most backups contain fewer than 50 entries. The user reports approximately 20 KB backup size (per-file versus aggregate unspecified). Export and restore are both confirmed working by the user for the existing apps. Aggregate byte size and exported active state/settings remain unverified; combined Daily migration/restore still needs implementation and testing. No backup files were requested or copied.

## Verification evidence

| Check | Result | Evidence |
| --- | --- | --- |
| Original plants | 7 cases pass | `reports/baseline-plants.txt` |
| Original coffee browser | 21 cases pass | `reports/baseline-coffee-e2e.txt` |
| Original games browser | 24 cases pass | `reports/baseline-games-e2e.txt` |
| Original piano unit | 41 cases pass | `reports/baseline-piano-unit.txt` |
| Original piano browser | Full desktop/touch/timing matrix exits 0 | `reports/baseline-piano-browser.txt` |
| Original piano offline | Worker activation, offline reload and guided reveal pass | `reports/baseline-piano-offline.txt` |
| Original WhatsApp | 3 named groups pass | `reports/baseline-whatsapp.txt` |
| New general harness | 2 cases pass | `reports/bootstrap-general.txt` |
| New app full run | Exit 1: plants 7, coffee 21, games 24, piano unit 41, WhatsApp 3 fail; piano UI/offline stop on absent UI | `reports/red-all.txt` |
| Time Budget / Reader | No source suites; explicit discovery failures until characterization tests are authored | `reports/red-all.txt` |
| Full strict lint | Pass, zero warnings | `reports/lint.txt` |
| Typecheck | Pass for initial declarations; platform TypeScript still pending | `reports/typecheck.txt` |
| Build | Pass for 0.29 kB harness page; no product behavior yet | `reports/build.txt` |

Full verification is intentionally failing. No production module, combined manifest/worker, backup system, migration exporter or deployment exists yet. The interrupted original offline check was retried with a restarted static server and passed; its initial connection refusal was infrastructure failure, not app failure.

## Resume

1. Read `AGENTS.md`, `COMPASS.md`, this file and `reports/migration-test-inventory.md`.
2. Use `docs/device-validation.md` and work through Stage 2 sequentially. Existing exports and restores now have user-reported success; do not ask the user to repeat them. Confirm endpoint behavior from the actual Pages origin on iPhone, validate aggregate byte size/storage during import work, and document background/process restoration checks and legacy worker coexistence. Prepare safe diagnostic steps without storing or requesting the user's token.
3. Do not mark Stage 2 complete from public docs, dummy-token requests, a small coffee sample or Chromium emulation. Physical device results require user participation.
4. Only then begin Stage 3 test-first platform work. Author Time Budget/Reader characterization suites before their modules, and replacement piano continuation/cache/route tests before changing inherited assertions.

## Stages

1. Tests first: complete. Checkpoint commit: `test: bootstrap sequential PWA migration suites`.
2. Constraints: public API research and physical checklist prepared; device/hosted-authentication evidence pending.
3. Platform: pending.
4. Plants: pending.
5. Coffee then games: pending.
6. Time Budget then piano: pending.
7. Reading then WhatsApp: pending.
8. Release/migration: pending.

## Saved checkpoints

- `1344b79` — Stage 1 test-first bootstrap, source mapping, baseline passes and new-app red evidence.
- Stage 2 evidence checklist is in `docs/device-validation.md`. User-reported exports and restores work for the existing apps; most backups contain fewer than 50 entries. Authenticated Readwise results, timer/device observations and a deployed diagnostic page remain pending. Resume with these dependencies; do not silently skip the plan's constraint gate.
