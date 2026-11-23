# Wingspan base scoring and reports

## Problem

Provide a dedicated base-game Wingspan score sheet and per-player category reports without mixing Wingspan rules into generic round scoring. The user approved the architecture and local implementation, confirmed base-game scope and category reports, and requested the official five-player maximum. Multiplayer sessions support 2–5 players; solo Automa is outside this feature.

Rules source: [official Wingspan reference](https://wingspan.rulepop.com/#game-end-and-scoring), consulted 2026-11-23. Base scoring sums bird-card points, bonus-card points, end-of-round goal points, eggs, cached food and tucked cards. Each of the last three is worth one point. Most points wins; unused food breaks tied totals, then victory is shared.

## How It Works

### Ownership and layout

`modules/games/src/scoring/wingspan/` is the feature module inside Games. `index.js` exports its pure domain interface; the views and bindings are explicit UI entry points:

| File | Responsibility |
| --- | --- |
| `categories.js` | Stable category IDs, ordering and source labels |
| `scorecard.js` | Empty scorecards, immutable category updates and derived totals |
| `validation.js` | Payload version, participant/category identities, values and completion checks |
| `winners.js` | Highest total, unused-food tiebreak and shared victories |
| `statistics.js` | Pure aggregation of completed Wingspan scorecards |
| `scorecard-view.js` | Editable/read-only sheet, totals and tie input |
| `reports-view.js` | Category comparison and player breakdown |
| `bindings.js` | Scoped input handling through supplied Games callbacks |
| `copy.js`, `style.css` | Feature translations and scoped presentation |
| `index.js` | Public feature exports for Games integration |

Games retains player/catalog IDs, the one-active-session rule, session status/timestamps, activities, persistence, import/recovery, history navigation and common report controls. Wingspan owns its categories, scorecard, validation, winner calculation, reports and presentation. Domain functions accept data and return values/errors; they do not access storage, DOM or the shell. Views use the pure report builder and feature translations; DOM bindings receive the guarded Games commit callback through `frontend/app/bindWingspan.js`. Games calls the feature; the feature does not import Games session/statistics orchestration, avoiding cycles.

Integration is explicit at existing game normalization/editor, session creation/update/completion, `getTotals`/winner dispatch, session rendering, backup validation and Stats rendering. A direct mode branch selects this first specialized scorer.

### Data contract and lifecycle

- The normal Start Game screen selects the catalog game and players, then opens the dedicated sheet. Setup explains the 2–5 limit, disables unchecked players when five are selected, and session validation rejects a sixth player even outside the UI. Catalog normalization fixes these bounds for the profile.
- Explicit catalog scoring mode: `wingspan_base`. Never infer behavior from the game name. Selecting it requires competitive scoring and removes round-count/target settings.
- Each new session snapshots that mode. It stores `rounds: []` and a dedicated `scorecard` with `version: 1`, `profile: wingspan_base` and `players` keyed by participant ID.
- Each player record contains `categories` keyed by `birds`, `bonusCards`, `goals`, `eggs`, `cachedFood`, `tuckedCards`, plus `unusedFood` separately. Category values are nonnegative safe integers or `null` for not yet entered. Limit sums to safe integers too. Player/category identities must match the session/profile exactly.
- Values are category totals, not individual cards or round records. Birds/bonus/goals are points; eggs/cached food/tucked cards are counts with a one-to-one point conversion. Unused food never contributes to the total or category reports.
- Start creates the session and empty sheet through the existing atomic save/activity path. Category edits use that same path, revision checks and unsaved-draft handling. No duplicate store or report cache is persisted.
- During play, entered values produce a clearly marked provisional total. Blank is distinct from explicit zero. Finish requires all six entries for every player. If the highest totals tie, request unused-food counts for all tied leaders before resolving winners; preserve those counts for history/reopening.
- Read-only history uses the same sheet renderer. Reopening permits corrections, preserves timing and clears winners until completion. Totals are derived from the scorecard, never maintained as a second round/total field.
- Validators dispatch by the snapshotted mode. Generic round/outcome assertions remain applicable to their modes; Wingspan permits no rounds or outcome rows. Module and combined-backup validation both enforce the new payload contract before writes.
- Existing sessions and backups remain readable under their original modes. Editing a catalog game affects future sessions only. Old round sessions named Wingspan cannot supply category statistics and are not automatically converted. New backups preserve the scorecard/version; older app versions are not assumed to understand the new mode.

### Reports

Games Stats contains a dedicated Wingspan section backed by `statistics.js`, separate from generic cross-game records. The section reads only completed sessions whose snapshot mode/profile is Wingspan base and whose scorecard is complete. Active/reopened sessions are excluded until completed again. Existing generic wins, totals, duration and head-to-head reports use the same derived totals and saved winners as the score sheet.

Report controls: all Wingspan-base catalog entries or one selected game, and all players or one selected player. Filters whose IDs disappear after import fall back to all available records. Group by stable player ID, including archived participants; use saved name snapshots when a current record is unavailable. Display the completed-game sample size and coverage of historical sessions without category data.

For every player/category calculate:

- Total category points, average per completed game, and best single-game value.
- Share of recorded points: category sum divided by the sum of all six category totals across included games. A zero denominator displays no percentage.
- Largest average category, preserving tied categories, described as a scoring contribution rather than a strategy judgement.

Comparison uses side-by-side player breakdowns that stack on narrow screens. Each shows completed-game count, six category averages and labeled horizontal meters on a shared scale, plus exact category totals, bests and pooled point shares. The player filter focuses the same breakdown on one player. Reuse the existing Games visual language. EN/ES labels and decimal formatting follow the shared locale.

Examples of supported statements: “Ana averages 31.5 bird points over 4 games” and “Eggs contribute 22% of Luis's recorded points.” Sample sizes remain explicit. Reports do not claim how many birds were played or infer intentional strategy. Bird count would require an additional non-scoring field, outside this proposal.

## Gotchas

- Generic game normalization retains its existing optional-bound coercion; only Wingspan fixes the 2–5 bounds. Inline-created players remain unselected when all five slots are already taken.
- Unknown category data is not zero; explicit zero is valid. No historical category breakdown may be invented from a total score.
- Compare per-game averages by default, rather than cumulative totals that favor frequent players. Averages describe different games, not matched opponents or causal strategy effects.
- Aggregate point shares use pooled points, not an unweighted average of session percentages. Each included participant contributes once per session.
- Use the session profile, not current catalog settings or names, to select scoring and report behavior. Multiple Wingspan catalog entries can be combined only because they share this base profile.
- Keep rounding in presentation. Recompute reports from source history after edits/import/recompletion so stale aggregates cannot survive corrections.
- Original assertions remain. Add dedicated unit/browser files under the existing `modules/games/test/` and `e2e/` discovery scopes, named for Wingspan scoring and reports; do not silently relocate source tests.

## Validation and presentation

The implementation follows the approved test-first sequence. `test/wingspan.test.mjs` covers bounds, scorecard lifecycle, ties, validation, storage failures, generic statistics and both backup paths. `test/wingspan-reports.test.mjs` covers unequal game counts, pooled shares, category ties, zeros, archived-name fallback, filters, exclusions and correction recomputation. `e2e/wingspan*.spec.js` covers setup through history/reports, phone EN/ES, the sixth-player guard, quota failure, offline reload, language remount, correction and JSON restore. Existing assertions and test locations remain intact; [source mapping](../../../reports/games-source-map.json) owns discovery/evidence.

The score sheet retains Games' tokens: paper `#f8f7f3`, surface `#ffffff`, text `#171717`, muted `#6d6a63`, line `#dedbd2` and accent `#1f4f46`, with existing dark-theme variables and system type. Left-aligned category labels pair with right-aligned numeric fields and large totals. Player sheets sit side by side on desktop and stack on phones. Wingspan places the score sheet before timing controls and uses a static session heading so it cannot cover category fields. The feature stylesheet is imported once from Games' stylesheet; the static build includes it for offline use.

Verification evidence and the exact next step are maintained in [progress](../../../docs/progress.md). Work remains local; physical-device acceptance and publication are separate.
