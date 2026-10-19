import { CARE_TYPES, TASK_TYPES } from './constants.js';

export function isObject(value) { return value !== null && typeof value === 'object' && !Array.isArray(value); }
export function isString(value, { required = false, max = 10000 } = {}) {
  return typeof value === 'string' && (!required || value.trim().length > 0) && value.length <= max;
}
export function isSafeId(value) { return isString(value, { required: true, max: 200 }) && /^[A-Za-z0-9_-]+$/.test(value); }
export function isValidDate(value) { return typeof value === 'string' && value.length <= 40 && !Number.isNaN(Date.parse(value)); }
export function isNumberInRange(value, min, max) { return typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max; }
function optional(value, validate) { return value == null || validate(value); }
function month(value) { return Number.isInteger(value) && isNumberInRange(value, 1, 12); }

export function validateSeason(season, intervalKey, nullable = false) {
  if (!isObject(season) || !month(season.startMonth) || !month(season.endMonth)) return false;
  const value = season[intervalKey];
  if (nullable && value === null) return true;
  return isNumberInRange(value, 1, intervalKey === 'intervalDays' ? 365 : 52);
}

function seasonList(value, type) {
  const key = type === 'watering' ? 'intervalDays' : 'intervalWeeks';
  return Array.isArray(value) && value.every(season => validateSeason(season, key, type === 'fertilizer'));
}

function dueOverrides(value) {
  return isObject(value) && Object.entries(value).every(([type, date]) => TASK_TYPES.has(type) && isValidDate(date));
}

export function validateSchedule(schedule) {
  if (!isObject(schedule)) return false;
  const ranges = [['wateringIntervalDays', 365], ['soilIntervalMonths', 120], ['fertilizerIntervalWeeks', 52]];
  const validRanges = ranges.every(([key, max]) => optional(schedule[key], value => isNumberInRange(value, 1, max)));
  return validRanges && optional(schedule.wateringSeasons, value => seasonList(value, 'watering'))
    && optional(schedule.fertilizerSeasons, value => seasonList(value, 'fertilizer'))
    && optional(schedule.nextDueOverrides, dueOverrides);
}

export function validateCareEntry(entry) {
  return isObject(entry) && isSafeId(entry.id) && CARE_TYPES.has(entry.type) && isValidDate(entry.date)
    && optional(entry.note, isString) && optional(entry.careType, type => TASK_TYPES.has(type));
}

function validateIdentity(plant) {
  if (!isSafeId(plant.id) || !isString(plant.name, { required: true, max: 500 })) return false;
  const fields = ['commonName', 'species', 'location', 'notes', 'templateId'];
  return fields.every(key => optional(plant[key], isString)) && optional(plant.difficulty, value => isNumberInRange(value, 0, 5));
}

export function validatePlant(plant) {
  if (!isObject(plant) || !validateIdentity(plant) || !isValidDate(plant.dateAdded)) return false;
  if (!validateSchedule(plant.schedule) || !Array.isArray(plant.careLog)) return false;
  return plant.careLog.every(validateCareEntry) && new Set(plant.careLog.map(entry => entry.id)).size === plant.careLog.length;
}

export function validatePlants(plants) {
  if (!Array.isArray(plants)) throw new Error('Formato inválido: se esperaba una lista de plantas');
  const ids = new Set();
  for (const plant of plants) {
    if (!validatePlant(plant)) throw new Error('El respaldo contiene una planta o registro inválido');
    if (ids.has(plant.id)) throw new Error('El respaldo contiene identificadores de planta duplicados');
    ids.add(plant.id);
  }
  return plants;
}
