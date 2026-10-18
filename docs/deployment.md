# Local development and deferred deployment

## Problem

On 2026-10-15 the user requested local work only, with no workflows. Deployment and authenticated API verification must not hold up local implementation.

## How It Works

Use `npm run dev` from the repo root. Open `http://localhost:5173/daily/` for the current home or `http://localhost:5173/daily/diagnostics.html` for the Readwise/Reader connection checks. The local Node server prints its URL; pass `--port` when serving if another port is needed. `npm run build` copies unchanged native HTML/CSS/JavaScript into `dist/` and generates offline metadata. No bundler or compiler is used.

The GitHub Actions diagnostic deployment workflow has been removed. On 2026-10-18 the user explicitly resumed remote work for pushing review branches and opening PRs. This permits review publication only: do not add workflows, configure hosting, change repository settings or deploy without a further request. Review publication does not verify installed-device behavior or live APIs. See [progress](progress.md) for the current review order.

Readwise/Reader use their documented real endpoints. Mocked tests verify local handling of success and failures; the user can later enter a token on their own device to test actual access from that page's origin. Do not claim live success, require a hosted diagnostic before continuing, or request the token in chat.

## Gotchas

- `npm run verify` is the local full-product gate; unfinished feature suites still fail. Scoped tests remain useful during sequential implementation.
- A production install, offline update or physical migration still needs its later acceptance checks. Deferring deployment does not make those checks pass.
- Historical GitHub detail: Git push worked with `GITHUB_TOKEN` unset per command. The saved Git credential path can publish authorized review branches; the environment integration token may lack Git push or PR-creation permissions. Keep credentials in process memory and out of command output, tracked files and backups.
