# Piano: UI, accessibility, localization and test review

Comparison `main` → `review/08-cloud-sharing-proposal`, reviewed 2026-10-18. Exact branch snapshot `/tmp/daily-branch-review-20261018`; Git comparisons from `/workspaces/daily`.

## Findings

### P2 — Register imported JSON and correction drafts with shared form preservation

Location: `modules/piano/src/player/controls.js:3-4`.

Paste exercise JSON without importing, then switch language. The entire player remounts and the paste is lost. Rename and unsaved note-correction fields have the same exposure. New player markup contains no identified forms, while shared `captureDrafts()` only snapshots `form[data-unsaved="true"]` with IDs; shared PWA input tracking only marks a closest form. Thus pending content also does not hold service-worker updates. This independently confirms the prior report by tracing player markup, language mount/disposal and shared tracking; this agent did not run a browser reproduction.

### P2 — Fill the loop scheduling horizon with as many repetitions as needed

Location: `modules/piano/src/player/transport.js:25-27`.

A valid 10-tick loop at 120 BPM is shorter than the 25ms pump interval. Each pump adds only one successor. Independent real-module Node probe `/tmp/piano-ui-clock-probe.mjs` (exit 0) used a controlled audio clock, one note across the 10-tick loop, no pedal/count-in/gap and automatic pumping disabled. Initial scheduled note windows were [0,0.0052083333] and [0.0052083333,0.0104166667]. Advancing the clock to 0.025 and pumping added [0.025,0.0260416667], reporting repetition 5. Audio between 10.4167ms and 25ms was never scheduled. Append successors until the lookahead horizon is covered. This independently reproduces the prior report.

### P2 — Ignore asynchronous file imports after the player is disposed

Location: `modules/piano/src/player/page-actions.js:94-97`; equivalent drop path in `page.js`.

Choose an exercise file, then navigate away or change language before its `file.text()` resolves. Player cleanup sets `ctx.disposed`, but `changeFile` unconditionally invokes `importText` after awaiting the read. That immediately writes to the library and selects the imported exercise. The detached old screen can therefore still change saved collection/selection after navigation, and a slower earlier file can select itself after a later import. Validate request identity and current lifecycle before committing.

Evidence: actual exported `changeField` invoked in `/tmp/piano-ui-import-probe.mjs` (exit 0) with a deferred file read and an instrumented library boundary. After setting `ctx.disposed=true` and resolving the read, the library import method was invoked with disposed=true. The probe throws a sentinel at that boundary to avoid DOM/persistence; it establishes missing cancellation control flow, not a full mounted-browser persistence reproduction. Source inspection of `importText`/`playerLibrary.importText` establishes the consequent write/selection behavior. Existing file/drop browser tests only exercise reads that finish before navigation.

### P2 — Translate player validation explanations before displaying them

Location: `modules/piano/src/player/page.js:9`.

Select Español and import `{}`. Root’s mounted Chromium probe reports six English explanations: `$.schemaVersion: required`, `$.id: required`, `$.title: required`, `$.defaultVariantId: required`, `$.tracks: required`, `$.variants: required`, while the surrounding interface is Spanish. Canonical JSON property paths should remain stable, but authored validation explanations must follow the language setting, as required by the implementation plan’s all-interface EN/ES contract. The new `ctx.fail` calls `copy(error.message)` on the entire concatenated message. `shape-validator.js` builds English explanation strings; neither `translations/player.js` nor existing dictionaries/phrase patterns match those messages, and `translatePattern` returns unmatched text unchanged. Semantic and duplicate-ID validation messages have the same presentation limitation. Translate structured error messages individually while preserving property paths and imported user values.

Evidence: source trace through `shape-validator.js`, `validator.js`, `page.js`, `i18n.js`, `phrase-patterns.js` and dictionary search, plus parent mounted reproduction. This is an introduced localization failure in an explicit product requirement, rather than a complaint that canonical field identifiers are English.

### P3 — Preserve the note editor disclosure and focus when changing its selected event

Location: `modules/piano/src/player/page-actions.js:91`.

Open Correct a note and select another event, for example n2. `changeField` immediately calls `renderPage`, replacing the whole page with fresh closed details elements. Root’s mounted probe confirms the editor disclosure becomes open=false and activeElement becomes BODY. Users must reopen the editor after every event change; keyboard users lose their position in the form. Preserve disclosure state and restore focus, or update the selected note fields without replacing the editor.

### P3 — Scroll the document to the new exercise after importing

Location: `modules/piano/src/player/page-actions.js:84-85`.

Import another exercise using the importer at the bottom of a long selected exercise. The success handler sets `ctx.container.scrollTop=0`, but the changed Piano layout scrolls the document. Focusing the new heading with preventScroll retains the previous page offset. Root’s mounted probe observed document scrollY=2621 and the focused heading at viewport top=-2405.86, so successful import leaves the newly selected exercise and focus off-screen. Scroll the correct owner or let the heading focus/scrollIntoView reveal the result.

Both P3s were reproduced by the parent in `/tmp/daily-review-piano-probe.mjs` (exit 0); this agent independently traced their source before the parent run. They affect usability/focus, without claiming data corruption.

## Coverage and assessment

Inspected all 48 changed Piano paths. Runtime files reviewed in full: all new `src/player/` modules (schema, runtime types, shape/semantic validation, library/settings, import/control/page rendering, display/timeline, score attachments, audio, scheduling, timing and transport); all changed CSS files; i18n/dictionary additions; route loader/catalog/sidebar changes; the two page width adjustments; service validation and mount integration.

Documentation/fixtures reviewed: module AGENTS/COMPASS, behavior/player/format/types documents, example JSON, runtime schema and transcription prompt instructions; user timing fixture through its dedicated test assertions. Generated schema/prompt duplication was checked programmatically: published schema equals runtime schema, and the transcription prompt embeds the complete identical schema. This is structural contract checking, not verification that an AI transcription will be musically accurate.

Tests reviewed in full: `test/player.test.mjs`, `player-invariants.test.mjs`, `player-user-timing.test.mjs`, `e2e/player.spec.js`, and changed original mobile scenarios. Dependencies traced: `ui-drafts.js`, `exercise-state.js`, full mount lifecycle, exact-octave keyboard renderer, attribute localization, i18n phrase dispatch and shared draft/PWA/shell/sidebar behavior reviewed in prior app gates.

- The new domain tests meaningfully assert tempo integration/inverse, rests/chords/octaves/triplets, half-open loop bounds, pedal holds, acceleration/count-in/gap, seek/rescheduling, library atomicity and generated schema identity. These are valuable behavioral tests.
- Long-jump loop tests assert repetition catch-up but do not assert continuous scheduled coverage under short loops. That gap allowed the reproduced audio bug.
- Browser tests exercise paste/file/drop, hostile IDs escaping, real sample loading/cancellation, seek/pause/mute/speed, correction/export, score persistence/missing blobs and 320px layout. They do not cover draft remounts, stale imports or player-specific Spanish paths.
- The existing original mobile scenario assertions remain; new menu-opening steps apply only to native mode and preserve original-source behavior. Removed Course/Library navigation is present in shared sidebar catalog. Document scrolling replaces the inner viewport scroller; bounded horizontal keyboard/timeline scrolling remains.

## Nonblocking UI/accessibility and localization observations

- The dynamic loop label in `saveSettings` hardcodes English `ticks`, and timeline tooltip/accessible Accent wording is hardcoded before generic localization. Existing player browser tests do not switch to Spanish or assert dynamic translations.
- Score blobs intentionally remain outside JSON/backups, with visible instructions and missing-file playback support. Image/PDF rendering, focus behavior and cleanup were traced but not exercised dynamically by this agent.

## Verification and limits

This agent ran two isolated Node control-flow/audio-clock probes and one read-only generated-schema comparison. No Piano browser suite, server, build, screenshot, accessibility scanner, actual audio listening, network call or physical-device test was run by this agent. Root owns sequential suite execution/browser confirmation. No source/test edits or personal-data access occurred. The two prior findings were independently examined rather than accepted from the supplied review; additional asynchronous-import behavior was also checked.

## Parent mounted confirmation

Root independently reproduced draft loss and an import committing after navigation in Chromium; [the reproduction report](05-piano-reproduction.md) records the precise observed storage and UI state. It also confirms the Spanish validation failure above. These are parent-run mounted checks, separate from this agent’s static inspection and isolated Node probes. The parent independently repeated the short-loop probe and documented an additional dense-grid problem owned by the other specialty reports; that issue is not duplicated as a new finding here.
