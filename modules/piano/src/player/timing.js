export function tempoAt(variant, tick) { return variant.tempoMap.filter(entry => entry.tick <= tick).at(-1).quarterBpm; }
export function meterAt(variant, tick) { return variant.timeSignatureMap.filter(entry => entry.tick <= tick).at(-1); }
export function beatTicks(meter, tpq) {
  const compound = meter.numerator > 3 && meter.numerator % 3 === 0;
  return tpq * 4 / meter.denominator * (compound ? 3 : 1);
}
export function secondsAt(variant, tick, tpq = 960, speed = 1) {
  let seconds = 0;
  variant.tempoMap.forEach((entry, index) => {
    const end = Math.min(tick, variant.tempoMap[index + 1]?.tick ?? tick);
    seconds += Math.max(0, end - entry.tick) * 60 / (tpq * entry.quarterBpm * speed);
  });
  return seconds;
}
export function tickAt(variant, seconds, tpq = 960, speed = 1) {
  let remaining = Math.max(0, seconds);
  for (const [index, entry] of variant.tempoMap.entries()) {
    const end = variant.tempoMap[index + 1]?.tick ?? variant.lengthTicks;
    const rate = tpq * entry.quarterBpm * speed / 60;
    const duration = (end - entry.tick) / rate;
    if (remaining <= duration) return entry.tick + remaining * rate;
    remaining -= duration;
  }
  return variant.lengthTicks;
}
function releaseTick(note, variant) {
  const release = note.startTick + note.durationTicks;
  const pedals = (variant.pedalEvents ?? []).filter(event => event.trackId === note.trackId).sort((a, b) => a.tick - b.tick);
  const state = pedals.filter(event => event.tick <= release).at(-1);
  if (!state?.down) return release;
  return pedals.find(event => event.tick > release && !event.down)?.tick ?? variant.lengthTicks;
}
export function soundingEvents(variant, start, end) {
  return variant.notes.map(note => ({ ...note, startTick: Math.max(start, note.startTick), endTick: Math.min(end, releaseTick(note, variant)) }))
    .filter(note => note.startTick < note.endTick && note.startTick < end);
}
function addClicks(grid, range, sequence) {
  const first = sequence.start + Math.max(0, Math.ceil((range.start - sequence.start) / sequence.step)) * sequence.step;
  const end = Math.min(range.end, sequence.end);
  if ((end - first) / sequence.step > 4096) throw new Error('Metronome grid is too dense. Choose beats or a larger subdivision.');
  for (let tick = first; tick < end; tick += sequence.step) {
    if (!grid.has(tick)) grid.set(tick, sequence.click(tick));
  }
}
function measureClicks(grid, measure, context) {
  const meter = meterAt(context.variant, measure.startTick);
  const beat = beatTicks(meter, context.tpq);
  const step = context.range.mode === 'beats' ? beat : context.tpq * 4 / meter.denominator;
  addClicks(grid, context.range, { start: measure.startTick, end: measure.endTick, step, click: tick => ({ tick, beat: (tick - measure.startTick) % beat === 0, strong: tick === measure.startTick }) });
}
export function clickGrid(variant, tpq, options = {}) {
  const range = { start: 0, end: variant.lengthTicks, mode: 'subdivisions', ...options };
  const grid = new Map();
  for (const measure of variant.measures) measureClicks(grid, measure, { variant, tpq, range });
  if (range.mode === 'subdivisions') {
    for (const region of variant.subdivisionRegions ?? []) addClicks(grid, range, { start: region.startTick, end: region.endTick, step: region.stepTicks, click: tick => ({ tick, beat: false, strong: false }) });
  }
  return [...grid.values()].sort((a, b) => a.tick - b.tick);
}
export function nextSpeed(acceleration, repetition, fallback) {
  if (!acceleration.enabled) return fallback;
  return Math.min(acceleration.target, Math.round((acceleration.start + Math.floor((repetition - 1) / acceleration.every) * acceleration.increment / 100) * 10000) / 10000);
}
export function positionLabel(variant, tick, tpq) {
  const positionTick = Math.min(tick, variant.lengthTicks - 1);
  const measure = variant.measures.find(item => item.startTick <= positionTick && positionTick < item.endTick) ?? variant.measures.at(-1);
  const beat = Math.floor((positionTick - measure.startTick) / beatTicks(meterAt(variant, positionTick), tpq)) + 1;
  const region = (variant.subdivisionRegions ?? []).find(item => item.startTick <= positionTick && positionTick < item.endTick);
  const subdivision = region ? region.labels[Math.floor((positionTick - region.startTick) / region.stepTicks) % region.labels.length] : '';
  return { measure, beat, subdivision };
}
