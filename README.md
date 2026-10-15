# Daily PWA

A test-first migration of seven local apps into one personal EN/ES PWA. Development is local only for now; deployment and GitHub Actions workflows are deferred.

Local Stage 2 preparation is complete; shared platform implementation is next. The home page is a harness placeholder; a standalone Readwise diagnostic is available at `/daily/diagnostics.html`. This repository is not an installable or usable replacement for any original app.

## Setup

Use Node 24 and npm 11. Run `npm ci`, then `npm run dev`. The development page is served under `/daily/`. Set `DAILY_BASE` for another deployment path.

## Validation

- `npm run lint`: strict policy for all authored JS/TS, including tests, scripts and configs.
- `npm run typecheck`: diagnostic and storage TypeScript; the app platform is pending.
- `npm run test:general`: general unit tests plus the mocked diagnostic browser suite.
- `npm run test:plants` (or another module): that module's unit and browser checks, sequentially.
- `npm run test:all`: every suite, one at a time; unfinished modules fail.
- `npm run build`: static harness output; this does not imply migration completion.
- `npm run verify`: blocking lint, typecheck, all tests and build.

Playwright needs Chromium. Run `npx playwright install chromium` on a fresh development machine. An existing browser can be selected with `PLAYWRIGHT_EXECUTABLE_PATH`. Browser suites start their own local server. Reports record actual results; red feature suites are expected until migration, and remain failures.

Read [progress](docs/progress.md) to resume, [Compass](COMPASS.md) for navigation and [the authoritative plan](docs/pwa-consolidation-plan.md) for acceptance gates. Preserve old installations and backups until physical iPhone migration is verified. No personal backup or token belongs in this repository.
