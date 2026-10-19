import test from 'node:test';
import assert from 'node:assert/strict';
import { createDailyState } from '../../../packages/data/src/daily-state.js';
import { connectPiano } from '../src/service.js';
import { validPiano } from '../src/validation.js';
import { LESSONS, createRecallPrompt } from '../src/js/music/learning-path.js';

test('piano restore rejects malformed keyboard payloads and out-of-range timestamps while retaining saved wording', () => {
  const values = new Map();
  const storage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
  const service = connectPiano(createDailyState(storage), () => 1792065600000);
  service.startSession({ lessonId: LESSONS[0].id, minutes: 10, piano: true });
  const data = structuredClone(service.read());
  for (const lesson of LESSONS) {
    for (const index of [0, 1, 2]) {
      data.practice.prompt = createRecallPrompt(lesson, index);
      assert.equal(validPiano(data), true, lesson.id);
    }
  }
  data.practice.prompt.question = 'Legacy saved wording 🌱';
  assert.equal(validPiano(data), true);
  const invalid = [
    value => { value.practice.prompt.keyboard.tones = [null]; },
    value => { value.practice.prompt.keyboard.tones = [{ note: 'H' }]; },
    value => { value.practice.prompt.keyboard.tones = [{ note: 'C', octave: 1000 }]; },
    value => { value.practice.prompt.keyboard.tones = [{ note: 'C', semitones: 'bad' }]; },
    value => { value.practice.prompt.keyboard.tones = [{ note: 'C', semitones: 1e100 }]; },
    value => { value.practice.prompt.keyboard.root = 'H'; },
    value => { value.practice.startedAt = 8640000000000001; },
    value => { value.practice.resumedAt = 1e100; },
    value => { value.practice.elapsedMs = 1e100; },
  ];
  for (const mutate of invalid) {
    const candidate = structuredClone(data);
    mutate(candidate);
    assert.equal(validPiano(candidate), false, String(mutate));
  }
  assert.equal(data.practice.prompt.question, 'Legacy saved wording 🌱');
});
