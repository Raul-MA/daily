# Daily PWA

One personal PWA containing Plants, Coffee, Games, Time Budget, Piano, Reader and WhatsApp Later. It uses plain HTML, CSS and JavaScript modules, shared EN/ES navigation, local records, backups and offline assets.

Local workflows, localization and combined recovery have verification evidence in [progress](docs/progress.md). Physical iPhone migration, live Readwise/Reader access, external-app handoffs, installed-worker coexistence and release acceptance remain deferred. Keep the original installations and exports until those checks pass.

## Local use

Use Node 24 and npm 11. Run `npm ci`, then `npm run dev`; open `http://127.0.0.1:5173/daily/`. Dev prepares files once: after source edits, run `npm run build` and refresh.

The build copies native browser modules and CSS unchanged into `dist/`, generates installation icons, the manifest and offline asset list, and uses no bundler or compiler. Any ordinary static HTTP server can serve that directory. Set `DAILY_BASE=/another/path/` for both building and serving another path; the default is `/daily/`. To choose a port after building, run `node scripts/serve.mjs --port 5174`; the loopback-only server prints its URL.

## GitHub Pages

The user authorized Pages deployment on 2026-10-19. [The deployment workflow](.github/workflows/pages.yml) runs on pushes to `main` or manual dispatch from `main`. It uses Node 24, installs locked dependencies and Chromium, and runs `npm run verify` before uploading only `dist/` at `/daily/`. The deployment job needs a successful build and uses the `github-pages` environment. Action revisions are pinned to commits (checkout v6, setup-node v7, configure-pages v5, upload-pages-artifact v4, deploy-pages v4).

In repository Settings → Pages, the publishing source must be **GitHub Actions**. Publishing `main:/` with Jekyll renders this README instead of building the app. See [GitHub's custom workflow guidance](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages). The app URL is <https://raul-ma.github.io/daily/>; hash routes, manifest and service worker all use that base. Repository documentation, tests, reports and personal exports are excluded from deployment; only app/shared/module runtime assets are copied by the build.

Cloud setup, physical-device migration, authenticated APIs and legacy-app releases remain deferred. Publishing the app does not establish those acceptance results.

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
