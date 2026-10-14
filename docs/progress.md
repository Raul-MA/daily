# Implementation progress

Updated: 2026-10-14. Repository: `/workspaces/daily`, local Git branch `main`. Target: `https://raul-ma.github.io/daily/`. No remote or deployment exists.

## Current step

Stage 1 is complete: source suites copied first, baseline preservation verified, runnable new-app red results recorded, and full strict lint passes. Stage 2 is next. No app module implementation has begun.

## Completed

- Initialized a fresh local repository; moved authoritative plan/lint policy into `docs/`. Workspace originals are relocation pointers.
- Copied all 25 discovered test/helper files before application logic. Original source commits/hashes and migrated file mappings are in `reports/source-tests.json` and `reports/migration-test-inventory.md`.
- Refactored imported workflows into small helpers/scenarios under the unchanged strict ESLint thresholds. No assertions dropped: plants 14, coffee 147, games 136, piano 275, WhatsApp 37 assertion call sites match their sources.
- Installed pinned npm dependencies and lockfile, shared ESLint config, TypeScript check, Vite harness, scoped runners and expected-discovery guards. Tests run sequentially with one browser worker and no retries.
- Kept coffee uncommitted docs, personal backup and Excel additions untouched and out of Daily. Only its backup file-size metadata was examined (20,124 bytes); the complete storage gate remains pending.
- User confirmed the project-hosted GitHub Pages origin, recorded in `docs/constraints.md`.
- Rechecked public Readwise/Reader documentation. Authenticated CORS, structured Q&A and feedback capability remain unverified; direct-review fallback remains required.

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
2. Work through Stage 2 sequentially: confirm endpoint behavior from the actual Pages origin on iPhone, measure largest combined exports/storage, and document background/process restoration checks and legacy worker coexistence. Prepare safe diagnostic steps without storing or requesting the user's token.
3. Do not mark Stage 2 complete from public docs, dummy-token requests, a small coffee sample or Chromium emulation. Physical device results require user participation.
4. Only then begin Stage 3 test-first platform work. Author Time Budget/Reader characterization suites before their modules, and replacement piano continuation/cache/route tests before changing inherited assertions.

## Stages

1. Tests first: complete. Checkpoint commit: `test: bootstrap sequential PWA migration suites`.
2. Constraints: research started; physical gates pending.
3. Platform: pending.
4. Plants: pending.
5. Coffee then games: pending.
6. Time Budget then piano: pending.
7. Reading then WhatsApp: pending.
8. Release/migration: pending.
