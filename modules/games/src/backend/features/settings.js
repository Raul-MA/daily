import { saveSettings } from "../core/storage.js";

export function updateSettings(data, patch) {
  return saveSettings({
    ...data,
    settings: {
      ...data.settings,
      ...patch
    }
  }, patch);
}

export function isExportStale(settings, now = new Date()) {
  if (!settings.lastExportedAt) return true;
  const last = new Date(settings.lastExportedAt);
  if (Number.isNaN(last.getTime())) return true;
  const ageMs = now.getTime() - last.getTime();
  return ageMs >= settings.backupReminderDays * 24 * 60 * 60 * 1000;
}
