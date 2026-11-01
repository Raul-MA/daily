# Dashboard reading refactor

## Accepted behavior

Reader chooses once each local day using saved settings, retains that selection through reloads and offers Pick again. Each item shows title, author/source, estimated time and Open in Reader. Readwise presents one highlight with Previous/Next, progress, explicit final completion, persisted position and a completed state with Revisit highlights. Older reviews must not be represented as today's review. The user explicitly approved showing the latest review, labeled Latest available review with a smaller date-unverified note, after the public API's missing review date was explained.

This explicitly replaces the navigation-only dashboard rule for Reader selection and explicit review controls. Card headings still navigate without completing anything. Other apps retain their existing contracts. No remote changes are authorized by this task.

## Visual plan

Use Daily's established palette: canvas #f2f2f7, surface #ffffff, ink #1c1c1e, detail #68686e, action #0067d8 and review accent #af52de. System sans-serif supports navigation and document titles; Georgia gives the highlight the reading emphasis already used by Reading. Titles use bold 17px, highlights 22px with generous leading, details 12–13px and controls 14px semibold. All content is left aligned.

Retain the accepted responsive three/two/one-column layout and saved widget order. Cards align at the top so a long highlight does not create empty space in neighboring cards. The review's source precedes its quotation; progress and Previous/Next sit beneath it. Reader is a divided list of titles, details and opening links. Secondary refresh and app navigation are visually quieter. Minimum 44px controls, visible focus, natural document scrolling and wrapping at 320px are required.

```text
Readwise                     Reader
Source title                 Today's reads          Pick again
Author                       Bold document title
                             Author / source
Large, readable              Reading time
highlight text               Open in Reader
                             -------------------------------
1 of 5                       Bold document title
Previous       Next          Details and opening link
```

## Critique before implementation

Avoid a generic hero, decorative statistics, new card colors or a replacement dashboard theme. The hierarchy comes from real reading content, typography and action placement. Preserve the recognizable app badges and existing dashboard geometry. No images or motion are needed.

## Acceptance changes before implementation

Keep existing source assertions. General's no-dashboard-buttons assertion applies to a disconnected dashboard; connected reading cards now have authorized controls. Add unit coverage for local-day selection reuse, empty selections, concurrency/error retry, settings changes and account-scoped review position. Add browser coverage for automatic configured picks, stable reloads/day rollover, highlight navigation/reload/completion, unavailable reviews, error recovery and responsive hierarchy.

## Visual review

Inspected synthetic-data screenshots at 390px and 1280px; browser assertions also check 320px. Reader titles are visibly bolder/larger than author/source/time details; links remain distinct from supporting text. Artificial minimum card heights were removed after the initial phone capture showed unnecessary empty areas. Source text remains readable with long wrapped titles and no horizontal overflow. The independent review component shows the intended bold source, small author, 22px serif quotation, small progress and grouped Previous/Next controls.

Initial local ignored evidence: `reports/dashboard-reading-phone.png`, `reports/dashboard-reading-desktop.png`, `reports/dashboard-review-component-phone.png`. The last image was component-only acceptance while the date clarification was pending. The approved latest-review policy now enables the actual Home card; updated dashboard integration acceptance captures the complete page at 320/390/1280px. No live token response or personal backup was used.

The initial checkpoint passed General 85 unit / 43 browser cases, Reading 60 unit / 38 browser cases, strict lint, 850-file syntax and the 724-asset build. The approved policy replaces the undated-review hiding assertion with honest-label/content assertions, replaces the separate component mount with dashboard navigation/completion acceptance, and adds refresh/completion failure recovery cases. Reading discovery is now 60 unit / 40 browser cases. See root progress for current evidence.

Final review: the actual Home card now displays the latest review with a smaller unverified-date note above the bold source, small author, large serif passage and grouped Previous/Next controls. Phone and desktop screenshots were inspected; all 320/390/1280px overflow checks pass. Final ignored artifacts are `reports/dashboard-readwise-latest-phone.png` and `reports/dashboard-readwise-latest-desktop.png`. General passes 85 unit / 43 browser cases; Reading passes 60 units and all 40 browser cases across the interrupted primary run and four-case continuation. The four actual dashboard cases pass again after the lint-only rendering extraction. Strict lint, syntax and the 724-asset build pass. Root progress documents the interruption and complete case coverage.

Production checkpoint: the user confirmed real Reader/review/completion integration and requested removal of the visible testing/preview label before committing. The footer's preview element and both language strings are removed; its alignment regression now checks saved-status/system information and retains the original tolerance. Full verification passes 332 units / 229 native browser cases plus both Piano smoke scripts; final General verification additionally passes 85 units / 43 browser cases after the footer change. The final bundle audit excludes mock reviews, fixture credentials and preview-label strings. Updated ignored screenshots are `reports/dashboard-production-phone.png` and `reports/dashboard-production-desktop.png`. Personal backups and all screenshots remain outside the commit.
