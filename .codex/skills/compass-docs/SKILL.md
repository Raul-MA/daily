---
name: compass-docs
description: Create or update `COMPASS.md` and focused deep-dive docs when users ask for better documentation, architecture guides, onboarding docs, repo maps, token-efficient references, stale doc cleanup, or missing docs. Use this whenever work involves reducing documentation token cost, consolidating overlapping docs, deciding whether a topic deserves a deep dive, or keeping docs in sync with code changes.
---

# Compass Docs

Maintain a two-layer documentation system:

1. `COMPASS.md` is the router. Keep it short, scannable, and useful for choosing the next file to read.
2. `docs/*.md` are deep dives. Use them only for subsystems with non-obvious rules, invariants, or multi-step flows.

Read `references/compass-playbook.md` before drafting. In Anori, also read `references/timer-tango-map.md`.

## Default workflow

1. Read `CLAUDE.md`, the current `COMPASS.md`, and only the relevant docs under `docs/`.
2. Identify whether the request needs:
   - only a `COMPASS.md` refresh,
   - an update to an existing deep dive,
   - or a new deep dive for a genuinely complex subsystem.
3. Consolidate overlap instead of creating parallel docs that say the same thing.
4. Update `COMPASS.md` whenever:
   - a listed path changes,
   - the best read order changes,
   - a deep dive is added, removed, renamed, or materially repurposed.
5. If code changes alter documented behavior, update the affected docs in the same change.

## Writing rules

- Keep `COMPASS.md` high-signal and low-token. Prefer bullets over prose.
- Do not dump full file trees. Point to the next files the reader should open.
- Do not create deep dives for obvious CRUD or shallow UI work.
- Create or expand a deep dive when a topic has branching logic, invariants, sequencing constraints, timezone/date math, concurrency guards, indexing rules, or cross-file coordination that is easy to break.
- Prefer one source of truth per concept. Merge stale or overlapping docs rather than letting both survive.
- Call out gotchas, invariants, and read order explicitly.

## Required output shapes

For `COMPASS.md`, use the structure in `references/deep-dive-template.md` under **COMPASS template**.

For deep dives, default to:

- `# <Topic>`
- `## Problem`
- `## How It Works`
- `## Gotchas`

Add one extra section only when it materially improves navigation.

## Anori notes

When working in this repo:

- `COMPASS.md` should route readers to `CLAUDE.md` first, then the relevant deep dive.
- Existing deep dives already cover time slots, weekly objectives, tag hierarchy, keyboard shortcuts, session guards, app shell, and Playwright.
- Keep UI-language notes brief but explicit: visible UI strings are Spanish.
- Prefer repo-specific paths and code anchors over generic framework advice.
