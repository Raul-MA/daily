import { loadModule } from '../../../tests/support/load-module.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
const { CHROMATIC_FLATS, getKeyboardVoicing, noteToMidi } = await loadModule('piano', 'js/music/notes.js');
const { getSuspendedResolution, SUSPENDED_CHORD_TYPE_KEYS } = await loadModule('piano', 'js/music/suspended-chords.js');
const { drawKeyboard } = await loadModule('piano', 'js/components/keyboard-diagram.js');
test('suspensions resolve to the target chord while retaining extensions in every key', () => {
    const expectedOffsets = { sus2: [0, 4, 7], sus4: [0, 4, 7], '7sus4': [0, 4, 7, 10], '9sus4': [0, 4, 7, 10, 14] };
    for (const root of CHROMATIC_FLATS) {
        for (const type of SUSPENDED_CHORD_TYPE_KEYS) {
            const question = getSuspendedResolution(root, type);
            const before = JSON.stringify(question.tones);
            const placed = getKeyboardVoicing(question.resolvedTones, { root });
            assert.deepEqual(placed.tones.map(tone => noteToMidi(tone.note, tone.octave) - noteToMidi(root, 4)), expectedOffsets[type]);
            for (const move of question.resolutionMoves) {
                const from = question.tones.find(tone => tone.degree === move.fromDegree);
                const to = question.resolvedTones.find(tone => tone.degree === move.toDegree);
                assert.equal(from.note, move.fromNote);
                assert.equal(to.note, move.toNote);
                assert.equal(to.semitones - from.semitones, type === 'sus2' ? 2 : -1);
            }
            assert.equal(JSON.stringify(question.tones), before);
            assert.doesNotThrow(() => drawKeyboard({ ...placed, notes: placed.tones }));
        }
    }
});
