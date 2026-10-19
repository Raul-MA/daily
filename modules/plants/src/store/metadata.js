import { getPlantBinding } from './binding.js';
import { BACKUP_META_KEY, STORAGE_META_KEY } from './constants.js';
import { isObject, isValidDate } from './validation.js';

export function readJsonMeta(key, fallback) {
  const binding = getPlantBinding();
  if (binding) return binding.readMeta(key);
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return isObject(value) ? value : fallback;
  } catch {
    return fallback;
  }
}

export function recordMutation() {
  try {
    const meta = readJsonMeta(BACKUP_META_KEY, {});
    writeMeta(BACKUP_META_KEY, {
      ...meta,
      changesSinceExport: (Number(meta.changesSinceExport) || 0) + 1,
    });
  } catch {
    return notifySaved();
  }
  notifySaved();
}

function notifySaved() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent?.(new CustomEvent('stillgreen:data-saved'));
  }
}

export function markDataExported() {
  const meta = readJsonMeta(BACKUP_META_KEY, {});
  writeMeta(BACKUP_META_KEY, {
    ...meta,
    lastExportAt: new Date().toISOString(),
    changesSinceExport: 0,
  });
}

export function getBackupStatus() {
  const meta = readJsonMeta(BACKUP_META_KEY, {});
  return {
    lastExportAt: isValidDate(meta.lastExportAt) ? meta.lastExportAt : null,
    changesSinceExport: Number(meta.changesSinceExport) || 0,
  };
}

export function shouldEncourageBackup() {
  const { lastExportAt, changesSinceExport } = getBackupStatus();
  if (changesSinceExport < 10) return false;
  if (!lastExportAt) return true;
  return Date.now() - new Date(lastExportAt).getTime() >= 30 * 86400000;
}

export function shouldShowBackupReminder() {
  if (!shouldEncourageBackup()) return false;
  const meta = readJsonMeta(BACKUP_META_KEY, {});
  return !isValidDate(meta.lastReminderAt) ||
    Date.now() - new Date(meta.lastReminderAt).getTime() >= 7 * 86400000;
}

export function markBackupReminderShown() {
  const meta = readJsonMeta(BACKUP_META_KEY, {});
  writeMeta(BACKUP_META_KEY, {
    ...meta,
    lastReminderAt: new Date().toISOString(),
  });
}

export async function requestPersistentStorage() {
  const meta = readJsonMeta(STORAGE_META_KEY, {});
  if (meta.persistenceRequested) return Boolean(meta.persistent);

  let persistent = false;
  try {
    persistent = Boolean(await navigator.storage?.persist?.());
  } catch {
    persistent = false;
  }
  writeMeta(STORAGE_META_KEY, {
    persistenceRequested: true,
    persistent,
    checkedAt: new Date().toISOString(),
  });
  return persistent;
}

function writeMeta(key, value) {
  const binding = getPlantBinding();
  if (binding) return binding.saveMeta(key, value);
  localStorage.setItem(key, JSON.stringify(value));
}
