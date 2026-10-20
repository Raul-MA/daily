# Piano independent reproductions

Parent verification uses head `859fd7b0f1365f90cbef22b0975f612580580e2c` in its isolated archive. Browser contexts are disposable and fixtures synthetic. Runtime source is unchanged. Specialist reports contain file coverage and detailed findings.

## Draft preservation and update tracking

Chromium probe `/tmp/daily-review-piano-probe.mjs`, exit 0: open Exercise player, paste the documentation exercise JSON, then select Español. Before remount: textarea length 1885, nearest form absent, `[data-unsaved=true]` absent. After remount: textarea length 0. `controls.js:4` supplies the importer outside a form; rename/note-correction controls have the same integration omission. Shared draft capture and update safety inspect marked forms, so these controls do not participate.

## File import continues after navigation

The same Chromium probe overrides `File.prototype.text` for one synthetic file with a deferred promise. Select `slow.json`, navigate to Home, then release its read. The active route remains `#/`, yet persisted `modules.piano.data.playerLibrary.selectedId` becomes `late-after-navigation`. Real `changeField`/library Node probes independently reproduce a commit after `ctx.disposed=true`.

`page-actions.js:97` and the drop handler in `page.js` invoke import after awaiting file contents without a request/disposal check. Use a request identity and disposal guard before persistence and rendering, including the drop path.

## Short loop repetitions are unscheduled

Parent independently ran the specialist's real transport probe `/tmp/piano-review-clock.mjs`, exit 0, with a controllable audio clock and a validated 10-tick loop at 120 BPM. Initial note windows were `[0, 0.0052083333]` and `[0.0052083333, 0.0104166667]`. Pumping at 0.025 seconds added only `[0.025, 0.0260416667]`; snapshot repetition was 5. The interval from 10.4167 to 25 ms was unscheduled. `transport.js:27` appends one successor instead of filling the lookahead horizon.

## Dense subdivision expansion blocks playback

Parent independently ran `/tmp/piano-grid-review-probe.mjs`, exit 0. This 473-byte JSON validates with no errors:

```json
{"schemaVersion":1,"id":"dense-grid","title":"Dense grid","ticksPerQuarter":15360,"defaultVariantId":"v","tracks":[{"id":"t","name":"t"}],"variants":[{"id":"v","name":"v","lengthTicks":1966080,"tempoMap":[{"tick":0,"quarterBpm":120}],"timeSignatureMap":[{"tick":0,"numerator":32,"denominator":1}],"measures":[{"id":"m","label":"1","startTick":0,"endTick":1966080}],"notes":[],"subdivisionRegions":[{"id":"r","startTick":0,"endTick":1966080,"stepTicks":1,"labels":["1"]}]}]}
```

`clickGrid()` expands 1,966,080 tick positions and calls growing-array `.some()` for each candidate (`timing.js:48–50`), roughly quadratic work. The bounded worker was still incomplete after 1500 ms and was terminated; no completion time or full browser freeze duration is claimed. `schedule.js` calls this synchronously even for beat-only metronome mode, before filtering to the selected loop. On the UI thread it prevents interaction during expansion. Bound expansion and scheduling work, avoid quadratic deduplication, and generate only the necessary range/mode.

## Spanish validation errors

Additional mounted Chromium probe: after selecting Español, submit `{}` through the importer. The Spanish interface reports `$.schemaVersion: required`, `$.id: required`, `$.title: required`, `$.defaultVariantId: required`, `$.tracks: required`, and `$.variants: required`. Schema field identifiers can remain canonical; the authored explanation is still English. The error handler in `page.js:9` passes the complete concatenated error to `copy()`, whose dictionaries/patterns contain no matching player validation message.

## Limits

The first mounted probe used an incorrect dashboard selector and timed out after confirming draft loss; correcting the probe to `#dashboard` yielded the successful navigation/import reproduction above. This was a probe setup error. The costly-grid check ran in a bounded Node worker to avoid freezing the browser. These probes establish the specific issues; they do not certify unrelated audio/device behavior.
