# Daily PWA

One local, personal PWA being built from seven existing apps. The app uses plain HTML, CSS and JavaScript modules. All development is local; hosting and workflows are deferred.

The shared shell works: responsive dashboard, EN/ES, settings, deep links, activity summaries and offline access. Plants, Coffee and Games are connected, including care/history, Things settings, drink logging, beans, scoring, statistics, shared game timing and import/export. The other four modules are still pending. Keep using the original installations until migration and device checks pass.

## Local use

Use Node 24 and npm 11 for development and verification. Run `npm ci`, then `npm run dev`. Open `http://127.0.0.1:5173/daily/`. Re-run `npm run build` after editing, then refresh.

The preparation script copies native browser modules and CSS unchanged into `dist/` and creates the install manifest and offline asset list. It does not bundle or compile application code. Any ordinary static HTTP server can serve the resulting directory. Set `DAILY_BASE=/another/path/` when preparing and serving another path; the default is `/daily/`.

## Checks

- `npm run lint`: shared strict ESLint for all authored code and tests.
- `npm run check:js`: JavaScript syntax checks; this is not typechecking.
- `npm run test:general`: shared logic, shell, diagnostic and offline browser tests.
- `npm run test:plants` or another module: that module's tests, sequentially.
- `npm run test:all`: every suite; unfinished modules fail honestly.
- `npm run build`: prepare static local files.
- `npm run verify`: lint, syntax checks, every suite and static preparation.

Playwright needs Chromium. Use `npx playwright install chromium` on a fresh machine, or set `PLAYWRIGHT_EXECUTABLE_PATH` for an existing browser. Browser tests open a local server and never deploy the app.

Records and preferences stay in localStorage. JSON recovery and export/import are the planned migration path. Tokens remain separate from application backups. Live Readwise/Reader verification is deferred to the user's later token test.

Read [progress](docs/progress.md), [Compass](COMPASS.md) and [the plan](docs/pwa-consolidation-plan.md) to resume. No personal backup or credential belongs in this repository.
