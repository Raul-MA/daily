# Modulation examples and recognition

`src/js/music/modulations.js` exports reference descriptions in `MODULATION_TYPES` and recognition flashcards in `MODULATION_QUESTIONS`. The exercise page filters question records by type and forwards their question HTML, answer HTML and structured `keyboards` to the shared exercise shell.

Each question owns an ordered array of keyboard specifications: `{ tones, range, startOctave, octaves, label }`. Local `chordKeyboard` and `scaleKeyboard` constructors delegate all note and degree calculation to shared `getChordTones` and `getScaleNotes`. Notes are never extracted from display HTML or duplicated as note arrays. The constructors use `getKeyboardVoicing` to retain exact registers and fit the range with neighboring white keys. Diagrams appear only when the answer is revealed.

Pivot examples show the pivot, new dominant and tonic. Direct examples show the two tonics. The enharmonic example shows both spellings of the diminished seventh and the destination tonic. Sequential modulation shows the three tonal centers rather than all nine progression chords. Relative-key examples compare major and natural-minor scale pitch sets; parallel-key examples compare the major tonic with both minor-tonic alternatives mentioned in the question.

When adding recognition questions, supply meaningful labeled keyboard examples beside the existing question and answer fields. Keep theory content and exercise examples in this shared module.

Adapted from Toniq `3fc564302b2c10642315d97a603aeba3c73a6ed0`; see [behavior](behavior.md) for integration.
