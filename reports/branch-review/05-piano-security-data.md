# Piano security and data safety review

## Scope and result

Compared `main` (`1e1caae45edd6fe318dff5a997de8b108d0bb2d4`) with `review/08-cloud-sharing-proposal` (`859fd7b0f1365f90cbef22b0975f612580580e2c`). Source snapshot: `/tmp/daily-branch-review-20261018`. No source edits, browser suites, build or network calls. Four introduced defects are supported below; two independently verify the previously supplied review claims.

## Confirmed findings

### P2 — Register unsaved player content with shared form tracking

Changed anchor: `modules/piano/src/player/controls.js:4` (also correction controls at line 20 and rename input in `page-render.js:18`).

Paste exercise JSON, or change a note correction/rename field, then switch shell language before importing/saving. These controls are outside a form and have no dirty-state integration. The player only listens to click/change, while `rememberUI()` delegates to `captureDrafts()`, which captures identified `form[data-unsaved="true"]` nodes. The remount therefore loses the draft, and shared update protection cannot observe it. Register identified forms and their dirty/clean transitions. Independently confirmed by following the newly added markup/listeners through unchanged `ui-drafts.js` and `packages/ui/src/drafts.js`; no independent browser reproduction was run here.

### P2 — Cancel stale asynchronous exercise imports

Changed anchor: `modules/piano/src/player/page-actions.js:97`; the drop handler has the same issue at `page.js:22`.

Select a file whose `text()` is still pending, then leave/remount the player or select/import a newer file. Completion unconditionally calls `importText()` without checking disposal, render generation or request identity. `importText()` first commits the exercise and changes selection, then rerenders. The obsolete operation can therefore save/select its exercise after the user has left or superseded it. With two different IDs the older selection wins; with identical IDs the newer file may be rejected as a duplicate depending on completion order. Add a shared request token across file/drop imports and check it plus disposal immediately after each await and before mutation.

Evidence: `/tmp/piano-security-review-probe.mjs` calls the real `changeField()` with deferred `file.text()`, sets `ctx.disposed=true`, releases the read and records `library.importText('delayed old file')` executing. The probe intentionally stops rendering after the recorded mutation; it does not pretend to be a browser test. Source independently establishes the identical missing guard for drop.

### P2 — Bound generated subdivision work before synchronous playback scheduling

Changed anchor: `modules/piano/src/player/timing.js:48–49`.

A 473-byte exercise accepted by `validateExercise()` can specify one 32/1 measure at TPQ 15360 with a subdivision region covering its 1,966,080 ticks at `stepTicks:1`. `clickGrid()` expands every subdivision tick and searches the growing grid using `.some()`, requiring roughly 1.9 trillion comparisons. Enabling either metronome mode and pressing Play executes this synchronously on the UI thread; even beats mode builds the subdivisions before filtering them. This makes a very small accepted import freeze the app. Use bounded/lazy scheduling, avoid expanding subdivisions in beats mode, and replace quadratic deduplication or validate practical limits.

Evidence: `/tmp/piano-grid-review-probe.mjs` constructs that exact 473-byte document, prints validation `[]`, runs the real grid function in an isolated worker and terminates it after it fails to complete within 1500ms. The full pathological calculation was deliberately not allowed to run to completion. The blocking UI-thread implication follows directly from `scheduleClicks()` calling `clickGrid()` synchronously. This is resource exhaustion from an imported local document, not a remote exploit claim.

### P2 — Fill the loop scheduling horizon with sufficient repetitions

Changed anchor: `modules/piano/src/player/transport.js:27`.

Independently reproduced the prior report: at 120 BPM/960 TPQ, a valid 10-tick loop schedules just the first two cycles through 0.0104167 seconds during start. Advancing the audio clock to 0.025 seconds and pumping jumps to repetition 5 and schedules the remaining tail at 0.025 seconds; the intervening audio was never scheduled. Appending only one successor cannot fill the 150ms horizon for short loops. Append enough successors to cover that horizon, with appropriate bounds.

Evidence: the real transport in `/tmp/piano-security-review-probe.mjs`, `automatic:false`, a deterministic audio clock and the documentation exercise with a 10-tick loop. Output includes initial horizon `0.010416666666666666` and repetition `5` after the 25ms pump. The broad correctness reviewer also owns this timing finding; avoid counting duplicate reports twice.

## Coverage and non-findings

Read root/module instructions and player documentation. Reviewed all 20 player runtime files, changed integration files (`validation.js`, `view.js`, `i18n.js`, `src/js/app.js`, navigation data/sidebar), modified page/CSS files, player translations, all three added player test files, new E2E spec and mobile scenario diffs. Read generated format/types and transcription instructions; compared the generated JSON schema structurally with the runtime schema and verified the prompt embeds its exact schema (`true` for both checks). Documentation/example JSON was loaded by the probes; timing fixture usage/assertions were inspected. Together these cover the complete 48-path Piano change inventory, with generated schema payload checked by equivalence rather than a second handwritten schema audit.

Necessary unchanged dependencies read: Piano service/revision and practice actions; UI draft lifecycle; keyboard diagram escaping; shared module storage and form capture already inspected in earlier app gates. All new HTML/string sinks were traced: imported exercise/track/note/reference labels pass escaping or `textContent`, including the keyboard legend. Blob URLs are created internally and revoked on page refresh/disposal. Attachment MIME types are allowlisted to PNG/JPEG/WebP/PDF; no imported URL becomes a score URL. Audio requests derive from the existing fixed sample catalog, not imported paths. No confirmed XSS, secret exposure or external request injection was found.

Library import/replace revalidates complete exercises; settings validate against selected variants/tracks; failed root writes preserve the previous readable library through existing service storage guards. Attachment writes use IndexedDB transactions and attempt blob rollback after metadata save failure. Separate score blobs are explicitly excluded from JSON backups. Attachment races across overlapping operations and interrupted two-store writes were inspected but not reproduced as an additional distinct finding; cross-store crash atomicity is not certified.

## Limits

This specialist ran only the two small Node probes and generated-schema equivalence checks. The parent runs the Piano suite; passing suite results are separate evidence and do not cover the new race/grid cases. No browser exploit, real PDF renderer, physical audio/device, OS termination, quota stress or full cross-tab test was performed. Unmodified musical calculations, lesson content and shared storage implementations were inspected only as needed by changed call paths. Generated documentation equivalence does not prove every musical transcription instruction correct.

## Parent verification added after specialist review

The parent independently reran both the grid probe and the architecture probe successfully. Its Chromium probe `/tmp/daily-review-piano-probe.mjs` also confirmed: pasted JSON contained 1885 characters with no form/dirty tracking, then became empty after switching to Spanish; releasing a slow exercise file after navigating Home persisted `selectedId: "late-after-navigation"` while the route stayed `#/`. These browser results independently support the draft and stale-import findings. Parent reports the full Piano gate passed 78 unit / 19 browser cases plus both retained broad scripts (45 destinations, 320/360/390 widths, all lessons and offline). Those passing regressions do not invalidate the independently reproduced defects.
