import { getEntry } from '../../backend/features/entries.js';
import { getBeanPreset } from '../../backend/features/beans.js';
import { getSettings } from '../../backend/features/settings.js';
import { DataConflictError } from '../../../../../packages/data/src/errors.js';

export function checkEntry(form, entry) {
  if (!entry) return;
  if (form.dataset.expectedEntry !== JSON.stringify(getEntry(entry.id))) throw new DataConflictError();
}
export function checkBean(form, id) {
  if (id && form.dataset.expectedBean !== JSON.stringify(getBeanPreset(id))) throw new DataConflictError();
}
export function settingsStamp() {
  return JSON.stringify(Object.fromEntries(Object.entries(getSettings()).filter(([key]) => !['language', 'lastExportedAt'].includes(key))));
}
export function checkSettings(form) {
  if (form.dataset.expectedSettings !== settingsStamp()) throw new DataConflictError();
}
