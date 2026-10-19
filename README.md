# Daily PWA

One personal PWA containing Plants, Coffee, Games, Time Budget, Piano, Reader and WhatsApp Later. It uses plain HTML, CSS and JavaScript modules, shared EN/ES navigation, local records, backups and offline assets.

Local workflows, localization and combined recovery have verification evidence in [progress](docs/progress.md). Physical iPhone migration, live Readwise/Reader access, external-app handoffs, installed-worker coexistence and release acceptance remain deferred. Keep the original installations and exports until those checks pass.

## Local use

Use Node 24 and npm 11. Run `npm ci`, then `npm run dev`; open `http://127.0.0.1:5173/daily/`. Dev prepares files once: after source edits, run `npm run build` and refresh.

The build copies native browser modules and CSS unchanged into `dist/`, generates installation icons, the manifest and offline asset list, and uses no bundler or compiler. Any ordinary static HTTP server can serve that directory. Set `DAILY_BASE=/another/path/` for both building and serving another path; the default is `/daily/`. To choose a port after building, run `node scripts/serve.mjs --port 5174`; the loopback-only server prints its URL.

Review branch publication and stacked PRs are authorized. Hosting, workflows, repository configuration, cloud setup and deployment require a further request. Publishing a review does not verify physical devices or authenticated APIs.

## Checks

- `npm run lint`: strict ESLint for authored source, scripts and tests.
- `npm run check:js`: JavaScript syntax checks; no type analysis.
- `npm run test:general`: shared platform and browser contracts.
- `npm run test:plants` or another module: that module's tests.
- `npm run test:all`: every suite, sequentially; failures remain blocking.
- `npm run build`: prepare static local files.
- `npm run verify`: lint, syntax, every suite and static preparation.

Playwright needs Chromium: use `npx playwright install chromium` on a fresh machine, or `PLAYWRIGHT_EXECUTABLE_PATH` for an existing browser. Browser tests open a local server and never deploy. See [testing](docs/testing.md) for baseline isolation, source provenance and failure classification.

## Data and recovery

Records and preferences stay in localStorage. Settings exports and restores a full Daily backup with a read-only preview and recovery download before replacement. Legacy single-app exports use their respective app import screens. Piano score files live separately in IndexedDB and need separate downloads; JSON backups contain their references only. Tokens stay outside application backups and must be reentered after restore. Live Readwise/Reader testing is deferred to the user's private-token session.

Read [Compass](COMPASS.md), [progress](docs/progress.md) and [the plan](docs/pwa-consolidation-plan.md) to resume. No personal backup or credential belongs in this repository.
