# Piano architecture and correctness review

Compared `main` (`1e1caae45edd6fe318dff5a997de8b108d0bb2d4`) with `review/08-cloud-sharing-proposal` (`859fd7b0f1365f90cbef22b0975f612580580e2c`). Source inspection used `/tmp/daily-branch-review-20261018`. Application source was unchanged.

## Confirmed findings

### P2 — Register player drafts with shared form preservation

Changed location: `modules/piano/src/player/controls.js:3-4`; correction controls in the same file have the same omission.

Paste exercise JSON without importing it, then change the shared language. Player controls contain no identified form, so the global input listener cannot mark the draft `data-unsaved=true`. Both Piano `rememberUI` and the shared shell capture only identified `form[data-unsaved="true"]` elements. Remount reconstructs the player and loses pasted JSON, an unsaved rename and unsaved note corrections. The service-worker update gate also sees no dirty draft and can offer activation during these edits.

Independently verified by tracing the generated importer/correction markup, player event registration, `modules/piano/src/ui-drafts.js`, `packages/ui/src/drafts.js`, shell remount and `apps/daily/src/shell/pwa.js:111-117`. This confirms the prior review's claim independently; this reviewer did not run a browser remount probe.

### P2 — Fill the lookahead with every required loop repetition

Changed location: `modules/piano/src/player/transport.js:25-27`.

`pump()` appends only one successor cycle when the scheduling horizon crosses the last cycle. Valid loops shorter than the 25 ms interval need multiple cycles queued each time. The following controlled-clock reproduction uses real `createPlayer` and a validated exercise (`validateExercise` returns `[]`): one note and an incomplete 10-tick measure at 960 TPQ and quarter BPM 120, looping ticks 0–10 without count-in or gap.

Initial Play schedules intervals `[0, 0.0052083333]` and `[0.0052083333, 0.0104166667]`. At audio time `0.025`, the next pump schedules only `[0.025, 0.0260416667]`, with snapshot repetition 5. Repetitions between 10.4167 ms and 25 ms were never scheduled. This is an audible gap under the normal pump cadence, rather than an artificial background clock jump. Append cycles until the lookahead is actually covered.

Evidence: `node /tmp/piano-review-clock.mjs`, using the real transport with `automatic:false` and a deterministic audio adapter. This independently reproduces the prior review's audio claim.

### P2 — Invalidate pending exercise imports after disposal or replacement

Changed location: `modules/piano/src/player/page-actions.js:94-97`. The file-drop path in `page.js` has the same missing guard.

The file picker awaits `file.text()` and then immediately commits through `importText`, without checking disposal or a current request identity. Choose a slow-reading exercise file and navigate away before the read completes: cleanup sets `ctx.disposed=true`, but completion still changes the persisted Piano library and selection. If another file is selected while the first is pending, the older request can also finish last and restore the older selection.

Evidence: `node /tmp/piano-review-clock.mjs` invokes real `changeField` and `playerLibrary` with a deferred `file.text()`, then marks the context disposed before resolving a valid file. The actual library service still records a `late-import` commit and the import path continues rendering. The output is `after disposal commits [ 'late-import' ] disposed true`. A minimal DOM adapter permits rendering; no application functions were replaced. Add a disposed/current-request check before committing, shared with the drop path.

## Coverage

The parent reviewer independently reproduced the controlled-clock and late-import probes, then confirmed draft loss and post-navigation import commits in Chromium. See [consolidated Piano reproduction evidence](05-piano-reproduction.md). Its full verification passed 78 unit cases, 19 browser cases and both retained broad browser scripts despite these defects. The security/performance report records an additional bounded reproduction of quadratic subdivision-grid generation; that is a separate specialist finding.

- Reviewed the full 48-file change list and all runtime source hunks. Read module working rules, Compass, behavior/player docs and format/type contract; inspected runtime schema and its generated JSON schema. Generated prompt/schema material repeats the structural contract and was assessed as generated contract material, not as separate implementation.
- Read all new player modules: structural/semantic validation, settings/defaults, library persistence, attachments/IndexedDB, score display, control markup/form conversion, rendering/actions, audio creation, timing, scheduling and transport.
- Traced tempo integration/inverse lookup, quarter-note units, compound-meter clicks, subdivisions, velocity/accent/track gain, pedal release extension, half-open loop boundaries, pause/seek retriggering, count-in/gaps and repetition acceleration. Inspected the domain/invariant/user-timing tests and mounted browser cases for their existing coverage.
- Traced async loading, sample preparation cancellation, player visibility/navigation cleanup, score URL generation guards, library validation and the existing Piano service revision/activity boundary. Checked optional player content integration into `validPiano` and separation of attachment blobs from backup references.
- Reviewed navigation/catalog/route-loader integration, removal of local navigation, shared sidebar destinations, translation additions, full-width/document-scroll changes and retained mobile-script adaptations. Read the shared draft/update dependencies relevant to the first finding.

## Limits and hypotheses

- Three confirmed introduced findings above. The first two were independently checked after receiving the earlier review; the asynchronous import issue was found in this pass.
- This reviewer ran deterministic Node probes only; parent review owns browser, build and full-suite execution. Actual sample fidelity, physical iPhone autoplay/background behavior and wall-clock performance were not independently measured here.
- Entire-cycle audio scheduling and repeated per-frame note/pedal derivation deserve performance measurements on large scores, but no measured regression is established, so they are not findings.
- No next app was reviewed in this pass.
