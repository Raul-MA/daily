import { parseExercise, validateExercise } from './validator.js';
import { mergeSettings, validSettings } from './settings.js';

export function stored(record, key, fallback) { return Object.hasOwn(record, key) ? record[key] : fallback; }
export function emptyLibrary() { return { exercises: [], selectedId: null, preferences: {}, attachments: {} }; }
export function validLibrary(value) {
  if (value === undefined) return true;
  if (!libraryShape(value)) return false;
  if (!value.exercises.every(item => validateExercise(item).length === 0)) return false;
  const ids = value.exercises.map(item => item.id);
  if (!validSelection(value, ids)) return false;
  if (!Object.entries(value.preferences).every(([id, settings]) => validSettings(settings, value.exercises.find(item => item.id === id) ?? { variants: [] }))) return false;
  return Object.entries(value.attachments).every(([id, refs]) => ids.includes(id) && Array.isArray(refs) && refs.every(validAttachment));
}
function isRecord(value) { return value && typeof value === 'object' && !Array.isArray(value); }
function libraryShape(value) { return value && Array.isArray(value.exercises) && isRecord(value.preferences) && isRecord(value.attachments); }
function validSelection(value, ids) { return new Set(ids).size === ids.length && (value.selectedId === null || ids.includes(value.selectedId)); }
function validAttachment(ref) { return ref && typeof ref.id === 'string' && typeof ref.name === 'string' && ['image/png', 'image/jpeg', 'image/webp', 'application/pdf'].includes(ref.type); }
export function playerLibrary(service) {
  function read() { return structuredClone(service.read().playerLibrary ?? emptyLibrary()); }
  function update(change) {
    const data = service.read();
    const next = change(structuredClone(data.playerLibrary ?? emptyLibrary()));
    if (!validLibrary(next)) throw new Error('Invalid exercise library or practice settings.');
    service.save({ ...data, playerLibrary: next });
    return next;
  }
  function importText(text) {
    const exercise = parseExercise(text);
    update(value => {
      const prior = value.exercises.find(item => item.id === exercise.id);
      if (prior) throw new Error(`Exercise ID ${exercise.id} already exists. Delete it first or import with a new ID.`);
      value.exercises.push(exercise); value.selectedId = exercise.id;
      return value;
    });
    return exercise;
  }
  function preferences(id, input) {
    return update(value => {
      const exercise = value.exercises.find(item => item.id === id);
      const variant = exercise.variants.find(item => item.id === input.variantId) ?? exercise.variants.find(item => item.id === exercise.defaultVariantId);
      value.preferences = { ...value.preferences, [id]: mergeSettings(variant, input) };
      return value;
    });
  }
  return {
    read, update, importText, preferences,
    select: id => update(value => ({ ...value, selectedId: id })),
    replace: exercise => update(value => ({ ...value, exercises: value.exercises.map(item => item.id === exercise.id ? parseExercise(JSON.stringify(exercise)) : item) })),
    remove: id => update(value => {
      value.exercises = value.exercises.filter(item => item.id !== id);
      delete value.preferences[id]; delete value.attachments[id];
      value.selectedId = value.exercises[0]?.id ?? null;
      return value;
    }),
    exportText: id => JSON.stringify(read().exercises.find(item => item.id === id), null, 2),
  };
}
