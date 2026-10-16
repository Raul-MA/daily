import { SCHEMA_VERSION } from './constants.js';
import { isObject, isValidDate, validatePlants } from './validation.js';

export function checksum(text) {
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

export function makeDocument(plants, revision = 1) {
  const payload = JSON.stringify(plants);
  return {
    schemaVersion: SCHEMA_VERSION,
    revision,
    updatedAt: new Date().toISOString(),
    checksum: checksum(payload),
    plants,
  };
}

export function parseDocument(raw) {
  const value = JSON.parse(raw);
  if (Array.isArray(value)) {
    validatePlants(value);
    return { document: makeDocument(value), legacy: true };
  }
  if (!validEnvelope(value)) throw new Error('Formato de almacenamiento desconocido');
  validatePlants(value.plants);
  if (checksum(JSON.stringify(value.plants)) !== value.checksum) {
    throw new Error('La verificación del almacenamiento no coincide');
  }
  return { document: value, legacy: false };
}

function validEnvelope(value) {
  if (!isObject(value) || value.schemaVersion !== SCHEMA_VERSION) return false;
  return Number.isInteger(value.revision) && value.revision >= 1 && isValidDate(value.updatedAt) && typeof value.checksum === 'string';
}
