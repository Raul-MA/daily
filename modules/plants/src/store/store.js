import * as legacy from './legacy.js';
import { getPlantBinding } from './binding.js';
import { TASK_TYPES } from './constants.js';
import { validatePlants } from './validation.js';
export { validatePlants } from './validation.js';
export { markDataExported, getBackupStatus, shouldEncourageBackup, shouldShowBackupReminder, markBackupReminderShown, requestPersistentStorage } from './metadata.js';

export function getPlants() { return getPlantBinding()?.getPlants() ?? legacy.getPlants(); }
export function savePlants(plants, options) {
  const binding = getPlantBinding();
  if (binding) return binding.savePlants(plants);
  return legacy.savePlants(plants, options);
}

export function getPlant(id) {
  return getPlants().find(p => p.id === id) ?? null;
}

export function addPlant(plant) {
  const plants = getPlants();
  plants.push(plant);
  savePlants(plants);
}

export function updatePlant(id, updates) {
  const plants = getPlants();
  const i = plants.findIndex(p => p.id === id);
  if (i === -1) return;
  plants[i] = { ...plants[i], ...updates };
  savePlants(plants);
}

export function deletePlant(id) {
  savePlants(getPlants().filter(p => p.id !== id));
}

export function addCareLog(plantId, entry) {
  const plants = getPlants();
  const plant = plants.find(p => p.id === plantId);
  if (!plant) return;
  if (!Array.isArray(plant.careLog)) plant.careLog = [];
  plant.careLog.push(entry);
  savePlants(plants);
}

export function addCareLogAndSetNextDue(plantId, entry, careType, nextDueDate) {
  if (!TASK_TYPES.has(careType)) throw new Error('Tipo de cuidado inválido');

  const plants = getPlants();
  const plant = plants.find(p => p.id === plantId);
  if (!plant) return;

  const schedule = plant.schedule ?? {};
  const nextDueOverrides = { ...(schedule.nextDueOverrides ?? {}) };
  if (nextDueDate) nextDueOverrides[careType] = nextDueDate;
  else delete nextDueOverrides[careType];

  plant.schedule = {
    ...schedule,
    nextDueOverrides: Object.keys(nextDueOverrides).length > 0
      ? nextDueOverrides
      : undefined,
  };
  if (!Array.isArray(plant.careLog)) plant.careLog = [];
  plant.careLog.push(entry);
  savePlants(plants);
}

export function updateCareLog(plantId, entryId, updates) {
  const plants = getPlants();
  const plant = plants.find(p => p.id === plantId);
  if (!plant) return;
  const i = (plant.careLog ?? []).findIndex(e => e.id === entryId);
  if (i === -1) return;
  plant.careLog[i] = { ...plant.careLog[i], ...updates };
  savePlants(plants);
}

export function deleteCareLog(plantId, entryId) {
  const plants = getPlants();
  const plant = plants.find(p => p.id === plantId);
  if (!plant) return;
  plant.careLog = (plant.careLog ?? []).filter(e => e.id !== entryId);
  savePlants(plants);
}

export function exportData() {
  return JSON.stringify(getPlants(), null, 2);
}

export function importData(json) {
  const data = JSON.parse(json);
  validatePlants(data);
  savePlants(data, { replaceCorrupt: true });
}

const LEGACY_TEMPLATE_SPECIES = { xanadu: ['Thaumatophyllum xanadu'] };

function normalizeSpecies(value) {
  return String(value ?? '').trim().toLocaleLowerCase();
}

function findPlantTemplate(plant, templates) {
  const byId = templates.find(template => template.id === plant.templateId);
  if (byId) return byId;

  const plantSpecies = normalizeSpecies(plant.species);
  if (!plantSpecies) return null;

  return templates.find(template => {
    const acceptedSpecies = [
      template.species,
      ...(LEGACY_TEMPLATE_SPECIES[template.id] ?? []),
    ];
    return acceptedSpecies.some(species => normalizeSpecies(species) === plantSpecies);
  }) ?? null;
}

function scheduleFromTemplate(template, existingSchedule) {
  const schedule = JSON.parse(JSON.stringify(template.schedule));
  const overrides = existingSchedule?.nextDueOverrides;
  if (overrides && typeof overrides === 'object') {
    schedule.nextDueOverrides = { ...overrides };
  }
  return schedule;
}

export function updatePlantCareFromTemplates(templates) {
  const plants = getPlants();
  let matched = 0;
  let updated = 0;

  const refreshed = plants.map(plant => {
    const template = findPlantTemplate(plant, templates);
    if (!template) return plant;
    matched += 1;

    const next = {
      ...plant,
      templateId: template.id,
      species: template.species,
      schedule: scheduleFromTemplate(template, plant.schedule),
    };

    if (JSON.stringify(next) !== JSON.stringify(plant)) updated += 1;
    return next;
  });

  if (updated > 0) savePlants(refreshed);
  return { total: plants.length, matched, updated, unmatched: plants.length - matched };
}
