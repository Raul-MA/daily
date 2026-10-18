# Piano practice and source parity

## Behavior and boundaries

Toniq's lessons, exercises, theory, cards, music calculations, keyboard diagrams and audio run as native modules inside Daily. Guided practice continues elapsed time across navigation, hiding and restart; only explicit Pause stops its clock. Soft budgets show notices and never advance blocks or finish a session.

`service.js` owns version 1 of `daily:v1.modules.piano`: last exercise ID, practice, history and settings. Saves atomically synchronize the shared activity while preserving other modules. Starting another practice offers the existing unfinished session. Explicit Finish saves one history record and completes its activity; Course displays those records. Clock refreshes and navigation never save; automatic question changes are explicit persisted transitions.

`practice-clock.js` reconstructs total/current-block elapsed time from timestamps. Prompt pacing belongs to visible presentation: hidden/absent views do not replay missed questions. A visible automatic question change is a persisted transition, so its prompt/reveal state survives reload. Explicit pause preserves the pacing remainder. Navigation may discard unsaved sub-question countdown progress, while retaining the saved question and answer. `persistent-prompt.js` generates stable questions from the saved practice ID/index using the original musical generators.

## Routes and presentation

`js/app.js` dynamically loads catalog destinations. `js/router.js` maps source paths into `/piano`, `/piano/library`, `/piano/learn?lesson=<id>`, `/piano/exercises/<stable-id>` and `/piano/reference/<stable-id>` under the shared hash router. A running-activity link includes the practice ID; obsolete IDs cannot accidentally open a newer practice. Random selection alone never saves; opening an exercise remembers its catalog ID without creating practice.

`view.js` owns asynchronous loading, scoped navigation/search, link rewriting, focus and disposal. `ui-drafts.js` restores dirty forms and disclosures after a language remount; practice draft restoration rebuilds derived budget/validation displays. Service revision guards retain drafts on conflicts. Failed saves retain the primary document and restore truthful running/pacing controls.

Source CSS is scoped to `[data-module="piano"]`. Audio/diagrams are local assets covered by the generated shared worker inventory. Piano never installs a private worker. Component disposal removes listeners and presentation timers without pausing the persisted session.

Piano content grows with the document: the shared header, app and footer use one page scroll and the same app background. `#app-shell` and `#page-content` must not impose a viewport height or a separate vertical scroller. Search results and horizontal keyboards/timelines retain their bounded scrolling.

## Tests and remaining acceptance

Source: Toniq commit `3fc564302b2c10642315d97a603aeba3c73a6ed0`; file hashes/destinations are in `reports/piano-source-map.json`. The original 41 unit cases and both original browser scripts remain, with explicit baseline/native route and asset adapters. Four Markdown characterization cases, eight service cases four localization contracts and one nested restore contract bring the unit total to 58. Fourteen native browser cases cover continuation, hidden prompts, offline use, history, drafts, stale activity links, failed saves, EN/ES presentation and all 44 destinations at 320px.

Original automatic pause-on-hide and loss-on-navigation expectations intentionally become continuation assertions. All musical, keyboard, reveal, timing-budget and cleanup assertions remain. The old worker inventory checks the generated single-worker assets in native mode and the original worker in baseline mode.

Physical iPhone acceptance and the final whole-PWA audit remain final gates. Local browser clocks do not establish installed-device acceptance. Current test evidence and exact next work are maintained in `docs/progress.md`.

## Language and transient exercise state

`i18n.js` resolves owned authored copy, parameterized questions and accessible labels. `localized-lessons.js` clones the lesson presentation while retaining IDs, roots, recall data, keyboard definitions and links. Nine theory Markdown modules use translated formatted blocks with the original links and notation. Search matches both English aliases and accent-insensitive Spanish labels. Saved canonical prompts, music formulas, note spelling, numeric offsets and user-entered text are not rewritten. Home translates only exact authored lesson titles; custom activity names remain verbatim.

`exercise-state.js` captures ordinary question/reveal/mode state, filter values, pacing input and the running presentation timer on disposal. The shared shell retains this in-memory object across language remounts and replaces it on route changes. Progression generation retains its chords and selection. Audio is canceled and never resumes automatically. These snapshots do not create persistence writes; guided practice remains controlled by the timestamp service. Active filter types and mode buttons must agree with restored state.

Four source parent-key descriptions are corrected from “above” to “below” (Dorian, Phrygian, Lydian and Mixolydian); a transpose-based contract verifies their existing C-major examples. Numeric musical calculations are unchanged. Original source hashes remain provenance, not claims of byte identity after the native split/localization.

`prompt-validation.js` validates each persisted keyboard tone using the original note/voicing calculations before display. Null/unknown notes, malformed offsets and pitches outside MIDI 0–127 reject, without regenerating or replacing saved questions. Timestamps and elapsed counters remain finite, nonnegative and within the JavaScript Date range. The nested restore contract fails before implementation (`piano-nested-validation-red.txt`) and accepts every lesson prompt plus legacy saved wording after the correction.

The [imported exercise player](exercise-player.md) is a separate Library destination with an initially empty user collection. Its twenty domain/integration checks and five mounted browser checks bring the current Piano totals to 78 unit and 19 browser cases. Its audio pauses on hide and cancels on navigation, independently of guided session continuation. Optional player content/preferences participate in the existing Piano service validation and Daily backup; IndexedDB score blobs remain separate.
