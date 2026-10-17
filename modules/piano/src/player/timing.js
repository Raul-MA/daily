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
function measureClicks(variant, measure, tpq) {
  const meter = meterAt(variant, measure.startTick);
  const step = tpq * 4 / meter.denominator;
  const beat = beatTicks(meter, tpq);
  const clicks = [];
  for (let tick = measure.startTick; tick < measure.endTick; tick += step) clicks.push({ tick, beat: (tick - measure.startTick) % beat === 0, strong: tick === measure.startTick });
  return clicks;
}
export function clickGrid(variant, tpq) {
  const grid = variant.measures.flatMap(measure => measureClicks(variant, measure, tpq));
  for (const region of variant.subdivisionRegions ?? []) {
    for (let tick = region.startTick; tick < region.endTick; tick += region.stepTicks) {
      if (!grid.some(click => click.tick === tick)) grid.push({ tick, beat: false, strong: false });
    }
  }
  return grid.sort((a, b) => a.tick - b.tick);
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
