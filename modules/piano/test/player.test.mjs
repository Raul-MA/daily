import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseExercise, validateExercise } from '../src/player/validator.js';
import { secondsAt, tickAt, soundingEvents, clickGrid, nextSpeed } from '../src/player/timing.js';
import { createPlayer } from '../src/player/transport.js';
import { playerLibrary } from '../src/player/library.js';

const example = () => JSON.parse(readFileSync(new URL('../docs/exercise-player/example.json', import.meta.url)));
function fixture() { const exercise = example(); return { exercise, variant: exercise.variants[0], tpq: 960 }; }
function fakeAudio() {
  const calls = [];
  return { calls, time: 0, now() { return this.time; }, clear() { calls.push(['clear']); }, note(event) { calls.push(['note', event]); }, click(event) { calls.push(['click', event]); } };
}

test('exercise contract accepts complete documentation and defaults TPQ without importing examples', () => {
  const value = example();
  assert.deepEqual(validateExercise(value), []);
  delete value.ticksPerQuarter;
  assert.equal(parseExercise(JSON.stringify(value)).ticksPerQuarter, 960);
});
test('exercise contract rejects malformed shape references maps bounds and duplicate IDs with field errors', () => {
  const changes = [v => { v.schemaVersion = 2; }, v => { v.defaultVariantId = 'x'; }, v => { v.tracks.push(v.tracks[0]); }, v => { v.variants[0].notes[0].pitch = 128; }, v => { v.variants[0].notes[0].trackId = 'missing'; }, v => { v.variants[0].notes[0].durationTicks = 99999; }, v => { v.variants[0].tempoMap[0].tick = 1; }, v => { v.variants[0].tempoMap[0].quarterBpm = 0; }, v => { v.variants[0].measures[1].startTick = 10; }];
  for (const change of changes) { const value = example(); change(value); assert.ok(validateExercise(value).length); }
  assert.throws(() => parseExercise('{'), /JSON/);
});
test('exercise contract supports explicit pickups and incomplete measures', () => {
  const value = example();
  value.variants[0].timeSignatureMap[0].numerator = 5;
  assert.ok(validateExercise(value).length);
  value.variants[0].measures.forEach(item => { item.incomplete = true; });
  assert.deepEqual(validateExercise(value), []);
});
test('timing integrates written tempo changes and practice speed with exact inverse mapping', () => {
  const { variant, tpq } = fixture();
  assert.equal(secondsAt(variant, 3840, tpq, .5), 4);
  assert.equal(secondsAt(variant, 7680, tpq, .5), 8.8);
  assert.equal(tickAt(variant, 5.2, tpq, .5), 4800);
});
test('sounding timeline preserves chords octaves rests trailing silence and independent hands', () => {
  const { variant } = fixture();
  const events = soundingEvents(variant, 0, 7680);
  assert.equal(events.filter(n => n.startTick === 0).length, 3);
  assert.ok(events.some(n => n.pitch === 48));
  assert.ok(events.some(n => n.pitch === 60));
  assert.ok(events.every(n => n.endTick <= 5760));
  assert.ok(!events.some(n => n.startTick === 960));
});
test('explicit sixteenths triplets and swing preserve integer timing without inferred swing', () => {
  const { variant, tpq } = fixture();
  assert.equal(secondsAt(variant, 240, tpq), .125);
  assert.equal(secondsAt(variant, 320, tpq), 1 / 6);
  assert.equal(secondsAt(variant, 640, tpq), 1 / 3);
  assert.equal(secondsAt(variant, 960, tpq) - secondsAt(variant, 640, tpq), 1 / 6 + Number.EPSILON / 8);
});
test('pedal extends releases through pedal-up and clips crossings at half-open loop bounds', () => {
  const { variant } = fixture();
  variant.notes[0].durationTicks = 240;
  const events = soundingEvents(variant, 320, 1920);
  assert.equal(events.find(n => n.id === 'n1').endTick, 1920);
  assert.equal(events.find(n => n.id === 'n1').startTick, 320);
  assert.ok(events.every(n => n.startTick < 1920));
});
test('compound meter click groups and imported triplet subdivisions use separate timing units', () => {
  const { variant } = fixture();
  variant.timeSignatureMap[0] = { tick: 0, numerator: 6, denominator: 8 };
  const clicks = clickGrid(variant, 960);
  assert.ok(clicks.some(c => c.tick === 1440 && c.beat));
  assert.ok(clicks.some(c => c.tick === 320 && !c.beat));
  variant.timeSignatureMap[0].denominator = 4;
  assert.ok(clickGrid(variant, 960).some(c => c.tick === 2880 && c.beat));
});
test('acceleration changes at boundaries by percentage points and never exceeds target', () => {
  const acceleration = { enabled: true, start: .5, increment: 7, every: 2, target: .8 };
  assert.equal(nextSpeed(acceleration, 1, 1), .5);
  assert.equal(nextSpeed(acceleration, 3, 1), .57);
  assert.equal(nextSpeed(acceleration, 100, 1), .8);
});
test('transport schedules by audio clock pauses seeks resumes and cancels voices', () => {
  const audio = fakeAudio();
  const { exercise, variant } = fixture();
  const player = createPlayer({ audio, exercise, variant, settings: { speed: .5 }, automatic: false });
  player.play(); audio.time = 1; player.pump(); player.pause();
  assert.equal(player.snapshot().tick, 960);
  const before = audio.calls.length;
  player.play(); assert.ok(audio.calls.length > before);
  player.seek(3840); assert.equal(player.snapshot().tick, 3840);
  player.stop(); assert.equal(player.snapshot().tick, 0);
  assert.equal(audio.calls.at(-1)[0], 'clear');
  player.dispose();
});
test('transport applies imported velocity track mute volume and zero accent emphasis', () => {
  const audio = fakeAudio(); const { exercise, variant } = fixture();
  const player = createPlayer({ audio, exercise, variant, settings: { accent: 0, tracks: { lh: { mute: true, volume: 1 }, rh: { mute: false, volume: .5 } } }, automatic: false });
  player.play();
  const notes = audio.calls.filter(c => c[0] === 'note').map(c => c[1]);
  assert.ok(notes.every(n => n.trackId === 'rh'));
  assert.equal(notes.find(n => n.id === 'n5').gain, 72 / 127 * .5);
  player.dispose();
});
test('loop gaps count-ins repetition and acceleration share clock and clear pedal at boundaries', () => {
  const audio = fakeAudio(); const { exercise, variant } = fixture();
  const settings = { speed: .5, loop: { enabled: true, startTick: 0, endTick: 960 }, gap: 2, countIn: 'every', countBars: 1, acceleration: { enabled: true, start: .5, increment: 10, every: 1, target: .6 } };
  const player = createPlayer({ audio, exercise, variant, settings, automatic: false });
  player.play(); assert.equal(player.snapshot().phase, 'count-in');
  audio.time = 5; player.pump(); assert.equal(player.snapshot().phase, 'gap');
  audio.time = 7; player.pump(); assert.equal(player.snapshot().phase, 'count-in');
  assert.equal(player.snapshot().repetition, 2); assert.equal(player.snapshot().speed, .6);
  player.dispose();
});
test('library import failure preserves selection content preferences and musical export roundtrip', () => {
  let data = {};
  const service = { read: () => data, save: next => { data = next; return data; } };
  const library = playerLibrary(service);
  assert.equal(library.read().exercises.length, 0);
  library.importText(JSON.stringify(example()));
  const before = JSON.stringify(data);
  assert.throws(() => library.importText('{}'));
  assert.equal(JSON.stringify(data), before);
  library.preferences(example().id, { speed: .5 });
  const exported = library.exportText(example().id);
  assert.equal(JSON.parse(exported).speed, undefined);
  assert.equal(parseExercise(exported).id, example().id);
  assert.equal(playerLibrary(service).read().preferences[example().id].speed, .5);
});
