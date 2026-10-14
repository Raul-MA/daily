import { loadModule, modulePath } from '../../../tests/support/load-module.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
const { EAR_TRAINING_NOTES, randomEarTrainingQuestion } = await loadModule('piano', 'js/music/ear-training.js');
const { getKeyboardVoicing, noteToMidi } = await loadModule('piano', 'js/music/notes.js');
const { drawKeyboard } = await loadModule('piano', 'js/components/keyboard-diagram.js');
test('audio catalog is chromatic, complete, and backed by actual recordings', () => {
    assert.equal(EAR_TRAINING_NOTES.length, 37);
    EAR_TRAINING_NOTES.forEach((tone, index) => {
        assert.equal(tone.midi, 36 + index);
        assert.ok(existsSync(modulePath('piano', `assets/notes/${tone.file}.mp3`)), tone.file);
    });
});
test('recordings, named interval, and exact keyboard keys agree for every interval', () => {
    for (let semitones = 1; semitones <= 12; semitones++) {
        for (let attempt = 0; attempt < 20; attempt++) {
            const question = randomEarTrainingQuestion([semitones]);
            const source = EAR_TRAINING_NOTES.find(tone => tone.file === question.rootFile);
            const target = EAR_TRAINING_NOTES.find(tone => tone.file === question.targetFile);
            assert.equal(target.midi - source.midi, semitones);
            assert.equal(question.interval.semitones, semitones);
            assert.deepEqual(question.tones.map(tone => noteToMidi(tone.note, tone.octave)), [source.midi, target.midi]);
            const { tones, ...range } = getKeyboardVoicing(question.tones, { startOctave: source.octave });
            const html = drawKeyboard({ notes: tones, ...range });
            const selected = [...html.matchAll(/class="keyboard-key[^"\n]* is-selected" data-midi="(\d+)"/g)].map(match => Number(match[1]));
            assert.deepEqual(selected, [source.midi, target.midi]);
        }
    }
    assert.throws(() => randomEarTrainingQuestion([0]), RangeError);
});
