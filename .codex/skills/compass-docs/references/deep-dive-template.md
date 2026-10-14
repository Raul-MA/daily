# Documentation templates

Use these as defaults. Trim rather than expand unless the extra detail changes how someone navigates or edits the code.

## COMPASS template

```md
# <Project> Compass

## Start Here
- Read `CLAUDE.md` first.
- Open the matching deep dive before editing complex subsystems.

## Commands
- `...`

## Key Files
- `<path>` -- why to read it first

## Deep Dives
- `docs/<name>.md` -- when to load it

## Non-Obvious Patterns
- repo-wide invariant or cross-cutting rule

## Documentation Rules
- when to update `COMPASS.md`
- when to create or update a deep dive

## See Also
- secondary references only
```

## Deep-dive template

```md
# <Topic>

## Problem

<One short paragraph or 2-4 bullets explaining why this subsystem exists and what can go wrong if misunderstood.>

## How It Works

### <Flow or invariant 1>
- key file(s)
- main rule

### <Flow or invariant 2>
- key file(s)
- main rule

## Gotchas

- edge case
- invariant
- coupling to another subsystem or test helper
```

## Style rules

- Prefer bullets when they carry the same meaning as prose.
- Put file paths where they help the reader choose the next file to open.
- Keep examples rare and short.
- Do not copy code unless the exact shape is the point.
