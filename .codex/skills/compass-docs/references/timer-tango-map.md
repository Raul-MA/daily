# Anori map

Load this when using the `compass-docs` skill in this repository.

## Core runtime flow

- `app/timer/page.tsx` is the SSR entrypoint for the main timer screen.
- It fetches session-gated data through server actions, then hands runtime state to `app/timer/_components/TimerContainer.tsx`.
- `TimerContainer.tsx` owns most client-side orchestration: optimistic task state, calendar drawer state, keyboard shortcuts, weekly progress refresh, session guards, and app-shell menu integration.
- Persistence flows through `app/timer/server-actions.ts` and related server-action files.

## Current deep-dive inventory

- `docs/time-slots.md` -- calendar slot math, scheduling, fragments, midnight splitting
- `docs/weekly-objectives.md` -- progress aggregation with descendant tags and timezone clamping
- `docs/tag-hierarchy.md` -- hierarchical tags and descendant expansion
- `docs/keyboard-shortcuts.md` -- shortcut guard layers and focus behavior
- `docs/session-guards.md` -- minimum-duration and concurrency refs
- `docs/app-shell.md` -- shared authenticated layout and route-aware navigation
- `docs/playwright-tests.md` -- e2e prerequisites, selectors, known-issue markers

## Repo-wide rules worth surfacing in docs

- Read `CLAUDE.md` first; it defines the repo workflow and docs-maintenance contract.
- UI copy is Spanish.
- `data-testid` selectors are preferred in Playwright unless text itself is the behavior under test.
- Timer behavior depends on SSR fetch -> `TimerContainer` runtime state -> optimistic client update -> server action persistence -> realtime refresh.

## When *not* to add a new deep dive here

Usually keep topics inside `COMPASS.md` only if they are simple route maps or shallow entrypoints.

Do not create a new deep dive for:

- a single page with obvious data flow,
- a mostly presentational component group,
- or a subsystem that can be explained in one `COMPASS.md` bullet.

Create one when edits would otherwise require re-reading several files to recover the same mental model.
