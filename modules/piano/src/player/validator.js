import { shapeErrors } from './shape-validator.js';

function unique(items, path, errors) {
  const seen = new Set();
  items.forEach((item, index) => {
    if (seen.has(item.id)) errors.push(`${path}[${index}].id: duplicate ${item.id}`);
    seen.add(item.id);
  });
}
function orderedMap(items, path, length, errors) {
  if (items[0].tick !== 0) errors.push(`${path}[0].tick: must start at 0`);
  items.forEach((item, index) => {
    if (item.tick >= length) errors.push(`${path}[${index}].tick: outside variant`);
    if (index && item.tick <= items[index - 1].tick) errors.push(`${path}[${index}].tick: must be strictly increasing`);
  });
}
function regions(items, path, length, errors) {
  items.forEach((item, index) => {
    if (item.startTick >= item.endTick || item.endTick > length) errors.push(`${path}[${index}]: require startTick < endTick <= lengthTicks`);
    if (index && item.startTick < items[index - 1].endTick) errors.push(`${path}[${index}]: regions overlap or are unordered`);
  });
}
function measures(variant, path, tpq, errors) {
  regions(variant.measures, `${path}.measures`, variant.lengthTicks, errors);
  let end = 0;
  variant.measures.forEach((item, index) => {
    const meter = variant.timeSignatureMap.filter(entry => entry.tick <= item.startTick).at(-1);
    if (item.startTick !== end) errors.push(`${path}.measures[${index}]: measures must cover timeline without gaps`);
    const expected = tpq * 4 * meter.numerator / meter.denominator;
    if (item.endTick - item.startTick > expected) errors.push(`${path}.measures[${index}]: measure exceeds its meter length`);
    if (item.endTick - item.startTick !== expected && !item.incomplete) errors.push(`${path}.measures[${index}].incomplete: set true for pickup/incomplete measure`);
    end = item.endTick;
  });
  if (end !== variant.lengthTicks) errors.push(`${path}.measures: final endTick must equal lengthTicks`);
  variant.timeSignatureMap.forEach(entry => {
    if (!variant.measures.some(item => item.startTick === entry.tick)) errors.push(`${path}.timeSignatureMap: changes must start on measure boundaries`);
  });
}
function events(variant, tracks, path, errors) {
  variant.notes.forEach((note, index) => {
    if (!tracks.has(note.trackId)) errors.push(`${path}.notes[${index}].trackId: unknown track ${note.trackId}`);
    if (note.startTick + note.durationTicks > variant.lengthTicks) errors.push(`${path}.notes[${index}] (${note.id}): note ends beyond lengthTicks`);
  });
  const pedalPositions = new Set();
  for (const [index, event] of (variant.pedalEvents ?? []).entries()) {
    if (!tracks.has(event.trackId)) errors.push(`${path}.pedalEvents[${index}].trackId: unknown track`);
    if (event.tick > variant.lengthTicks) errors.push(`${path}.pedalEvents[${index}].tick: outside variant`);
    const key = JSON.stringify([event.trackId, event.tick]);
    if (pedalPositions.has(key)) errors.push(`${path}.pedalEvents[${index}]: duplicate track/tick`);
    pedalPositions.add(key);
  }
}
function variantErrors(variant, exercise, path, errors) {
  for (const name of ['notes', 'measures', 'subdivisionRegions', 'pedalEvents', 'scoreReferences']) unique(variant[name] ?? [], `${path}.${name}`, errors);
  orderedMap(variant.tempoMap, `${path}.tempoMap`, variant.lengthTicks, errors);
  orderedMap(variant.timeSignatureMap, `${path}.timeSignatureMap`, variant.lengthTicks, errors);
  if (variant.timeSignatureMap[0].tick !== 0) return;
  measures(variant, path, exercise.ticksPerQuarter ?? 960, errors);
  regions(variant.subdivisionRegions ?? [], `${path}.subdivisionRegions`, variant.lengthTicks, errors);
  events(variant, new Set(exercise.tracks.map(item => item.id)), path, errors);
  scoreReferences(variant, path, errors);
}
function scoreReferences(variant, path, errors) {
  for (const reference of variant.scoreReferences ?? []) {
    if (reference.measureId && !variant.measures.some(item => item.id === reference.measureId)) errors.push(`${path}.scoreReferences (${reference.id}).measureId: unknown measure`);
  }
}
export function validateExercise(value) {
  const errors = shapeErrors(value);
  if (errors.length) return errors;
  unique(value.tracks, '$.tracks', errors);
  unique(value.variants, '$.variants', errors);
  if (!value.variants.some(item => item.id === value.defaultVariantId)) errors.push('$.defaultVariantId: unknown variant');
  value.variants.forEach((variant, index) => variantErrors(variant, value, `$.variants[${index}]`, errors));
  return errors;
}
export function parseExercise(text) {
  let value;
  try { value = JSON.parse(text); } catch (error) { throw new Error(`JSON: ${error.message}`); }
  const errors = validateExercise(value);
  if (errors.length) throw new Error(errors.join('\n'));
  return { ...value, ticksPerQuarter: value.ticksPerQuarter ?? 960 };
}
