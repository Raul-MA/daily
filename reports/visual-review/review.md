# Sequential visual review

Interview: preserve each app’s identity; iPhone first, then narrow screens and desktop. Repair spacing, alignment, typography and controls. Propose major layout changes before implementing them. Automated test suites remain stopped.

Capture sizes: 390×844, 320×844 and 1280×900. Screenshots are local ignored PNG artifacts beside per-app JSON manifests. Fixtures are synthetic, isolated from personal backups. These browser captures are visual evidence, not passing regression suites or physical-device validation.

## Daily / shared shell

Direction: retain iOS grouped surfaces and the system font. Existing palette: background `#f2f2f7`, surface `#ffffff`, text `#1c1c1e`, secondary `#68686e`, link `#0067d8`, divider `#e3e3e8`. Keep full-width pages, left-aligned headings and established card hierarchy.

Before: Home, Daily settings, missing-page screen, phone/desktop navigation and connection diagnostics captured at all three widths (15 screenshots). No horizontal overflow. Visual findings: language buttons and reorder buttons have undersized touch targets; programmatically focused page headings display a full-width blue frame; backup headings and empty status margins create inconsistent spacing.

Changes: 44px language/reorder targets, restrained page-heading focus treatment with control focus retained, consistent backup heading/status spacing. All five screens recaptured at all three widths (15 after screenshots); no overflow. Home, hub, missing-page, drawer and diagnostics screenshots inspected.

Additional checklist states: collapsed desktop navigation, unreadable-root recovery, full-backup preview and Spanish settings captured before and after at all three widths. Recovery copy now has comfortable line height and its standalone status footer has matching gutters; backup record counts use readable leading. No horizontal overflow in the captured states.

## Plants

Direction: preserve warm botanical surfaces (`#F5F0E8`, `#FDFAF5`), leaf greens (`#8B9E7A`, `#4A6741`), text `#2C2C2C` and divider `#E0D9CE`. Retain Georgia page headings and system body text, full-width single-column plant rows and grouped care controls. Assess form rhythm, label/control spacing, settings cards and inline care interactions before changing styles.

Plants findings: all five routed screens plus empty collection, expanded care log/reschedule/skip, history edit, guide, deletion/import/refresh dialogs, selected template, invalid import and Spanish long-name/settings states inspected. Repairs: 44px/16px form controls, borderless usable rating targets, clearer settings rhythm, separated action buttons, centered bounded dialogs, wrapping narrow history table and readable guide measure. All routed and additional section states recaptured and inspected: 54 before / 54 final screenshots across 390/320/1280px, no document overflow. Final captures include the approved compact Running row and matched 20px phone/36px desktop gutters.

## Remaining sequence

Plants → Coffee → Games → Time Budget → Piano → Reading → WhatsApp. Inspect every registered route, then app-specific panels/dialogs and representative empty/active states. Record each app’s direction, findings, fixes and after-capture measurements before proceeding.

Major proposal approved and implemented: one expandable Running count on iPhone, full activity links on desktop. Six collapsed/expanded screenshots inspected across the three widths; destinations and timestamp refresh are preserved. The original full-list baseline remains in Daily before screenshots; updated final Running states are in `daily/after/states.json`. Automated acceptance remains unrun.

## Coffee

Direction: retain Crois’s printed coffee-log character: paper `#f0efea`, alternate paper `#e7e1d4`, ink `#050505`, muted `#6f6b63`, rules `#c9c4b8`, accent `#ff4b33`. Preserve Georgia display, system UI and monospace measurements. Refine rhythm and aligned controls rather than replacing the existing panels, scoring presentation or forms. The 15-section task inventory exists before capture/analysis.

Coffee findings and applied refinements: remove doubled gutters/excess trailing padding; preserve printed form structure while improving small controls, label size, score output width, long bean rows, narrow metrics and empty-insight typography. Import dialogs now share Coffee’s palette/type, bounded dimensions and separated buttons. Seven routes plus nine extra states captured and inspected before and after (48 screenshots each), with no document overflow. The final Spanish bean row keeps the full name readable above equally aligned actions; light/dark settings retain their palette. Import confirmation is visibly disabled until the existing recovery gate is met.

## Games

Direction: retain the score ledger’s cream/white surfaces (`#f8f7f3`, `#ffffff`, `#efeee8`), ink `#171717`, line `#dedbd2` and deep-green accent `#1f4f46`; preserve its system typography and orange game-piece cues. Prioritize aligned scoring fields, comfortable form rows, responsive player/game actions and consistent themed dialogs. The 19-section checklist precedes review.

Games findings: persistent backup toast overlays headings and Finish; statistics lack inter-section rhythm, small scoring controls miss touch-target size, phone compact facts form 3+1 columns, and import previews are unthemed. Applied scoped CSS fixes: in-flow backup notice, non-blocking temporary toast placement, matched page gutters, 44px scoring actions, paired compact metrics, section spacing and bounded themed import dialog. The native Finish confirmation is observed/dismissed with text metadata; it cannot appear in a page-only screenshot. Final section captures inspected: 66 before / 66 after screenshots. A final narrow-screen measurement caught the session grid expanding beyond its content gutter; min-width constraints now keep Finish aligned. Native confirmation chrome remains the documented screenshot limitation.


## Time Budget

Direction: retain the focused timer identity: canvas `#f7f7f4`, ink `#171917`, white `#ffffff`, soft `#f0f1ec`, lime `#d8ff5f` and danger `#d3483f`. Preserve system sans typography, circular remaining-time display and ordered setup panels. Match outer gutters, keep text readable inside the existing hierarchy, and separate backup controls without changing timer behavior. The nine-section checklist predates this review; queue editing and invalid imports are additional captures.

Time Budget findings: template-name fields collapse on phones, row actions are undersized, backup controls touch, and the generic danger-button class clips the overdue deadline. Scoped CSS restores gutters, gives phone task names a full row, expands template controls, pairs countdown actions, and separates backup/recovery controls. Timer calculations, imports and stored sessions are unchanged. All listed sections inspected across 45 before / 45 final screenshots, with no document overflow. Error notices now sit clear of shared navigation.


## Piano

Direction: preserve Toniq’s quiet music-workbook presentation: warm canvas `#f8f7f3`, white `#ffffff`, soft `#f0f1eb`, ink `#242b28`, green `#23685d` and rules `#dce0d7`. Retain system type, monospace musical values and bounded horizontal keyboards/timelines. Match shell gutters and form rhythm while preserving musical content, exercises and the existing lesson/library structure. The 67-section inventory includes every routed destination before analysis.

Piano initial findings: Settings uses default browser form styling; desktop app gutters differ from the shell; small course/library links and some fields miss 44px targets; mode controls touch the header divider. Scoped CSS repairs are prepared. Theory/table/keyboard structure and musical content are retained. Route/state capture and final inspection remain in progress. Strict lint and 842-file syntax pass; test suites remain paused.

Piano interactive findings: practice prompt/reveal/pacing/pause/completion are well structured and retain their layout. The imported player has an empty-error gap, short fields, native fieldsets and cramped import/attachment labels. Scoped CSS now matches its fields/track groups to Toniq and pairs Pause/Stop below a full-width phone Play action. Timeline geometry, audio, loops, musical data and storage logic remain untouched.

The final settings screenshot exposed higher-specificity Piano-only fallback rules in the shared shell. Those rules are removed so Piano owns its form presentation consistently; no other app selectors change. The settings destination will be recaptured after the correction.

Piano completion: all 59 routes and 14 additional states inspected before and after (219 captures per phase, plus 12 final focused crops), with zero document overflow. Final refinements also separate acceleration/export controls and align desktop management fields. The full-page capture position is normalized so a sticky sidebar is not misrepresented after clicks below the fold. All 67 checklist sections are complete; no musical or timer logic changed.


## Reading

Direction: preserve the restrained reading surface: canvas `#f7f7f5`, white `#ffffff`, ink `#181816`, muted `#73736d`, line `#deded8` and soft `#ecece7`. Keep the picker’s system sans and large heading, and the Daily Review’s Georgia highlight with its existing fixed action bar. Refine gutters, control alignment, dialog/forms and reading space without changing the accepted review layout. The 12-section checklist is present before capture/analysis. API responses and credentials are synthetic; no live Readwise request is needed.

Reading findings: mismatched top review link/button height, undersized reorder/checkbox targets, empty status gaps, touching wrapped import buttons and duplicated viewport minimums in the shared shell. Scoped CSS restores app gutters, a restrained settings heading, 44px targets, readable wrapped buttons, bounded dialogs and separated recovery controls. The serif highlight and fixed action-bar geometry remain. All 63 baseline route/state captures exist, including dialog scroll sections and a long-review bottom viewport. Final capture/inspection is next.

Reading completion: all 12 inventoried sections are inspected across 63 before / 63 final captures, plus focused backup/feedback crops, with no document overflow. Long-review and expanded-feedback bottom viewports confirm toolbar/footer clearance. Secondary review actions match in height; feedback aligns in two phone/four desktop columns. Empty status gaps and redundant viewport minimums are removed. Review errors reuse the existing error style. No live API, review-completion or token-storage behavior changed.


## WhatsApp Later

Direction: retain the quiet reminder composer: canvas `#f6f5f1`, soft controls `#eeede7`, ink `#272e29`, muted `#70766e`, divider `#dddfd6` and green `#426b51`. Keep system typography, the single-column composer and paired date/time fields. Inspect form rhythm, settings/backup controls, validation, long names/messages, copy fallback and the system dark palette. The nine-section inventory precedes review. Synthetic recipients/messages only; no Things task or WhatsApp message is created.

WhatsApp completion: all nine inventoried sections are inspected across 36 before / 36 final captures, including manual copy, expired time, invalid import, recovery-ready controls, Spanish long text and dark views. Scoped CSS removes excess top space, matches shell gutters, separates backup/import actions, themes the file control and improves preview leading. Below 360px date/time stack to preserve complete native values; at 390px their proportions keep both fields readable. No document overflow. URL, draft, handoff and import behavior are unchanged; no real Things/WhatsApp action occurs.

Final local checkpoint: every app checklist is complete. Final manifests contain 564 route/state screenshots, plus focused section crops. Strict lint, syntax and copy-only build checks are recorded in progress; automated suites were stopped during capture; the subsequent [full-suite results](full-suite-results.md) record passing regression coverage. Physical-device/live API acceptance remains deferred. No remote work was performed. After resumed verification passed, the user authorized committing the local review and evidence.
