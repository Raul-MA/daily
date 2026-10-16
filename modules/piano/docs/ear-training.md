# Ear-training questions

`src/js/music/ear-training.js` owns `EAR_TRAINING_NOTES` and `randomEarTrainingQuestion(filter)`. The sample catalog is derived from shared chromatic notes and exact octaves C2–C5, with filenames matching the existing piano recordings. Questions choose a semitone distance from 1–12 and a root with an available target recording. The returned interval, filenames, and exact keyboard tones describe the same pitches.

`src/js/pages/ear-training-exercise.js` owns playback and reveal state. It passes those exact tones through `getKeyboardVoicing` and the shared exercise shell, so the answer keyboard uses the heard registers and fitted white-key margins. `test/ear-training.test.mjs` checks recording existence and pitch distances for all supported intervals.

Playback belongs to the current prompt. Advancing or leaving the route aborts the active recording and the between-note delay; stale playback cannot update a later prompt. The page cleanup also destroys the exercise shell timer.

Adapted from Toniq `3fc564302b2c10642315d97a603aeba3c73a6ed0`; routing and lifecycle changes are documented in [behavior](behavior.md).
