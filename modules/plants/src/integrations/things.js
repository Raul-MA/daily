import { getPlantBinding } from '../store/binding.js';
const SETTINGS_KEY = 'stillgreen_things_settings';

export const THINGS_PROJECT_NAME = 'Plantas';

const DEFAULT_SETTINGS = Object.freeze({
  enabled: false,
  project: '',
});

export function getThingsSettings() {
  const binding = getPlantBinding();
  if (binding) return binding.getThingsSettings();
  try {
    const stored = JSON.parse(localStorage.getItem(SETTINGS_KEY));
    if (!stored || typeof stored !== 'object') return { ...DEFAULT_SETTINGS };
    return {
      enabled: stored.enabled === true,
      project: typeof stored.project === 'string' ? stored.project.trim() : '',
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveThingsSettings({ enabled, project }) {
  const next = {
    enabled: enabled === true,
    project: String(project ?? '').trim(),
  };
  if (next.enabled && !next.project) {
    throw new Error('Escribe el nombre del proyecto de Things');
  }
  const binding = getPlantBinding();
  if (binding) return binding.saveThingsSettings(next);
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
  return next;
}

export function wateringReminderTitle(plantName) {
  return `Revisar riego — ${String(plantName).trim()}`;
}

function thingsNotes(plant, date, copy) {
  return [
    plant.species ? `${copy.species}: ${plant.species}` : '',
    plant.location ? `${copy.location}: ${plant.location}` : '',
    `${copy.next}: ${date}`,
    copy.thingsCheck,
    plant.notes ? `${copy.notes}:\n${plant.notes}` : '',
  ].filter(Boolean).join('\n\n');
}

function thingsQuery(values) {
  return new URLSearchParams(values).toString().replaceAll('+', '%20');
}

export function buildThingsTodoURL({ plant, type, date, project = THINGS_PROJECT_NAME, copy }) {
  if (!copy[type] || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  const notes = thingsNotes(plant, date, copy);
  const params = thingsQuery({ title: `${copy[type]} — ${plant.name}`, notes, when: date, list: project, reveal: 'true' });
  return `things:///add?${params}`;
}

export function buildThingsProjectURL(project = THINGS_PROJECT_NAME) {
  return `things:///add-project?${thingsQuery({ title: project, reveal: 'true' })}`;
}

export function buildThingsRemindersURL(reminders, copy, project = THINGS_PROJECT_NAME) {
  if (!reminders.length) return null;
  const items = ['watering', 'soil', 'fertilizer'].flatMap(type => reminders.filter(item => item.type === type))
    .map(({ plant, type, info }) => ({ type: 'to-do', attributes: { title: `${copy[type]} — ${plant.name}`, when: info.nextDue, notes: thingsNotes(plant, info.nextDue, copy), list: project } }));
  return `things:///json?data=${encodeURIComponent(JSON.stringify(items))}`;
}
