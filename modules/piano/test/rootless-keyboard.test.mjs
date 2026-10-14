import { loadModule } from '../../../tests/support/load-module.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
const { CHROMATIC_FLATS, getKeyboardRange, noteToMidi, transpose } = await loadModule('piano', 'js/music/notes.js');
const { getRootlessVoicing, getRootlessKeyboards, ROOTLESS_CHORD_TYPE_KEYS } = await loadModule('piano', 'js/music/rootless-voicings.js');
const { drawKeyboard } = await loadModule('piano', 'js/components/keyboard-diagram.js');
const step = (root, chordType, voicingType) => ({
    root, chordType, voicingType, chordName: `${root}${chordType}`,
    voicingTones: getRootlessVoicing(root, chordType, voicingType),
});
const pitches = keyboard => keyboard.tones.map(tone => noteToMidi(tone.note, tone.octave));
test('rootless keyboards preserve exact formula offsets and hand labels for every root and type', () => {
    for (const root of CHROMATIC_FLATS) {
        for (const type of ROOTLESS_CHORD_TYPE_KEYS) {
            for (const voicing of ['A', 'B']) {
                const source = step(root, type, voicing);
                const before = JSON.stringify(source);
                const [keyboard] = getRootlessKeyboards([source]);
                assert.deepEqual(pitches(keyboard), source.voicingTones.map(tone => noteToMidi(root, 4) + tone.semitones));
                keyboard.tones.forEach((tone, index) => {
                    assert.equal(tone.role, index < 2 ? 'left-hand' : 'right-hand');
                    assert.ok(tone.label.endsWith(index < 2 ? 'LH' : 'RH'));
                });
                assert.equal(JSON.stringify(source), before);
                assert.doesNotThrow(() => drawKeyboard({ ...keyboard, notes: keyboard.tones }));
            }
        }
    }
});
test('half-diminished B keeps its crossing voices instead of ascending them an extra octave', () => {
    const [keyboard] = getRootlessKeyboards([step('C', 'm7b5', 'B')]);
    assert.deepEqual(pitches(keyboard), [70, 77, 75, 78]);
});
test('ii–V–I chooses minimum total voice motion while preserving whole chord formulas', () => {
    for (const root of CHROMATIC_FLATS) {
        for (const first of ['A', 'B']) {
            const sequence = [
                step(transpose(root, 2), 'm7', first),
                step(transpose(root, 7), '7', first === 'A' ? 'B' : 'A'),
                step(root, 'maj7', first),
            ];
            const keyboards = getRootlessKeyboards(sequence);
            keyboards.forEach((keyboard, index) => {
                assert.equal(keyboard.startOctave, keyboards[0].startOctave);
                assert.equal(keyboard.octaves, keyboards[0].octaves);
                assert.deepEqual(keyboard.range, getKeyboardRange(keyboard.tones));
                assert.doesNotThrow(() => drawKeyboard({ ...keyboard, notes: keyboard.tones }));
                const actual = pitches(keyboard);
                const source = sequence[index];
                const rootPitch = actual[0] - source.voicingTones[0].semitones;
                assert.ok((rootPitch - noteToMidi(source.root, 4)) % 12 === 0);
                assert.deepEqual(actual, source.voicingTones.map(tone => rootPitch + tone.semitones));
                if (!index)
                    return;
                const previous = pitches(keyboards[index - 1]);
                const movement = actual.reduce((sum, pitch, voice) => sum + Math.abs(pitch - previous[voice]), 0);
                for (const octaveShift of [-3, -2, -1, 1, 2, 3]) {
                    const alternative = actual.reduce((sum, pitch, voice) => sum + Math.abs(pitch + octaveShift * 12 - previous[voice]), 0);
                    assert.ok(movement <= alternative, `${root} ${first} step ${index}: avoid unnecessary octave leaps`);
                }
            });
        }
    }
});
test('G major rootless cadence resolves C down to B across the octave boundary', () => {
    const keyboards = getRootlessKeyboards([step('A', 'm7', 'A'), step('D', '7', 'B'), step('G', 'maj7', 'A')]);
    assert.equal(pitches(keyboards[2])[0] - pitches(keyboards[1])[0], -1);
});
