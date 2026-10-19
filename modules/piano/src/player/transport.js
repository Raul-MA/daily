import { mergeSettings, validSettings } from './settings.js';
import { tickAt, nextSpeed } from './timing.js';
import { makeCycle, scheduleCycle, extendClicks } from './schedule.js';

function cycleSnapshot(ctx, cycle, now) {
  if (now < cycle.time) return { tick: cycle.tick, phase: 'gap' };
  if (now < cycle.startTime) return { tick: cycle.tick, phase: 'count-in', countBeat: Math.floor((now - cycle.time) / cycle.beatSeconds) % cycle.beats + 1 };
  const tick = tickAt(ctx.variant, cycle.origin + now - cycle.startTime, ctx.tpq, cycle.speed);
  return { tick: Math.min(cycle.endTick, tick), phase: 'playing' };
}
export function createPlayer(options) {
  const ctx = { ...options, tpq: options.exercise.ticksPerQuarter ?? 960, settings: mergeSettings(options.variant, options.settings) };
  if (!validSettings(ctx.settings, ctx.exercise)) throw new Error('Invalid practice settings.');
  const state = { running: false, tick: 0, repetition: 1, cycles: [], timer: null, disposed: false, paused: false };
  const api = buildControls(ctx, state);
  function snapshot() {
    const now = ctx.audio.now();
    const cycle = state.cycles.find(item => now < item.endTime) ?? state.cycles.at(-1);
    const value = state.running && cycle ? cycleSnapshot(ctx, cycle, now) : { tick: state.tick, phase: state.paused ? 'paused' : 'stopped' };
    return { ...value, running: state.running, ...cycleDetails(cycle, state, ctx) };
  }
  function pump() {
    if (!state.running) return;
    const now = ctx.audio.now();
    const last = state.cycles.at(-1);
    if (!ctx.settings.loop.enabled && now >= last.endTime) { api.halt(); state.tick = last.endTick; }
    else if (ctx.settings.loop.enabled) fillHorizon(ctx, state, now);
    for (const cycle of state.cycles) extendClicks(ctx, cycle);
    state.cycles = state.cycles.filter(cycle => cycle.endTime > now || cycle === state.cycles.at(-1));
    options.onFrame?.(snapshot());
  }
  return { ...api, snapshot, pump, play: () => api.start(pump), dispose: () => { api.halt(); state.disposed = true; } };
}
function fillHorizon(ctx, state, now) {
  while (state.cycles.at(-1).endTime < now + .15) appendCycle(ctx, state, state.cycles.at(-1));
}
function cycleDetails(cycle, state, ctx) { return { repetition: cycle?.repetition ?? state.repetition, speed: cycle?.speed ?? nextSpeed(ctx.settings.acceleration, state.repetition, ctx.settings.speed) }; }
function followingCycle(ctx, last) {
  return makeCycle(ctx, { tick: ctx.settings.loop.startTick, time: last.endTime + ctx.settings.gap, repetition: last.repetition + 1 });
}
function appendCycle(ctx, state, last) {
  let cycle = followingCycle(ctx, last);
  const now = ctx.audio.now();
  while (cycle.endTime <= now) cycle = catchUpCycle(ctx, cycle, now);
  state.cycles.push(cycle); scheduleCycle(ctx, cycle);
}
function catchUpCycle(ctx, cycle, now) {
  const acceleration = ctx.settings.acceleration;
  if (acceleration.enabled && cycle.speed < acceleration.target) return followingCycle(ctx, cycle);
  const next = followingCycle(ctx, cycle);
  const period = next.endTime - cycle.endTime;
  const skipped = Math.floor((now - cycle.endTime) / period) + 1;
  return makeCycle(ctx, { tick: ctx.settings.loop.startTick, time: cycle.time + skipped * period, repetition: cycle.repetition + skipped });
}
function buildControls(ctx, state) {
  function halt() { clearInterval(state.timer); state.timer = null; state.running = false; ctx.audio.clear(); }
  function position() {
    const now = ctx.audio.now();
    const cycle = state.cycles.find(item => now < item.endTime) ?? state.cycles.at(-1);
    return cycleSnapshot(ctx, cycle, now);
  }
  function pause() {
    if (!state.running) return;
    state.tick = position().tick;
    state.repetition = state.cycles.find(item => ctx.audio.now() < item.endTime)?.repetition ?? 1;
    halt(); state.cycles = []; state.paused = true;
  }
  function start(pump) {
    if (state.running || state.disposed) return;
    if (state.tick >= ctx.variant.lengthTicks) state.tick = 0;
    const tick = startTick(ctx, state.tick);
    const cycle = makeCycle(ctx, { tick, time: ctx.audio.now(), repetition: state.repetition, resume: state.paused });
    state.cycles = [cycle]; scheduleCycle(ctx, cycle); state.running = true; state.paused = false;
    if (ctx.automatic !== false) state.timer = setInterval(() => {
      try { pump(); } catch (error) { halt(); ctx.onError?.(error); }
    }, 25);
    pump();
  }
  function seek(tick) {
    if (!Number.isFinite(tick) || tick < 0 || tick > ctx.variant.lengthTicks) throw new Error('Seek position outside exercise.');
    const running = state.running; halt(); state.cycles = []; state.tick = tick; state.paused = running || state.paused;
    if (running) start(ctx.pump);
  }
  function configure(input) {
    const settings = mergeSettings(ctx.variant, input);
    if (!validSettings(settings, ctx.exercise)) throw new Error('Invalid practice settings.');
    const running = state.running;
    if (running) pause();
    ctx.settings = settings;
    if (running) start(ctx.pump);
  }
  const startWithPump = pump => { ctx.pump = pump; start(pump); };
  return { halt, start: startWithPump, pause, seek, configure, stop: () => { halt(); state.cycles = []; state.tick = 0; state.repetition = 1; state.paused = false; } };
}
function startTick(ctx, tick) {
  if (!ctx.settings.loop.enabled) return tick;
  if (tick < ctx.settings.loop.startTick || tick >= ctx.settings.loop.endTick) return ctx.settings.loop.startTick;
  return tick;
}
