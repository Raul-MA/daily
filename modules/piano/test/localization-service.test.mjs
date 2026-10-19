import { MODULATION_QUESTIONS } from '../src/js/music/modulations.js';
import { pianoActivityLabel } from '../src/widget.js';
import { MODES } from '../src/js/music/modes.js';
import { transpose } from '../src/js/music/notes.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dictionaries, translate, presentPrompt, presentAuthoredHTML } from '../src/i18n.js';
import { localizedLesson } from '../src/localized-lessons.js';
import { LESSONS, createRecallPrompt } from '../src/js/music/learning-path.js';

const corpus = JSON.parse(readFileSync(new URL('../../../reports/piano-copy-inventory.json', import.meta.url), 'utf8'));

test('piano Spanish copy covers the authored corpus and preserves interpolation and notation', () => {
  for (const source of corpus.keys) {
    assert.ok(Object.hasOwn(dictionaries.es, source), source);
    assert.ok(dictionaries.es[source].length, source);
    assert.equal(translate('en', source), source);
  }
  assert.deepEqual(Object.keys(dictionaries.en).sort(), Object.keys(dictionaries.es).sort());
  assert.equal(translate('es', 'What interval goes up from C to Eb?'), '¿Qué intervalo asciende de C a Eb?');
  assert.equal(translate('es', 'Cmaj7'), 'Cmaj7');
  assert.equal(pianoActivityLabel('Find thirds and fifths', 'es'), 'Encuentra terceras y quintas');
  assert.equal(pianoActivityLabel('Play 🌱', 'es'), 'Play 🌱');
  for (const question of MODULATION_QUESTIONS) {
    for (const html of [question.questionHTML, question.answerHTML]) {
      assertAuthoredHTML(html, question.id);
    }
  }
});

test('all ten localized piano lessons retain their musical and structural data without mutating source', () => {
  const before = structuredClone(LESSONS);
  for (const lesson of LESSONS) {
    const spanish = localizedLesson(lesson, 'es');
    assert.notEqual(spanish.title, lesson.title);
    assert.notEqual(spanish.explanation, lesson.explanation);
    assert.deepEqual(spanish.roots, lesson.roots);
    assert.deepEqual(spanish.recall, lesson.recall);
    assert.deepEqual(spanish.application.keyboard, lesson.application.keyboard);
    assert.deepEqual(spanish.application.sequence?.map(step => step.keyboard), lesson.application.sequence?.map(step => step.keyboard));
    assert.equal(spanish.id, lesson.id);
    assert.equal(spanish.prerequisite, lesson.prerequisite);
    assert.deepEqual(spanish.links.map(link => link.path), lesson.links.map(link => link.path));
    assert.deepEqual(localizedLesson(lesson, 'en'), lesson);
  }
  assert.deepEqual(LESSONS, before);
  assert.equal(localizedLesson(LESSONS[0], 'es').title, 'Encuentra terceras y quintas');
});

test('piano prompt presentation translates its text without changing saved prompts or keyboard notes', () => {
  const prompt = { question: 'What interval goes up from C to Eb?', answer: 'Minor 3rd: 3 semitones.', keyboard: { root: 'C', tones: [{ note: 'Eb', degree: 'm3', semitones: 3 }] } };
  const before = structuredClone(prompt);
  const translated = presentPrompt(prompt, 'es');
  assert.equal(translated.question, '¿Qué intervalo asciende de C a Eb?');
  assert.equal(translated.answer, '3.ª menor: 3 semitonos.');
  assert.deepEqual(translated.keyboard, before.keyboard);
  assert.deepEqual(prompt, before);
  for (const lesson of LESSONS) {
    for (const index of [0, 1, 2]) {
      const source = createRecallPrompt(lesson, index);
      const shown = presentPrompt(source, 'es');
      assert.notEqual(shown.question, source.question, lesson.id);
      assert.doesNotMatch(`${shown.question} ${shown.answer}`, /\b(What|Which|Name|Starting|Create|semitones|degree|above|below|Reverse)\b/, lesson.id);
      assert.deepEqual(shown.keyboard, source.keyboard);
    }
  }
});

test('modal parent-key direction descriptions agree with their C-major examples', () => {
  for (const [name, root, steps] of [['Dorian', 'D', -2], ['Phrygian', 'E', -4], ['Lydian', 'F', -5], ['Mixolydian', 'G', -7]]) {
    const mode = MODES.find(item => item.name === name);
    assert.equal(transpose(root, steps), 'C');
    assert.match(mode.parentKeyDesc, /below the root/);
    assert.match(translate('es', mode.parentKeyDesc), /por debajo/);
  }
  for (const name of ['Aeolian', 'Locrian']) assert.match(MODES.find(item => item.name === name).parentKeyDesc, /above the root/);
});

function assertAuthoredHTML(html, id) {
  const shown = presentAuthoredHTML(html, 'es');
  assert.equal(presentAuthoredHTML(html, 'en'), html);
  assert.deepEqual(shown.match(/<[^>]+>/g), html.match(/<[^>]+>/g));
  for (const [, text] of shown.matchAll(/>([^<>]+)</g)) {
    const key = text.trim();
    if (dictionaries.es[key]) assert.equal(dictionaries.es[key], key, id);
  }
}
