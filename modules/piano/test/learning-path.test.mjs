import { loadModule } from '../../../tests/support/load-module.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
const { DESTINATIONS } = await loadModule('piano', 'js/components/navigation-data.js');
const { drawKeyboard } = await loadModule('piano', 'js/components/keyboard-diagram.js');
const { LESSONS, createRecallPrompt } = await loadModule('piano', 'js/music/learning-path.js');
const { getKeyboardVoicing, noteToIndex, noteToMidi } = await loadModule('piano', 'js/music/notes.js');
test('guided ninth recall and application retain the compound interval', () => {
    const lesson = LESSONS.find(item => item.id === 'passing-notes-and-ninths');
    const examples = [lesson.application.keyboard, ...Array.from({ length: 20 }, (_, index) => createRecallPrompt(lesson, index).keyboard)];
    for (const specification of examples) {
        const { root, tones } = specification;
        const keyboard = getKeyboardVoicing(tones, specification);
        const ninth = keyboard.tones.find(tone => tone.degree === '9');
        assert.equal(noteToMidi(ninth.note, ninth.octave) - noteToMidi(root, 4), 14);
    }
});
test('curriculum covers every stage with a continuous prerequisite chain and usable modes', () => {
    assert.equal(new Set(LESSONS.map(lesson => lesson.id)).size, LESSONS.length);
    assert.deepEqual([...new Set(LESSONS.map(lesson => lesson.stage))], [1, 2, 3, 4, 5, 6]);
    const routes = new Set(DESTINATIONS.map(destination => destination.path));
    LESSONS.forEach((lesson, index) => {
        assert.equal(lesson.prerequisite, index === 0 ? null : LESSONS[index - 1].id);
        for (const field of ['title', 'objective', 'explanation'])
            assert.ok(lesson[field].length > 10);
        for (const mode of ['piano', 'away', 'example'])
            assert.ok(lesson.application[mode].length > 30);
        assert.ok(lesson.selfChecks.length >= 2);
        lesson.links.forEach(link => assert.ok(routes.has(link.path), link.path));
        for (const item of [lesson.application, ...(lesson.application.sequence || [])]) {
            const placed = getKeyboardVoicing(item.keyboard.tones, item.keyboard);
            assert.doesNotThrow(() => drawKeyboard({ ...placed, notes: placed.tones }));
        }
        const tones = [...lesson.application.keyboard.tones, ...(lesson.application.sequence || []).flatMap(step => step.keyboard.tones)];
        tones.forEach(tone => {
            assert.notEqual(noteToIndex(tone.note), null, `${lesson.id}: ${tone.note}`);
            assert.ok(tone.degree);
        });
    });
});
test('all lesson recall variants produce revealable answers with valid pitch classes', () => {
    for (const lesson of LESSONS) {
        for (let index = 0; index < 36; index++) {
            const prompt = createRecallPrompt(lesson, index);
            assert.ok(prompt.question);
            assert.ok(prompt.answer);
            assert.ok(prompt.keyboard.tones.length);
            const placed = getKeyboardVoicing(prompt.keyboard.tones, prompt.keyboard);
            assert.doesNotThrow(() => drawKeyboard({ ...placed, notes: placed.tones }));
            prompt.keyboard.tones.forEach(tone => assert.notEqual(noteToIndex(tone.note), null, `${lesson.id}: ${tone.note}`));
            if (lesson.recall.kind === 'interval')
                assert.ok(lesson.roots.includes(prompt.keyboard.tones[0].note));
            if (lesson.recall.kind === 'chord')
                assert.ok(lesson.roots.includes(prompt.keyboard.tones[0].note));
        }
    }
});
test('major guide-tone questions follow F, F, E and explain the resolution', () => {
    const lesson = LESSONS.find(item => item.id === 'major-changes');
    assert.match(createRecallPrompt(lesson, 0).answer, /^F is degree ♭3 of Dm7/);
    assert.match(createRecallPrompt(lesson, 1).answer, /^F is degree ♭7 of G7/);
    assert.match(createRecallPrompt(lesson, 1).answer, /F → E/);
    assert.match(createRecallPrompt(lesson, 2).answer, /^E is degree 3 of Cmaj7/);
});
test('transfer prompts change keys only after a complete progression', () => {
    const lesson = LESSONS.find(item => item.id === 'transfer-to-new-keys');
    assert.match(createRecallPrompt(lesson, 0).question, /^Key F major/);
    assert.match(createRecallPrompt(lesson, 2).question, /^Key F major/);
    assert.match(createRecallPrompt(lesson, 3).question, /^Key G major/);
    assert.match(createRecallPrompt(lesson, 6).question, /^Key Bb major/);
    assert.match(createRecallPrompt(lesson, 6).answer, /^Eb is degree ♭3 of Cm7/);
});
test('blues follows the complete twelve-bar form and wraps', () => {
    const lesson = LESSONS.find(item => item.id === 'blues-form');
    const expected = ['C7', 'C7', 'C7', 'C7', 'F7', 'F7', 'C7', 'C7', 'G7', 'F7', 'C7', 'G7'];
    expected.forEach((chord, index) => assert.ok(createRecallPrompt(lesson, index).answer.startsWith(`${chord};`)));
    assert.match(createRecallPrompt(lesson, 12).question, /bar 1:/);
});
test('minor and modal lessons preserve characteristic spellings', () => {
    const minor = LESSONS.find(item => item.id === 'minor-changes');
    assert.deepEqual(minor.application.sequence[0].keyboard.tones.map(tone => tone.note), ['D', 'F', 'Ab', 'C']);
    assert.deepEqual(minor.application.sequence[2].keyboard.tones.map(tone => tone.note), ['C', 'Eb', 'G', 'B']);
    const modal = LESSONS.find(item => item.id === 'dorian-color');
    assert.match(createRecallPrompt(modal).answer, /B is the natural sixth/);
    assert.match(createRecallPrompt(modal).answer, /Bb, the flat sixth/);
});
