# Keyboard diagram

`src/js/components/keyboard-diagram.js` exports the pure HTML renderer `drawKeyboard(options)` and the compatible adapter `buildKeyboardDiagramHTML(tones, options)`. It owns drawing and accessible descriptions; music formulas, register choices, audio, and reveal state belong to callers.

## Inputs

- `notes`: strings for repeating pitch classes, or `{ note, octave?, degree?, label?, role? }`. An explicit scientific octave selects exactly one physical key. C4 and C5 are distinct; Cb4 selects B3 and B#4 selects C5.
- `startOctave` (default 4) and `octaves` (default 1): a fixed C–B span of 1–8 complete octaves.
- `range`: inclusive `{ start: { note, octave }, end: { note, octave } }` white-key boundaries, overriding the complete-octave settings. Exact notes must fit. Ranges stay within MIDI 0–127.
- `keyLabels`: `none`, `highlighted` (default), or `all`.
- `showLegend`: visible by default; false retains the description for assistive technology.
- `label`: accessible figure title and visible caption.

Labels, degrees, and role strings are escaped. Roles are semantic styling hooks, such as root, bass, source, target, left-hand, or right-hand. The renderer preserves spelling and metadata without interpreting chord formulas.

## Placement and automatic range

`src/js/music/notes.js` supplies `noteToMidi`, `getKeyboardVoicing`, and `getKeyboardRange`.

`getKeyboardVoicing(tones, { root, startOctave = 4 })` returns `{ tones, startOctave, octaves, range }`. Explicit tone octaves take precedence. With a root, supplied semitone offsets preserve compound intervals and chord extensions. Otherwise, note order is placed ascending, suitable for bass-first inversions. Neither helper nor renderer mutates inputs.

`getKeyboardRange(exactTones)` fits the lowest and highest pitches with one neighboring white key on either side. A4 starts at G4; C4 starts at B3; C#4 starts at C4. MIDI boundaries clamp padding. Empty input defaults to C4–B4. This removes unused leading octaves without changing the musical register. Each voice-leading diagram fits its own notes while preserving their exact pitches.

```js
const keyboard = getKeyboardVoicing(getChordTones('A', 'maj7'), { root: 'A' })
const html = buildKeyboardDiagramHTML(keyboard.tones, keyboard)
```

Exercises pass structured keyboard configurations to `buildExerciseCardHTML`. Diagrams appear only after reveal and sit outside the flashcard button. The progression generator displays them immediately. Guided recall and application use the same component and placement helper. Their domain payload is `keyboard: { tones, root?, startOctave? }`; root-relative formulas specify their actual harmonic root, bass-first voicings omit it, and explicit tone octaves override placement. Tone ordering never implicitly supplies the harmonic root.

## Presentation

The drawing is hidden from assistive technology; captions list the spelled notes, exact octaves, and degree/role labels. Selected keys have dots as well as color. The focusable scroll region accommodates genuinely wide voicings on small screens. Width derives from the actual white-key count; black keys are positioned at white-key boundaries. There are no listeners or cleanup requirements in the renderer.

Shared spelling uses `spellInterval(root, semitones, degree)` from `src/js/music/notes.js`; signed offsets and degree letters determine accidentals, including double accidentals. `transpose()` retains chromatic spelling behavior. `applyInterval()` defaults to diatonic spelling, with explicit `useFlats` retaining chromatic overrides.

Adapted from Toniq `3fc564302b2c10642315d97a603aeba3c73a6ed0`; routing and lifecycle changes are documented in [behavior](behavior.md).
