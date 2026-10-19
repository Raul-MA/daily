import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createPlayer } from '../src/player/transport.js';
import { clickGrid } from '../src/player/timing.js';
import { importFile } from '../src/player/page-actions.js';
import { parseExercise } from '../src/player/validator.js';

const example = () => JSON.parse(readFileSync(new URL('../docs/exercise-player/example.json', import.meta.url)));
function clock() { return { time: 0, notes: [], clicks: [], now() { return this.time; }, note(event) { this.notes.push(event); }, click(event) { this.clicks.push(event); }, clear() {} }; }

test('short loops schedule every repetition through the lookahead before each pump', () => {
  const exercise = example(); const variant = exercise.variants[0]; const audio = clock();
  const player = createPlayer({ exercise, variant, audio, automatic: false, settings: { loop: { enabled: true, startTick: 0, endTick: 10 } } });
  player.play(); assert.ok(audio.notes.some(note => note.when > .145));
  audio.time = .025; player.pump();
  const onsets = [...new Set(audio.notes.map(note => note.when))].sort((a, b) => a - b);
  for (let index = 1; index < onsets.length; index++) assert.ok(onsets[index] - onsets[index - 1] < .00521);
  assert.ok(onsets.at(-1) > .17); player.dispose();
});

test('click grids restrict work to the selected range and skip subdivisions in beats mode', () => {
  const variant = example().variants[0];
  variant.subdivisionRegions = [{ startTick: 0, endTick: 10000, stepTicks: 1 }];
  const beats = clickGrid(variant, 960, { start: 3840, end: 4800, mode: 'beats' });
  assert.equal(beats.length, 1);
  assert.deepEqual(beats.map(click => click.tick), [3840]);
  assert.deepEqual(clickGrid(variant, 960, { start: 4000, end: 4010, mode: 'subdivisions' }).map(click => click.tick), Array.from({ length: 10 }, (_, index) => 4000 + index));
});

test('long metronome passages schedule only the horizon and extend it once without duplicate clicks', () => {
  const exercise = example(); const variant = exercise.variants[0]; const audio = clock();
  const player = createPlayer({ exercise, variant, audio, automatic: false, settings: { metronome: 'subdivisions' } });
  player.play(); assert.ok(audio.clicks.every(click => click.when < .15));
  audio.time = .1; player.pump(); assert.ok(audio.clicks.some(click => click.when > .15));
  const count = audio.clicks.length; player.pump(); assert.equal(audio.clicks.length, count); player.dispose();
});

test('count-in clicks advance through the same horizon without repeats when metronome is off', () => {
  const exercise = example(); const variant = exercise.variants[0]; const audio = clock();
  const player = createPlayer({ exercise, variant, audio, automatic: false, settings: { countIn: 'first' } });
  player.play(); assert.equal(audio.clicks.length, 1);
  audio.time = .4; player.pump(); assert.deepEqual(audio.clicks.map(click => click.when), [0, .5]);
  player.pump(); assert.equal(audio.clicks.length, 2); player.dispose();
});

test('an excessive subdivision density fails explicitly before constructing thousands of audio clicks', () => {
  const variant = example().variants[0]; variant.subdivisionRegions = [{ startTick: 0, endTick: 7680, stepTicks: 1 }];
  assert.throws(() => clickGrid(variant, 960, { start: 0, end: 7680, mode: 'subdivisions' }), /too dense/);
});

test('current file validation errors propagate instead of being mistaken for stale read failures', async () => {
  const ctx = { generation: 1, disposed: false, library: { importText: parseExercise } };
  await assert.rejects(importFile(ctx, { text: async () => '{}' }), /schemaVersion: required/);
});
