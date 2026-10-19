import { DataConflictError } from '../../../packages/data/src/errors.js';
import { createModuleStore } from '../../../packages/data/src/module-store.js';
import { isObject, validatePlants, isValidDate } from './store/validation.js';
import { bindPlants } from './store/binding.js';
import { parseDocument } from './store/envelope.js';
import { BACKUP_META_KEY, STORAGE_META_KEY } from './store/constants.js';

function initial() {
  return { plants: [], things: { enabled: false, project: '' }, backup: { lastExportAt: null, changesSinceExport: 0, lastReminderAt: null }, storage: { persistenceRequested: false, persistent: false, checkedAt: null } };
}

function validThings(value) {
  return isObject(value) && typeof value.enabled === 'boolean' && typeof value.project === 'string' && (!value.enabled || value.project.trim().length > 0);
}

function validBackup(value) {
  if (!isObject(value) || !Number.isInteger(value.changesSinceExport) || value.changesSinceExport < 0) return false;
  return [value.lastExportAt, value.lastReminderAt].every(date => date === null || isValidDate(date));
}

function validStorage(value) {
  return isObject(value) && typeof value.persistenceRequested === 'boolean' && typeof value.persistent === 'boolean' && (value.checkedAt === null || isValidDate(value.checkedAt));
}

function validPayload(value) {
  if (!isObject(value) || !validThings(value.things) || !validBackup(value.backup) || !validStorage(value.storage)) return false;
  try { validatePlants(value.plants); return true; }
  catch { return false; }
}

function imported(text, current) {
  const value = JSON.parse(text);
  if (Array.isArray(value)) return { ...current, plants: validatePlants(value) };
  if (!isObject(value)) throw new Error('Invalid plant backup.');
  if (Object.hasOwn(value, 'schemaVersion')) return { ...current, plants: parseDocument(text).document.plants };
  if (value.app !== 'stillgreen' || value.version !== 1) throw new Error('Unsupported plant backup.');
  const next = { ...current, plants: validatePlants(value.plants), things: value.things };
  if (!validPayload(next)) throw new Error('Invalid plant backup.');
  return next;
}

function importActions(store) {
  function previewImport(text) {
    const current = store.read();
    const candidate = imported(text, current);
    return { count: candidate.plants.length, candidate, expected: JSON.stringify(current) };
  }
  function applyImport(preview) {
    if (JSON.stringify(store.read()) !== preview.expected) throw new DataConflictError();
    if (!validPayload(preview.candidate)) throw new Error('Invalid plant backup.');
    const candidate = preview.candidate;
    return store.save({ ...candidate, backup: { ...candidate.backup, changesSinceExport: candidate.backup.changesSinceExport + 1 } });
  }
  function exportMigration() {
    const current = store.read();
    return JSON.stringify({ app: 'stillgreen', version: 1, plants: current.plants, things: current.things }, null, 2);
  }
  return { previewImport, applyImport, exportMigration };
}

function bindingFor(store) {
  function savePlants(plants) {
    validatePlants(plants);
    const current = store.read();
    return store.save({ ...current, plants, backup: { ...current.backup, changesSinceExport: current.backup.changesSinceExport + 1 } });
  }
  function saveThingsSettings(things) {
    const current = store.read();
    store.save({ ...current, things });
    return things;
  }
  function saveMeta(key, value) {
    const field = key === BACKUP_META_KEY ? 'backup' : 'storage';
    if (![BACKUP_META_KEY, STORAGE_META_KEY].includes(key)) throw new Error('Unknown plant metadata.');
    return store.save({ ...store.read(), [field]: value });
  }
  return { getPlants: () => store.read().plants, savePlants, getThingsSettings: () => store.read().things, saveThingsSettings, readMeta: key => key === BACKUP_META_KEY ? store.read().backup : store.read().storage, saveMeta };
}

export function connectPlants(state) {
  const store = createModuleStore(state, { id: 'plants', version: 1, initial, validate: validPayload });
  const binding = bindingFor(store);
  const stop = bindPlants(binding);
  return { ...binding, ...importActions(store), stop };
}

export { validPayload as validPlantsData };
