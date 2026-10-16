# Piano practice and source parity

## Behavior and boundaries

Toniq's lessons, exercises, theory, cards, music calculations, keyboard diagrams and audio run as native modules inside Daily. Guided practice continues elapsed time across navigation, hiding and restart; only explicit Pause stops its clock. Soft budgets show notices and never advance blocks or finish a session.

`service.js` owns version 1 of `daily:v1.modules.piano`: last exercise ID, practice, history and settings. Saves atomically synchronize the shared activity while preserving other modules. Starting another practice offers the existing unfinished session. Explicit Finish saves one history record and completes its activity; Course displays those records. Clock refreshes and navigation never save; automatic question changes are explicit persisted transitions.

`practice-clock.js` reconstructs total/current-block elapsed time from timestamps. Prompt pacing belongs to visible presentation: hidden/absent views do not replay missed questions. A visible automatic question change is a persisted transition, so its prompt/reveal state survives reload. Explicit pause preserves the pacing remainder. Navigation may discard unsaved sub-question countdown progress, while retaining the saved question and answer. `persistent-prompt.js` generates stable questions from the saved practice ID/index using the original musical generators.

## Routes and presentation

`js/app.js` dynamically loads catalog destinations. `js/router.js` maps source paths into `/piano`, `/piano/library`, `/piano/learn?lesson=<id>`, `/piano/exercises/<stable-id>` and `/piano/reference/<stable-id>` under the shared hash router. A running-activity link includes the practice ID; obsolete IDs cannot accidentally open a newer practice. Random selection alone never saves; opening an exercise remembers its catalog ID without creating practice.

`view.js` owns asynchronous loading, scoped navigation/search, link rewriting, focus and disposal. `ui-drafts.js` restores dirty forms and disclosures after a language remount; practice draft restoration rebuilds derived budget/validation displays. Service revision guards retain drafts on conflicts. Failed saves retain the primary document and restore truthful running/pacing controls.

Source CSS is scoped to `[data-module="piano"]`. Audio/diagrams are local assets covered by the generated shared worker inventory. Piano never installs a private worker. Component disposal removes listeners and presentation timers without pausing the persisted session.

## Tests and remaining acceptance

Source: Toniq commit `3fc564302b2c10642315d97a603aeba3c73a6ed0`; file hashes/destinations are in `reports/piano-source-map.json`. The original 41 unit cases and both original browser scripts remain, with explicit baseline/native route and asset adapters. Four Markdown characterization cases and eight service cases bring the unit total to 53. Ten additional browser cases cover continuation, hidden prompts, offline use, history, drafts, stale activity links and failed saves.

Original automatic pause-on-hide and loss-on-navigation expectations intentionally become continuation assertions. All musical, keyboard, reveal, timing-budget and cleanup assertions remain. The old worker inventory checks the generated single-worker assets in native mode and the original worker in baseline mode.

Full EN/ES authored content, combined recovery, stronger nested restore validation and physical iPhone acceptance remain final gates. Local browser clocks do not establish installed-device acceptance. Current test evidence and exact next work are maintained in `docs/progress.md`.
