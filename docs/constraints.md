# Constraints and device gates

## Problem

Static browser behavior and desktop emulation do not establish authenticated CORS, installed iPhone storage access or background/process restoration. Stage 2 evidence must distinguish research, local tests and physical checks.

## How It Works

Application and device work remains local; review branch publication is authorized, while workflows, hosting and cloud setup remain deferred. A real-endpoint diagnostic is available locally at `/daily/diagnostics.html`; authenticated requests are deferred to the user entering a token later. Live API uncertainty does not block platform or module implementation. See [local development](../README.md#local-use) for preview commands and the publication boundary.

Rechecked public [Readwise API documentation](https://readwise.io/api_deets) on 2026-10-13: auth GET returns 204 for a valid token; scheduled Daily Review is GET `/api/v2/review/`, may return 404, and exposes completion and a review URL. Completion is a separate explicit POST `/api/v2/review/complete/`. No authenticated requests or completion mutations were made. The public documentation checked does not establish structured Mastery-card data or the pictured Never/Soon/Later/Someday feedback API; retain the plan's direct-review fallback until capability is demonstrated.

The [Reader API](https://readwise.io/reader_api) documents GET `/api/v3/list/`, cursor pagination, location filters and a bounded limit. These documented contracts do not prove authenticated CORS from Pages on iPhone.

The [device evidence ledger](device-validation.md#evidence-ledger) preserves user-confirmed old-app export/restore and timer/Reader observations, including their limits. Those observations do not establish Daily migration, combined storage capacity or authenticated access from its origin.

Follow the [physical device checklist](./device-validation.md) for the evidence still needed.

## Gotchas

- When the user later tests the APIs, use the current local page origin with the token entered locally. Never send it through chat or write it into tracked sources/reports. Record status/CORS outcomes without payloads or headers containing credentials. GET-only diagnostics must not mark a review complete.
- Export separately from each installed old PWA into Files and compare record counts. Do not assume a Safari tab can read an installed PWA's storage.
- Test a running budget and piano session across navigation, lock, background and full process termination on the physical iPhone when physical testing resumes. Rendering intervals alone cannot certify this.
- Fix the five broad legacy worker cleanup policies before new and old installations coexist. Limit cleanup to each app's owned prefix; preserve origin storage and unrelated caches. The five cleanup patches are prepared and tested in `legacy/patches/`, but are not applied or released; see [legacy worker details](./legacy-workers.md).
- Physical checks remain pending and must not be marked passing based on mock responses or Chromium touch emulation.


## Prepared diagnostic

Run `npm run dev`, then open `/daily/diagnostics.html` under that server. Choose English or Spanish, enter the token locally and press Run checks. The input clears immediately. Three sequential GET requests return only endpoint IDs, HTTP statuses and outcome labels. The page neither parses response bodies nor saves tokens/results, and it offers a separate Daily Review link without marking anything complete.

The diagnostic labels its actual page origin. Running locally does not verify Pages CORS. Do not host a diagnostic as a prerequisite. The user can test the real endpoints locally when ready; report the actual result and origin, including any CORS failure. No live authenticated request has been made by this agent. Mocked tests establish handling of success, absent review, unauthorized responses, throttling, service errors, network/CORS failures and request timeouts; they do not establish live API availability or structured review-feedback support.

Storage recovery feasibility is tested separately in [storage and migrations](./storage-and-migrations.md). Legacy cleanup preparation is tracked in [legacy workers](./legacy-workers.md).
