# Independent review corrections

Parent: `review/08-cloud-sharing-proposal` (`859fd7b`). Fix branch: `review/09-review-fixes`, published as [PR #10](https://github.com/Raul-MA/daily/pull/10) after PR #8. The original pinned independent review remains in the original workspace's `reports/branch-review/`; its twelve findings are historical and are not rewritten as passing on the original code.

| Finding | Correction | Acceptance |
| --- | --- | --- |
| TB-1 | Original template picker selects Settings before revealing the recovery-gated preview; preview/cancel never saves. | [Time Budget cases](../modules/time-budget/e2e/review-fixes.spec.js) |
| TB-2 | Section navigation selects a visible heading outside the closed phone drawer. | Same running-plan focus case |
| PI-1 | Identified import/title/correction forms use shared dirty tracking, disclosure/focus and language-remount preservation; saving clears the consumed form. Drafts cannot cross exercise/variant identities. | [Piano browser cases](../modules/piano/e2e/player-review.spec.js) |
| PI-2 | Repetitions fill the full 150 ms lookahead, retaining audio-clock catch-up. | [Piano unit cases](../modules/piano/test/player-review.test.mjs) |
| PI-3 | File/drop imports share request identity, generation and disposal guards before mutation. Stale read failures are ignored; current read/validation errors propagate. | Piano deferred-read/browser and current-error unit cases |
| PI-4 | Tick-map deduplication replaces quadratic scans; mode/range grids extend only the current scheduling horizon, without duplicate count-in/metronome clicks. A sequence exceeding 4096 clicks in a window fails explicitly. | Piano grid/horizon/density/count-in unit cases |
| PI-5 | Spanish explanations cover shape/reference/syntax/library and authored audio failures while preserving canonical paths and user identifiers. | Piano Spanish file/paste validation case |
| PI-6 | Changing the correction note retains its disclosure and selector focus. | Piano correction selector case |
| PI-7 | Successful imports reveal and focus the heading in document scroll. | Piano bottom-import case |
| SH-1 | Focused skip link sits above the fixed sidebar. | [Shared cases](../tests/e2e/review-fixes.spec.js) |
| SH-2 | Storage recovery clears drawer state and releases document scrolling. | Shared recovery scrolling case |
| SH-3 | Modified/nonprimary same-route clicks retain browser semantics and leave the drawer open. | Shared cancellation/modified-click case |

## Evidence and limits

Existing source assertions remain unchanged. New Time Budget/browser acceptance was recorded before fixes. The five original Piano unit callbacks failed before implementation; their compact named transcript replays unchanged parent transport/timing/scheduling sources, with the same callbacks and an added grid-cardinality assertion to avoid a 10,000-line array diff. The density fixture uses 10,000 ticks to bound old quadratic work; the original independent review retains its larger bounded-worker reproduction. The sixth unit contract guards current import validation errors. Piano browser red has five failures and one already-passing identity-isolation case.

The environment restart removed the first temporary worktree before commits. Its lost transcripts are not final evidence. The patch/tests were reconstructed in persistent storage, red was rerun, and local checkpoints now preserve the work. The complete [verification record](review-fixes-verification.json) and [transcript](review-fixes-verify.txt) pass 326 unit / 212 native browser cases, both retained Piano scripts, lint, 829-file syntax and the 709-asset build. [Progress](../docs/progress.md) records publication status.

The density error is a scheduling limit rather than an import-schema change. Original eager musical-note scheduling and timing assertions remain intact. Physical iPhone/audio, authenticated API, installed-worker coexistence and deployment acceptance remain deferred.

## Documentation and logs

The parent reviewed the specialist's exact removal/retention list before edits, including after reconstruction. See [documentation audit](documentation-audit.md) and its compact removal manifest. Merged duplicate deployment guidance, corrected current policy/status facts and retired 270 obsolete logs. Baseline/red/source mappings and manifest-backed evidence remain protected. Redundant current green transcripts are consolidated into the complete final gate. Four new behavioral-red captures remain.
