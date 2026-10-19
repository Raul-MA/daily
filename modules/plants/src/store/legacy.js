import { KEY, PENDING_KEY, BACKUP_KEYS, CORRUPT_KEY } from './constants.js';
import { validatePlants } from './validation.js';
import { parseDocument, makeDocument } from './envelope.js';
import { recordMutation } from './metadata.js';

export function recoverDocument(primaryRaw) {
  const candidates = [localStorage.getItem(PENDING_KEY), ...BACKUP_KEYS.map(key => localStorage.getItem(key))];
  for (const raw of candidates) {
    if (!raw) continue;
    try {
      const { document } = parseDocument(raw);
      if (primaryRaw) localStorage.setItem(CORRUPT_KEY, primaryRaw);
      localStorage.setItem(KEY, JSON.stringify(document));
      localStorage.removeItem(PENDING_KEY);
      return document;
    } catch {
      continue;
    }
  }
  return null;
}

export function getPlants() {
  const raw = localStorage.getItem(KEY);
  if (!raw) {
    const recovered = recoverDocument(null);
    return recovered?.plants ?? [];
  }

  let parsed;
  try {
    parsed = parseDocument(raw);
  } catch (error) {
    const recovered = recoverDocument(raw);
    if (recovered) return recovered.plants;
    throw new Error(`No se pudieron recuperar los datos locales: ${error.message}`);
  }

  const { document, legacy } = parsed;
  if (legacy) {
    try {
      localStorage.setItem(KEY, JSON.stringify(document));
    } catch {
      return document.plants;
    }
  }
  return document.plants;
}

function readCurrent(replaceCorrupt) {
  const raw = localStorage.getItem(KEY);
  if (!raw) return { raw: null, document: null };
  try {
    return { raw, document: parseDocument(raw).document };
  } catch {
    localStorage.setItem(CORRUPT_KEY, raw);
    if (!replaceCorrupt) throw new Error('Los datos actuales están dañados; no se sobrescribieron');
    return { raw: null, document: null };
  }
}

function writePlants(plants, replaceCorrupt) {
  const current = readCurrent(replaceCorrupt);
  const next = makeDocument(plants, (current.document?.revision ?? 0) + 1);
  const serialized = JSON.stringify(next);
  localStorage.setItem(PENDING_KEY, serialized);
  parseDocument(localStorage.getItem(PENDING_KEY));
  const previousBackup = localStorage.getItem(BACKUP_KEYS[0]);
  if (previousBackup) localStorage.setItem(BACKUP_KEYS[1], previousBackup);
  if (current.raw) localStorage.setItem(BACKUP_KEYS[0], current.raw);
  localStorage.setItem(KEY, serialized);
  parseDocument(localStorage.getItem(KEY));
  localStorage.removeItem(PENDING_KEY);
  recordMutation();
}

function notifyError(error) {
  if (typeof window !== 'undefined' && typeof CustomEvent !== 'undefined') {
    window.dispatchEvent(new CustomEvent('stillgreen:storage-error', { detail: error.message || 'No se pudo guardar en este dispositivo' }));
  }
}

export function savePlants(plants, { replaceCorrupt = false } = {}) {
  try {
    validatePlants(plants);
    writePlants(plants, replaceCorrupt);
  } catch (error) {
    notifyError(error);
    throw error;
  }
}
