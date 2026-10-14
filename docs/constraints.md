# Constraints and device gates

## Problem

Static browser behavior and desktop emulation do not establish authenticated CORS, installed iPhone storage access or background/process restoration. Stage 2 evidence must distinguish research, local tests and physical checks.

## How It Works

The user selected the GitHub Pages project origin `https://raul-ma.github.io/<repo>`. The local repo name and configured path are `daily`, making the intended URL `https://raul-ma.github.io/daily/`. There is no remote repository or deployment yet. A standalone diagnostic is now built at `/daily/diagnostics.html`. Project paths share the `https://raul-ma.github.io` origin with old apps.

Rechecked public [Readwise API documentation](https://readwise.io/api_deets) on 2026-10-13: auth GET returns 204 for a valid token; scheduled Daily Review is GET `/api/v2/review/`, may return 404, and exposes completion and a review URL. Completion is a separate explicit POST `/api/v2/review/complete/`. No authenticated requests or completion mutations were made. The public documentation checked does not establish structured Mastery-card data or the pictured Never/Soon/Later/Someday feedback API; retain the plan's direct-review fallback until capability is demonstrated.

The [Reader API](https://readwise.io/reader_api) documents GET `/api/v3/list/`, cursor pagination, location filters and a bounded limit. These documented contracts do not prove authenticated CORS from Pages on iPhone.

Only file-size metadata was read from the existing coffee backup: 20,124 bytes. Its content was not copied into Daily. This small sample does not validate the largest combined installed-app backup or the chosen root-document storage budget.

The user subsequently reported successful exports from every app, with most backups containing fewer than 50 entries. The user also reported an approximate backup size of 20 KB, without specifying whether this was per-file or aggregate. The user also confirmed restore works. Export and restore of existing app backups are therefore recorded as user-confirmed success. Exact aggregate bytes and exported coverage of active state/settings remain unverified; this does not yet validate the new combined Daily import/restore. No export files are needed from the user at this point.

The user confirms the existing Time Budget survives lock, backgrounding and closing/reopening with correct timing, and that Reader works on the iPhone. Daily Review is new and has not been verified. These observations complete the existing-app checks without establishing authenticated API access or the new Daily activity lifecycle.

Follow the [physical device checklist](./device-validation.md) for the evidence still needed.

## Gotchas

- Check auth, Reader list and Daily Review from a browser at `https://raul-ma.github.io`, with the token entered locally. Never send it through chat or write it into tracked sources/reports. Record status/CORS outcomes without payloads or headers containing credentials. GET-only diagnostics must not mark a review complete.
- Export separately from each installed old PWA into Files and compare record counts. Do not assume a Safari tab can read an installed PWA's storage.
- Test a running budget and piano session across navigation, lock, background and full process termination on the physical iPhone once persistence exists. Rendering intervals alone cannot certify this.
- Fix the five broad legacy worker cleanup policies before new and old installations coexist. Limit cleanup to each app's owned prefix; preserve origin storage and unrelated caches. The five cleanup patches are prepared and tested in `legacy/patches/`, but are not applied or released; see [legacy worker details](./legacy-workers.md).
- Physical checks remain pending and must not be marked passing based on mock responses or Chromium touch emulation.


## Prepared diagnostic

Run `npm run dev`, then open `/daily/diagnostics.html` under that server. Choose English or Spanish, enter the token locally and press Run checks. The input clears immediately. Three sequential GET requests return only endpoint IDs, HTTP statuses and outcome labels. The page neither parses response bodies nor saves tokens/results, and it offers a separate Daily Review link without marking anything complete.

The diagnostic labels its actual page origin. Running locally does not verify Pages CORS. Host the built `diagnostics.html` and hashed assets under `https://raul-ma.github.io/daily/` to collect the required iPhone result. No live authenticated request has been made by this agent. Mocked tests establish handling of success, absent review, unauthorized responses, throttling, service errors, network/CORS failures and request timeouts; they do not establish live API availability or structured review-feedback support.

Storage recovery feasibility is tested separately in [storage and migrations](./storage-and-migrations.md). Legacy cleanup preparation is tracked in [legacy workers](./legacy-workers.md).
