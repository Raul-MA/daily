# Time Budget architecture and correctness review

Compared `main` (`1e1caae45edd6fe318dff5a997de8b108d0bb2d4`) with `review/08-cloud-sharing-proposal` (`859fd7b0f1365f90cbef22b0975f612580580e2c`). Inspected the exact snapshot `/tmp/daily-branch-review-20261018`; application source was unchanged.

## Confirmed finding

### P2 — Reveal the import preview when importing from Templates

Changed location: `modules/time-budget/src/sections.js:15-17` (panel selection hides the Settings ancestor).

With the Time Budget panel visible, expand Templates and choose a valid backup using its existing **Import templates** control (`src/template.js:88`). That control still calls `app.importTemplates(this)`. `backup-ui.js` reads and validates the file, then reveals `[data-time-import-preview]`, which is inside `.time-backup`. The new panel code keeps that entire Settings ancestor hidden while the plan remains selected. Nothing switches panels after file selection.

Consequently, selecting a template import appears to do nothing: the preview summary, recovery download and confirmation controls remain invisible. The user must independently discover and open Settings to finish an import initiated in Templates. Before the change, the backup section was visible beneath the plan.

Evidence: a Node probe imported the real `mountSections` and `importTemplates` functions with a minimal DOM adapter. After mounting the default panel and resolving a valid file, it reported:

```json
{"planHidden":false,"settingsHidden":true,"previewHidden":false,"previewReady":true,"previewHasHiddenAncestor":true}
```

The probe was run as `node /tmp/time-section-import-repro.mjs`. This demonstrates the real functions' visibility-state mismatch. The parent review subsequently confirmed the same problem in Chromium against the exact head snapshot: `preview.hidden=false`, closest menu-panel ancestor `hidden=true`, and preview visibility `false`, with the valid summary `1 templates · 0 active tasks · 0 countdowns`. The complete Time Budget suite nevertheless passed 23 unit and 23 browser cases. Revealing Settings when this path prepares a preview, or moving the import entry point into Settings, would make the flow reachable.

## Coverage

- Reviewed all eleven changed files: module Compass/behavior docs; five browser test/helper files; `setupKeyboardShortcuts.js`, new `sections.js`, `style.css`, and `view.js`.
- Read module working rules and traced `template.js`, form wrappers/draft capture and restoration, queue reconstruction, lifecycle initialization/disposal, delegated events, backup reading/confirmation/cancellation and countdown mounting/update intervals.
- Checked section switching against shared sidebar targets and `daily:show-section` dispatch. Switching changes visibility/UI memory without invoking save or pause; presentation intervals remain mounted and are disposed with the page.
- Traced selected-panel retention through the shared module UI object and language remount. Hidden plan detection prevents the Space timer toggle when visiting Countdowns/Settings. Existing shortcut behavior inside the active plan was otherwise retained.
- Inspected timer start/pause/update/completion and reallocation modal placement to assess effects of moving setup/timer DOM into their panel. Checked full-width CSS and hidden-panel override.
- Browser test changes retain underlying assertions while navigating to newly separated panels. The Templates import entry point is not covered by those changed tests.

## Limits and classification

- One confirmed introduced correctness finding above. No additional hypothesis is presented as a defect.
- No browser/build suite was run by this reviewer; parent review coordinates those checks. The Node probe exercises control flow/visibility flags, without an actual browser DOM.
- This is a scoped review of Time Budget changes and necessary dependencies, not an exhaustive audit of unchanged scheduling arithmetic or physical-device timer behavior. No next app was reviewed.
