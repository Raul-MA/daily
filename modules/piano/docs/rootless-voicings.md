# Rootless voicings

`src/js/music/rootless-voicings.js` owns chord formulas, A/B voicing selection,
hand assignments, and ii–V–I generation. The exercise page consumes those models.

`getRootlessKeyboards(steps, { startOctave: 4 })` prepares exact pitches for the
shared keyboard renderer. Each tone retains its formula semitone offset from
the root, including compound intervals and nonascending voice order. The first
two formula voices belong to LH and the remaining voices to RH; each legend
entry names its degree and hand.

For a sequence, the first chord uses the supplied root octave. Each later chord
chooses the nearest root octave by minimizing the total movement of the four
corresponding voices. Only whole-chord octave shifts are permitted, preserving
the formula spacing and hand assignments. Ties prefer the previous root octave.
Each diagram fits its own notes, with one white key of padding on either side.
Exact octave labels preserve the register information across the sequence.
This is an example register, not a requirement to play in that register.

`test/rootless-keyboard.test.mjs` checks exact formula spacing for all roots and
A/B types, voice-leading choices across major ii–V–I sequences, fitted ranges,
and the half-diminished B voicing whose supplied voices are not ascending.

Adapted from Toniq `3fc564302b2c10642315d97a603aeba3c73a6ed0`; routing and lifecycle changes are documented in [behavior](behavior.md).
