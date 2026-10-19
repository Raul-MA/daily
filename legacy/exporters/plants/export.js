import { parseDocument } from './envelope.js';

class UnsupportedPlantVersion extends Error {
  constructor() { super('Unsupported plant storage version.'); }
}
function plantsFrom(raw) {
  const value = JSON.parse(raw);
  if (value?.schemaVersion !== undefined && value.schemaVersion !== 1) throw new UnsupportedPlantVersion();
  return parseDocument(raw).document.plants;
}
function readPlants(storage) {
  let invalid = false;
  for (const key of ['plantTracker_plants', 'plantTracker_plants_pending', 'plantTracker_plants_backup_1', 'plantTracker_plants_backup_2']) {
    const raw = storage.getItem(key);
    if (raw === null) continue;
    try { return { plants: plantsFrom(raw), recoverySource: key }; }
    catch (error) {
      if (error instanceof UnsupportedPlantVersion) throw error;
      invalid = true;
    }
  }
  if (invalid) throw new Error('No readable plant recovery. Original records were kept.');
  return { plants: [], recoverySource: null };
}
function readThings(storage) {
  const raw = storage.getItem('stillgreen_things_settings');
  if (raw === null) return { enabled: false, project: '' };
  const value = JSON.parse(raw);
  if (!value || typeof value.enabled !== 'boolean' || typeof value.project !== 'string') throw new Error('Invalid Things settings.');
  if (value.enabled && !value.project.trim()) throw new Error('Invalid enabled Things project.');
  return { enabled: value.enabled, project: value.project };
}
export function exportLegacyPlants(storage) {
  const data = readPlants(storage);
  return JSON.stringify({ app: 'stillgreen', version: 1, ...data, things: readThings(storage) }, null, 2);
}
