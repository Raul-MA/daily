# Deployment

## Problem

The new Readwise endpoint checks need the actual Pages origin. This diagnostic preview must remain distinguishable from a complete, installable PWA release.

## How It Works

`.github/workflows/diagnostic-pages.yml` runs a single sequential job: npm install, Chromium setup, strict lint, typecheck, general unit/browser tests, build, artifact upload and Pages deployment. Only `dist/` is published. Legacy patches, fixtures, source reports and private local exports are not deployment assets.

The configured URL is `https://raul-ma.github.io/daily/diagnostics.html`. The root page identifies itself as a test-first placeholder and links to the diagnostic. No manifest or worker is registered, so this preview is not an installation candidate.

This workflow validates the diagnostic/recovery increment only. It does not skip, weaken or mark passing the copied feature suites: those remain red until their apps are migrated. Before a product release, replace this preview gate with full `npm run verify` and satisfy physical migration/offline/update acceptance.

The user created the public repository `https://github.com/Raul-MA/daily` after the integration could not create repositories. It was verified empty and linked as `origin`. The initial push is blocked: GitHub returned HTTP 403 for both normal credentials and an explicit authenticated GitHub CLI helper. The current connection must be granted access/write permission to the new repository before pushing. Pages setup and hosted verification have not run.

## Gotchas

- Pages must use GitHub Actions as its build source, with repository Pages/environment permissions available.
- GitHub authentication must be checked with network access. A restricted-network `gh auth status` incorrectly reported an invalid token here; the permitted retry confirmed the Raul-MA account works.
- Do not install or announce a completed PWA from a diagnostic deployment.
- Live API results still require the user's token entered locally on the phone. Do not put it in Actions secrets, source, logs or chat.
