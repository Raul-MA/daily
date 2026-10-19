import { getPlantBinding } from '../store/binding.js';
const SETTINGS_KEY = 'stillgreen_things_settings';

export const THINGS_SHORTCUT_NAME = 'Stillgreen to Things';

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

export function buildThingsShortcutURL({ title, date, project }) {
  if (!title || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !project) {
    throw new Error('Recordatorio de Things inválido');
  }

  const payload = JSON.stringify({
    version: 1,
    title,
    date,
    project,
  });

  return `shortcuts://run-shortcut?name=${encodeURIComponent(THINGS_SHORTCUT_NAME)}`
    + `&input=text&text=${encodeURIComponent(payload)}`;
}

export function openWateringReminderInThings(plantName, date) {
  const settings = getThingsSettings();
  if (!settings.enabled) return false;

  const url = buildThingsShortcutURL({
    title: wateringReminderTitle(plantName),
    date,
    project: settings.project,
  });
  window.location.href = url;
  return true;
}
