import { loadModule } from '../../../tests/support/load-module.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
const { drawKeyboard, buildKeyboardDiagramHTML } = await loadModule('piano', 'js/components/keyboard-diagram.js');
const { buildExerciseCardHTML } = await loadModule('piano', 'js/components/exercise-shell.js');
const { getKeyboardRange, getKeyboardVoicing, noteToMidi } = await loadModule('piano', 'js/music/notes.js');
const { getExtendedChordTones, EXTENDED_CHORD_TYPE_NAMES } = await loadModule('piano', 'js/music/chords.js');
const selectedMidi = html => [...html.matchAll(/class="keyboard-key[^"\n]* is-selected" data-midi="(\d+)"/g)].map(match => Number(match[1]));
const renderVoicing = ({ tones, ...options }) => drawKeyboard({ notes: tones, ...options });
test('fitted keyboards start one white key before the lowest note across octave boundaries', () => {
    for (const [note, expected] of [['A', 'G4'], ['C', 'B3'], ['C#', 'C4'], ['Cb', 'A3'], ['B#', 'B4']]) {
        const voicing = getKeyboardVoicing([{ note, octave: 4 }]);
        assert.equal(`${voicing.range.start.note}${voicing.range.start.octave}`, expected);
        const html = renderVoicing(voicing);
        assert.equal(Number(html.match(/data-midi="(\d+)"/)[1]), noteToMidi(voicing.range.start.note, voicing.range.start.octave));
    }
    assert.deepEqual(getKeyboardRange([{ note: 'E', octave: 5 }, { note: 'A', octave: 4 }]), {
        start: { note: 'G', octave: 4 }, end: { note: 'F', octave: 5 },
    });
});
test('explicit ranges override whole octaves and respect MIDI boundaries', () => {
    for (const [note, octave] of [['C', -1], ['G', 9]]) {
        const voicing = getKeyboardVoicing([{ note, octave }]);
        assert.deepEqual(selectedMidi(renderVoicing(voicing)), [noteToMidi(note, octave)]);
    }
    assert.throws(() => drawKeyboard({ range: { start: { note: 'C#', octave: 4 }, end: { note: 'G', octave: 4 } } }), RangeError);
    assert.throws(() => drawKeyboard({ range: { start: { note: 'G', octave: 4 }, end: { note: 'C', octave: 4 } } }), RangeError);
});
test('exact notes select C4 and C5 independently; pitch classes repeat', () => {
    assert.deepEqual(selectedMidi(drawKeyboard({ notes: [{ note: 'C', octave: 4 }], octaves: 2 })), [60]);
    assert.deepEqual(selectedMidi(drawKeyboard({ notes: [{ note: 'C', octave: 5 }], octaves: 2 })), [72]);
    assert.deepEqual(selectedMidi(drawKeyboard({ notes: ['C'], octaves: 2 })), [60, 72]);
    assert.deepEqual(selectedMidi(drawKeyboard({ notes: ['D', { note: 'C', octave: 5 }], octaves: 2 })), [62, 72, 74]);
});
test('enharmonic spellings cross the scientific-octave boundary correctly', () => {
    assert.equal(noteToMidi('Cb', 4), noteToMidi('B', 3));
    assert.equal(noteToMidi('B#', 4), noteToMidi('C', 5));
    assert.equal(noteToMidi('C♭', 4), 59);
    assert.equal(noteToMidi('B♯', 4), 72);
    assert.deepEqual(selectedMidi(drawKeyboard({ notes: [{ note: 'Cb', octave: 4 }], startOctave: 3 })), [59]);
    assert.deepEqual(selectedMidi(drawKeyboard({ notes: [{ note: 'B#', octave: 4 }], startOctave: 5 })), [72]);
    assert.deepEqual(selectedMidi(renderVoicing(getKeyboardVoicing(['Cb', 'Eb', 'Gb']))), [59, 63, 66]);
});
test('compound intervals retain their distance across the C boundary', () => {
    const voicing = getKeyboardVoicing([{ note: 'B', semitones: 0 }, { note: 'C#', semitones: 14 }], { root: 'B' });
    assert.deepEqual(voicing.tones.map(t => noteToMidi(t.note, t.octave)), [71, 85]);
    assert.equal(voicing.octaves, 3);
    assert.deepEqual(selectedMidi(renderVoicing(voicing)), [71, 85]);
});
test('every extended chord preserves supplied compound intervals', () => {
    for (const root of ['C', 'B', 'Cb', 'F#']) {
        for (const type of EXTENDED_CHORD_TYPE_NAMES) {
            const source = getExtendedChordTones(root, type);
            const voicing = getKeyboardVoicing(source, { root });
            const expected = source.map(t => noteToMidi(root, 4) + t.semitones);
            assert.deepEqual(voicing.tones.map(t => noteToMidi(t.note, t.octave)), expected, `${root} ${type}`);
            assert.deepEqual(selectedMidi(renderVoicing(voicing)), [...new Set(expected)].sort((a, b) => a - b));
        }
    }
});
test('bass-first inversion stays ascending and retains role metadata', () => {
    const voicing = getKeyboardVoicing([{ note: 'G', role: 'bass' }, { note: 'C', degree: '1' }, { note: 'E', degree: '3' }]);
    assert.deepEqual(voicing.tones.map(t => noteToMidi(t.note, t.octave)), [67, 72, 76]);
    assert.equal(voicing.tones[0].role, 'bass');
    assert.deepEqual(selectedMidi(renderVoicing(voicing)), [67, 72, 76]);
});
test('explicit registers take precedence over inferred ascending placement', () => {
    const voicing = getKeyboardVoicing([{ note: 'G', octave: 5 }, { note: 'C', octave: 4 }]);
    assert.deepEqual(voicing.tones.map(t => noteToMidi(t.note, t.octave)), [79, 60]);
    assert.deepEqual(selectedMidi(renderVoicing(voicing)), [60, 79]);
});
test('invalid ranges, notes, labels and out-of-range exact notes are rejected', () => {
    for (const options of [{ octaves: 0 }, { octaves: 9 }, { octaves: 1.5 }, { startOctave: -2 }, { startOctave: 9 }, { startOctave: 4.5 }]) {
        assert.throws(() => drawKeyboard(options), RangeError);
    }
    for (const notes of [[null], [{}], ['H'], ['C4'], [{ note: 'C', octave: 4.5 }]]) {
        assert.throws(() => drawKeyboard({ notes }), TypeError);
    }
    assert.throws(() => drawKeyboard({ notes: 'C' }), TypeError);
    assert.throws(() => drawKeyboard({ keyLabels: 'sometimes' }), TypeError);
    assert.throws(() => drawKeyboard({ notes: [{ note: 'C', octave: 5 }] }), RangeError);
    assert.throws(() => drawKeyboard({ notes: [{ note: 'Cb', octave: 4 }] }), RangeError);
    assert.throws(() => getKeyboardVoicing([{ note: 'E', semitones: 3 }], { root: 'C' }), RangeError);
    assert.throws(() => getKeyboardVoicing([{ note: 'E', semitones: 4.5 }], { root: 'C' }), TypeError);
});
test('arbitrary role and display text are preserved with HTML escaping', () => {
    const html = drawKeyboard({ notes: [{ note: 'C', label: '<answer>&"', role: 'custom" onclick="bad' }], label: '<Piano>&"' });
    assert.ok(html.includes('data-role="custom&quot; onclick=&quot;bad"'));
    assert.ok(html.includes('&lt;answer&gt;&amp;&quot;'));
    assert.ok(html.includes('aria-label="&lt;Piano&gt;&amp;&quot;"'));
    assert.ok(!html.includes(' onclick="bad'));
    assert.ok(!html.includes('<answer>'));
    assert.deepEqual(selectedMidi(html), [60]);
    const degree = drawKeyboard({ notes: [{ note: 'C', degree: '<root>' }] });
    assert.ok(degree.includes('&lt;root&gt;'));
});
test('label settings control rendered labels while retaining accessible descriptions', () => {
    assert.equal((drawKeyboard({ notes: ['C'], keyLabels: 'none' }).match(/class="keyboard-key-label"/g) || []).length, 0);
    assert.equal((drawKeyboard({ notes: ['C'], keyLabels: 'highlighted', octaves: 2 }).match(/class="keyboard-key-label"/g) || []).length, 2);
    const html = drawKeyboard({ notes: ['C'], keyLabels: 'all', octaves: 2, showLegend: false });
    assert.equal((html.match(/class="keyboard-key-label"/g) || []).length, 24);
    assert.ok(html.includes('class="keyboard-legend sr-only"'));
});
test('voicing, rendering and compatibility adapter never mutate their input', () => {
    const tones = Object.freeze([Object.freeze({ note: 'C', degree: '1', semitones: 0 }), Object.freeze({ note: 'E', degree: '3', semitones: 4 })]);
    const before = structuredClone(tones);
    const options = Object.freeze({ root: 'C', startOctave: 4 });
    const voicing = getKeyboardVoicing(tones, options);
    renderVoicing(voicing);
    assert.equal(buildKeyboardDiagramHTML(tones), drawKeyboard({ notes: tones }));
    assert.deepEqual(tones, before);
    assert.notEqual(voicing.tones[0], tones[0]);
});
test('exercise keyboards are absent until reveal, including all answer text', () => {
    const options = { questionHTML: '<p>Question</p>', answerHTML: '<p>Secret answer</p>', keyboards: [{ tones: [{ note: 'C', octave: 4 }], label: 'Answer keyboard' }] };
    const hidden = buildExerciseCardHTML(options);
    assert.ok(!hidden.includes('keyboard-diagram'));
    assert.ok(!hidden.includes('Secret answer'));
    assert.ok(!hidden.includes('Answer keyboard'));
    const revealed = buildExerciseCardHTML({ ...options, revealed: true });
    assert.equal((revealed.match(/class="keyboard-diagram"/g) || []).length, 1);
    assert.ok(revealed.includes('Secret answer'));
    assert.deepEqual(selectedMidi(revealed), [60]);
});
