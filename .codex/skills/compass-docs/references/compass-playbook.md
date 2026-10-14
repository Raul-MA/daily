# Compass playbook

Use this reference whenever you need to create or restructure a repo's `COMPASS.md` and its deep-dive docs.

## System contract

- `COMPASS.md` is the entry router, not the full manual.
- Deep dives hold the complexity.
- Each concept should have one obvious home.

If a reader can answer "what should I open next?" from `COMPASS.md`, it is doing its job.

## When to update only `COMPASS.md`

Update only `COMPASS.md` when the main need is:

- better navigation,
- corrected file paths,
- clearer read order,
- a new one-line summary for an existing deep dive,
- or removal of stale references.

Do **not** add a new deep dive just because a feature exists.

## When to create or expand a deep dive

Create or expand a deep dive when a subsystem has at least one of these traits:

- multi-step data flow across several files,
- state coordination between server and client,
- non-obvious sequencing,
- indexing or ordering rules,
- timezone or date-boundary logic,
- optimistic update plus persistence plus refresh behavior,
- concurrency guards,
- rendering rules that depend on invariants,
- tests with special setup or failure classification.

If the topic can be explained as "open this file and follow the component tree", keep it out of a deep dive.

## Token discipline

- Favor short bullets over narrative paragraphs.
- Name the key files; do not enumerate entire folders.
- Skip obvious framework boilerplate.
- Explain invariants and breakage modes before examples.
- Reuse an existing doc if the mental model is the same.
- Delete overlap when consolidating. Two mediocre docs cost more than one good one.

## Good `COMPASS.md` content

Good content:

- quick commands,
- read order,
- deep-dive index,
- non-obvious repo-wide patterns,
- "see also" links for secondary material.

Bad content:

- long architecture essays,
- repeated explanations already present in deep dives,
- giant route inventories,
- low-value component lists,
- step-by-step implementation detail that belongs in a deep dive.

## Good deep-dive content

A good deep dive answers:

1. What problem does this subsystem solve?
2. How does data or control move through it?
3. What invariants or edge cases are easy to miss?
4. Which files should someone open first if they need to edit it?

## Maintenance checklist

Before finishing:

1. Remove stale paths.
2. Merge overlap.
3. Ensure `COMPASS.md` points to every deep dive worth loading first.
4. Ensure each deep dive justifies its existence.
5. Keep section titles stable unless a rename clearly improves navigation.
