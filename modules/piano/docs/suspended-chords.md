# Suspended-chord resolutions

`src/js/music/suspended-chords.js` owns suspension formulas and resolution data. `getSuspendedResolution(root, type)` returns the source tones, display names, resolution moves, and `resolvedTones`. The random resolution-question generator delegates to this pure function after selecting a root and type.

Each move supplies its source degree/note and destination degree/note/semitone offset. Resolved tones are calculated from those moves in the domain module, preserving unchanged tones and compound extensions. Current sus2 chords move the second up a whole step to the third; sus4, 7sus4, and 9sus4 move the fourth down a semitone. The ninth retains its 14-semitone placement.

The exercise page renders the returned moves and passes `tones` and `resolvedTones` to the shared keyboard helper with the explicit root. It contains no destination-interval constant. New resolution behavior should be implemented in the domain module so the text and keyboard use the same result.

`test/suspended-chords.test.mjs` verifies all supported types across all twelve roots, including the target pitches, movement distances, retained ninth, and keyboard rendering.

Adapted from Toniq `3fc564302b2c10642315d97a603aeba3c73a6ed0`; routing and lifecycle changes are documented in [behavior](behavior.md).
