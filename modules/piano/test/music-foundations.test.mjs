import { loadModule } from '../../../tests/support/load-module.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
const { noteToIndex, spellInterval, transpose, getChromaticNotes } = await loadModule('piano', 'js/music/notes.js');
const { applyInterval, randomIntervalQuestion } = await loadModule('piano', 'js/music/intervals.js');
const { CHORD_TYPES, EXTENDED_CHORD_TYPES, getChordTones, getExtendedChordTones, getAvailableTensionNotes, randomChordQuestion, randomChordDegreeQuestion } = await loadModule('piano', 'js/music/chords.js');
const { buildKeyboardDiagramHTML } = await loadModule('piano', 'js/components/keyboard-diagram.js');
test('spells intervals by letter in both directions and preserves chromatic transpose', () => {
    assert.equal(spellInterval('C', 3, 3), 'Eb');
    assert.equal(spellInterval('E', 9, 6), 'C#');
    assert.equal(spellInterval('F#', 11, 7), 'E#');
    assert.equal(spellInterval('C', -4, 3), 'Ab');
    assert.equal(spellInterval('C', 15, '#9'), 'D#');
    assert.equal(applyInterval('C', 3), 'Eb');
    assert.equal(applyInterval('C', -3), 'A');
    assert.equal(applyInterval('C', 14), 'D');
    assert.equal(applyInterval('C', 3, false), 'D#');
    assert.equal(transpose('C', 3), 'D#');
});
test('recognizes enharmonics and double accidentals', () => {
    for (const [note, expected] of [['E#', 5], ['Cb', 11], ['Bbb', 9], ['F##', 7], ['B𝄫', 9], ['F𝄪', 7], ['E♭', 3]]) {
        assert.equal(noteToIndex(note), expected);
    }
    for (const note of ['H', 'C#b', '', null, undefined])
        assert.equal(noteToIndex(note), null);
});
test('chord tones and tensions retain theoretical spelling', () => {
    assert.deepEqual(getChordTones('D', 'm7').map(tone => tone.note), ['D', 'F', 'A', 'C']);
    assert.deepEqual(getChordTones('C', 'dim7').map(tone => tone.note), ['C', 'Eb', 'Gb', 'Bbb']);
    assert.deepEqual(getChordTones('F#', 'maj7').map(tone => tone.note), ['F#', 'A#', 'C#', 'E#']);
    assert.equal(getAvailableTensionNotes('C', '7').find(tone => tone.degree === '#9').note, 'D#');
    assert.equal(getExtendedChordTones('Bb', 'm9').at(-1).note, 'C');
});
test('every chord tone remains on its intended pitch for all standard roots', () => {
    for (const root of new Set([...getChromaticNotes(), ...getChromaticNotes('flats')])) {
        for (const [types, getTones] of [[CHORD_TYPES, getChordTones], [EXTENDED_CHORD_TYPES, getExtendedChordTones]]) {
            verifyChordTypes(root, types, getTones);
        }
    }
});
test('question root pools and numeric degree filters constrain practice', () => {
    assert.equal(randomIntervalQuestion([3], ['C']).result, 'Eb');
    assert.equal(randomChordQuestion(['m7'], ['D']).name, 'Dm7');
    const question = randomChordDegreeQuestion({ roots: ['D'], types: ['m7'], degrees: ['7'], reverse: true });
    assert.equal(question.degree, '♭7');
    assert.equal(question.note, 'C');
    assert.equal(question.reverse, true);
    assert.throws(() => randomChordDegreeQuestion({ degrees: ['9'] }), /empty degree pool/);
});
test('keyboard maps enharmonic pitches and retains an accessible escaped legend', () => {
    const html = buildKeyboardDiagramHTML([{ note: 'E#', degree: '7' }, { note: 'Bbb', degree: '<7>' }]);
    assert.equal((html.match(/class="keyboard-key(?: |")/g) || []).length, 12);
    assert.equal((html.match(/is-black/g) || []).length, 5);
    assert.equal((html.match(/is-selected/g) || []).length, 2);
    assert.match(html, /7: E#/);
    assert.match(html, /&lt;7&gt;: Bbb/);
    assert.match(html, /aria-hidden="true"/);
    assert.match(html, /one octave/);
});
function verifyChordTypes(root, types, getTones) {
    for (const type of Object.keys(types)) {
        for (const tone of getTones(root, type)) {
            assert.equal(noteToIndex(tone.note), (noteToIndex(root) + tone.semitones) % 12, `${root}${type}: ${tone.note}`);
        }
    }
}
