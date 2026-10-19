import { readData, writeData } from '../core/storage.js';
import { createId } from '../core/id.js';
import { SCHEMA_VERSION } from '../core/schema.js';

export function completeToolSetup(tools) {
  const data = readData();
  const timestamp = new Date().toISOString();
  const starter = {
    id: createId(), schemaVersion: SCHEMA_VERSION,
    createdAt: timestamp, updatedAt: timestamp,
    brand: 'House', blend: 'First Dial-In', decaf: false, roastOrigin: 'Starter preset',
  };
  writeData({
    ...data,
    settings: { ...data.settings, toolsConfigured: true, tools },
    beanPresets: data.beanPresets.length ? data.beanPresets : [starter],
  });
}
