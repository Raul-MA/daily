import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { exerciseSchema } from '../src/player/schema.js';
import { validateExercise } from '../src/player/validator.js';
import { playerLibrary } from '../src/player/library.js';
import { createDailyState } from '../../../packages/data/src/daily-state.js';
import { connectPiano } from '../src/service.js';
import { createPlayer } from '../src/player/transport.js';

const example = () => JSON.parse(readFileSync(new URL('../docs/exercise-player/example.json', import.meta.url)));
function setup() {
  const values = new Map();
  const storage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
  const state = createDailyState(storage);
  return { state, storage, values, library: playerLibrary(connectPiano(state)) };
}
function audioClock() { return { time: 0, notes: [], now() { return this.time; }, clear() { this.notes = []; }, note(event) { this.notes.push(event); }, click() {} }; }

test('player schema generated documentation and transcription contract match the application source', () => {
  const schemaText = readFileSync(new URL('../docs/exercise-player/exercise.schema.json', import.meta.url), 'utf8');
  assert.deepEqual(JSON.parse(schemaText), exerciseSchema);
  assert.ok(readFileSync(new URL('../docs/exercise-player/transcription-prompt.md', import.meta.url), 'utf8').includes(schemaText.trim()));
  const assets = JSON.parse(readFileSync('dist/asset-list.json', 'utf8'));
  assert.ok(!assets.some(asset => asset.includes('example.json') || asset.includes('transcription-prompt')));
});

test('player library persists through Daily service reload and failed storage writes preserve musical content', () => {
  const { library, storage, state, values } = setup();
  library.importText(JSON.stringify(example())); library.preferences(example().id, { speed: .75 });
  const restored = playerLibrary(connectPiano(createDailyState(storage)));
  assert.equal(restored.read().preferences[example().id].speed, .75);
  const before = JSON.stringify(state.read().value);
  const raw = values.get('daily:v1');
  storage.setItem = () => { throw new Error('Quota exceeded'); };
  assert.throws(() => library.importText(JSON.stringify({ ...example(), id: 'other' })), /Quota/);
  assert.equal(JSON.stringify(state.read().value), before); assert.equal(values.get('daily:v1'), raw);
});

test('player validates event identifiers score references pedals maps meter boundaries and incomplete bounds', () => {
  const changes = [
    variant => { variant.notes.push(variant.notes[0]); },
    variant => { variant.pedalEvents.push(variant.pedalEvents[0]); },
    variant => { variant.pedalEvents[0].tick = 8000; },
    variant => { variant.tempoMap.reverse(); },
    variant => { variant.timeSignatureMap.push({ tick: 1, numerator: 4, denominator: 4 }); },
    variant => { variant.scoreReferences = [{ id: 's1', attachmentId: 'missing-file', measureId: 'wrong' }]; },
    variant => { variant.subdivisionRegions[0].endTick = 8000; },
    variant => { variant.timeSignatureMap[0].denominator = 3; },
  ];
  for (const change of changes) { const exercise = example(); change(exercise.variants[0]); assert.ok(validateExercise(exercise).length); }
  const missingFile = example(); missingFile.variants[0].scoreReferences = [{ id: 's1', attachmentId: 'absent' }];
  assert.deepEqual(validateExercise(missingFile), []);
});

test('player reschedules speed changes without duplicate voices and retriggers pedal-held notes on seek', () => {
  const exercise = example(); const variant = exercise.variants[0]; variant.notes[0].durationTicks = 240;
  const audio = audioClock(); const player = createPlayer({ exercise, variant, audio, automatic: false });
  player.play(); audio.time = .5; player.pump(); player.configure({ speed: .5 });
  assert.equal(player.snapshot().tick, 960);
  assert.equal(audio.notes.find(note => note.id === 'n1').when, .5);
  player.seek(1600); assert.ok(audio.notes.some(note => note.id === 'n1'));
  player.seek(1920); assert.ok(!audio.notes.some(note => note.id === 'n1'));
  player.stop(); assert.equal(audio.notes.length, 0); player.dispose();
});

test('player loop excludes events on the end boundary and preserves explicit swung onset times', () => {
  const exercise = example(); const variant = exercise.variants[0];
  variant.notes = [{ id: 'a', trackId: 'rh', pitch: 60, startTick: 0, durationTicks: 640, velocity: 80, accent: false }, { id: 'b', trackId: 'rh', pitch: 72, startTick: 640, durationTicks: 320, velocity: 80, accent: true }, { id: 'c', trackId: 'lh', pitch: 48, startTick: 960, durationTicks: 960, velocity: 80, accent: false }];
  const audio = audioClock();
  const player = createPlayer({ exercise, variant, audio, automatic: false, settings: { countIn: 'none', speed: .5, loop: { enabled: true, startTick: 0, endTick: 960 } } });
  player.play(); assert.equal(audio.notes.length, 2);
  assert.equal(audio.notes.find(note => note.id === 'b').when, 2 / 3);
  assert.ok(audio.notes.every(note => note.until <= 1));
  audio.time = 100; player.pump(); assert.equal(player.snapshot().repetition, 101); assert.equal(player.snapshot().tick, 0);
  player.dispose();
});
