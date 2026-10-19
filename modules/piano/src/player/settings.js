export function defaults(variant) {
  return { variantId: variant.id, speed: 1, accent: .25, tracks: {}, loop: { enabled: false, startTick: 0, endTick: variant.lengthTicks }, metronome: 'off', countIn: 'none', countBars: 1, gap: 0, acceleration: { enabled: false, start: .5, increment: 5, every: 3, target: 1 } };
}
function range(value, min, max) { return Number.isFinite(value) && value >= min && value <= max; }
function validAcceleration(value) {
  if (!value || typeof value.enabled !== 'boolean') return false;
  return range(value.start, .25, 1.5) && range(value.target, value.start, 1.5) && range(value.increment, .1, 100) && Number.isInteger(value.every) && range(value.every, 1, 1000);
}
function validLoop(value, variant) {
  return value && typeof value.enabled === 'boolean' && Number.isSafeInteger(value.startTick) && Number.isSafeInteger(value.endTick) && value.startTick >= 0 && value.startTick < value.endTick && value.endTick <= variant.lengthTicks;
}
export function validSettings(value, exercise) {
  if (!value) return false;
  const variant = exercise.variants.find(item => item.id === value.variantId);
  if (!variant || !validLoop(value.loop, variant)) return false;
  if (!validLevels(value) || !validCount(value) || !validAcceleration(value.acceleration)) return false;
  return validTracks(value.tracks, exercise);
}
function validLevels(value) { return range(value.speed, .25, 1.5) && range(value.accent, 0, 1) && range(value.gap, 0, 120); }
function validCount(value) { return ['off', 'beats', 'subdivisions'].includes(value.metronome) && ['none', 'first', 'every'].includes(value.countIn) && Number.isInteger(value.countBars) && range(value.countBars, 1, 4); }
function validTracks(tracks, exercise) {
  if (!tracks || typeof tracks !== 'object' || Array.isArray(tracks)) return false;
  return Object.entries(tracks).every(([id, value]) => exercise.tracks.some(track => track.id === id) && value && typeof value.mute === 'boolean' && range(value.volume, 0, 1));
}
export function mergeSettings(variant, input = {}) {
  const base = defaults(variant);
  return { ...base, ...input, loop: { ...base.loop, ...input.loop }, acceleration: { ...base.acceleration, ...input.acceleration } };
}
