import { stored } from './library.js';
import { secondsAt, soundingEvents, clickGrid, beatTicks, meterAt, tempoAt, nextSpeed, tickAt } from './timing.js';

function noteGain(note, settings) {
  const track = stored(settings.tracks, note.trackId, { volume: 1, mute: false });
  if (track.mute) return 0;
  return Math.min(1, note.velocity / 127 * (1 + (note.accent ? settings.accent : 0))) * track.volume;
}
export function makeCycle(ctx, input) {
  const { variant, tpq, settings } = ctx;
  const speed = nextSpeed(settings.acceleration, input.repetition, settings.speed);
  const endTick = settings.loop.enabled ? settings.loop.endTick : variant.lengthTicks;
  const count = settings.countIn === 'every' || (settings.countIn === 'first' && input.repetition === 1);
  const meter = meterAt(variant, input.tick);
  const beat = beatTicks(meter, tpq);
  const beats = meter.numerator * tpq * 4 / meter.denominator / beat;
  const beatSeconds = beat / tpq * 60 / (tempoAt(variant, input.tick) * speed);
  const countBeats = count && !input.resume ? settings.countBars * beats : 0;
  const startTime = input.time + countBeats * beatSeconds;
  const origin = secondsAt(variant, input.tick, tpq, speed);
  const endTime = startTime + secondsAt(variant, endTick, tpq, speed) - origin;
  return { ...input, startTime, endTime, endTick, speed, origin, countBeats, beatSeconds, beats };
}
export function scheduleCycle(ctx, cycle) {
  const { variant, tpq, settings, audio } = ctx;
  const at = tick => cycle.startTime + secondsAt(variant, tick, tpq, cycle.speed) - cycle.origin;
  const events = soundingEvents(variant, cycle.tick, cycle.endTick);
  for (const note of events) {
    const gain = noteGain(note, settings);
    if (gain && at(note.endTick) > audio.now()) audio.note({ ...note, when: Math.max(audio.now(), at(note.startTick)), until: at(note.endTick), gain });
  }
  scheduleClicks(ctx, cycle, at);
}
export function extendClicks(ctx, cycle) {
  const at = tick => cycle.startTime + secondsAt(ctx.variant, tick, ctx.tpq, cycle.speed) - cycle.origin;
  scheduleClicks(ctx, cycle, at);
}
function scheduleClicks(ctx, cycle, at) {
  const startTime = Math.max(cycle.clickUntil ?? cycle.time, ctx.audio.now());
  const horizon = ctx.audio.now() + .15;
  countClicks(ctx, cycle, { startTime, horizon });
  cycle.clickUntil = horizon;
  if (ctx.settings.metronome === 'off') return;
  const start = Math.max(cycle.tick, tickAt(ctx.variant, cycle.origin + startTime - cycle.startTime, ctx.tpq, cycle.speed));
  const end = Math.min(cycle.endTick, tickAt(ctx.variant, cycle.origin + horizon - cycle.startTime, ctx.tpq, cycle.speed));
  const clicks = clickGrid(ctx.variant, ctx.tpq, { start, end, mode: ctx.settings.metronome });
  for (const click of clicks) {
    if (click.beat || ctx.settings.metronome === 'subdivisions') scheduleClick(ctx.audio, { when: at(click.tick), until: Math.min(at(click.tick) + .04, cycle.endTime), strong: click.strong, subdivision: !click.beat });
  }
}
function scheduleClick(audio, event) { if ((event.until ?? Infinity) <= audio.now()) return; if (event.when >= audio.now() - .01) audio.click({ ...event, when: Math.max(event.when, audio.now()) }); }
function countClicks(ctx, cycle, range) {
  for (let index = 0; index < cycle.countBeats; index++) {
    const when = cycle.time + index * cycle.beatSeconds;
    if (when >= range.startTime && when < range.horizon) scheduleClick(ctx.audio, { when, strong: index % cycle.beats === 0 });
  }
}
