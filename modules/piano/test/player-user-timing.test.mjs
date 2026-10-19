import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseExercise } from '../src/player/validator.js';
import { secondsAt, soundingEvents } from '../src/player/timing.js';
import { createPlayer } from '../src/player/transport.js';

const exercise = () => parseExercise(readFileSync(new URL('./fixtures/timing-test.json', import.meta.url), 'utf8'));
function clock() { return { time: 0, notes: [], now() { return this.time; }, note(event) { this.notes.push(event); }, clear() { this.notes = []; }, click() {} }; }

test('user timing fragment imports with all thirteen complete supplied note events and preserved silences', () => {
  const data = exercise(); const variant = data.variants[0];
  assert.equal(variant.notes.length, 13);
  assert.deepEqual(variant.notes.filter(note => note.startTick === 960).map(note => note.pitch), [60, 64, 67]);
  assert.deepEqual(variant.notes.filter(note => note.startTick === 2880 && note.trackId === 'right').map(note => note.pitch), [60, 72]);
  assert.deepEqual(variant.notes.filter(note => note.startTick >= 3840 && note.startTick < 4800 && note.trackId === 'right').map(note => [note.startTick, note.durationTicks, note.accent]), [[3840, 320, false], [4160, 320, false], [4480, 320, true]]);
  const sounding = soundingEvents(variant, 0, variant.lengthTicks);
  for (const tick of [0, 1920, 5760, 7200, 7679]) assert.ok(!sounding.some(note => note.startTick <= tick && note.endTick > tick), `rest at ${tick}`);
  assert.equal(secondsAt(variant, 7680, 960, .5), 8);
});

test('user timing exercise schedules exact chord octave triplet and final-release times at fifty percent', () => {
  const data = exercise(); const audio = clock(); const variant = data.variants[0];
  const player = createPlayer({ exercise: data, variant, audio, automatic: false, settings: { speed: .5, accent: 0 } });
  player.play();
  assert.deepEqual(audio.notes.filter(note => note.when === 1).map(note => note.pitch), [60, 64, 67]);
  assert.deepEqual(audio.notes.filter(note => note.when === 3).map(note => note.pitch), [48, 60, 72]);
  assert.equal(audio.notes.find(note => note.id === 'timing-test-n10').when, 4);
  assert.ok(Math.abs(audio.notes.find(note => note.id === 'timing-test-n11').when - 13 / 3) < 1e-12);
  assert.ok(Math.abs(audio.notes.find(note => note.id === 'timing-test-n12').when - 14 / 3) < 1e-12);
  assert.equal(audio.notes.find(note => note.id === 'timing-test-n12').gain, 96 / 127);
  assert.equal(audio.notes.find(note => note.id === 'timing-test-n14').until, 7.5);
  audio.time = 7.75; player.pump(); assert.equal(player.snapshot().running, true);
  audio.time = 8; player.pump(); assert.equal(player.snapshot().running, false); assert.equal(audio.notes.length, 0);
  player.dispose();
});
