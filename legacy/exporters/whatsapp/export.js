import { validWhatsApp } from './validation.js';

export function exportLegacyWhatsApp(storage) {
  const raw = storage.getItem('whatsapp-later-draft');
  const value = raw === null ? null : JSON.parse(raw);
  const draft = value === null ? null : Object.fromEntries(['recipient', 'date', 'time', 'message'].map(key => [key, value[key]]));
  if (!validWhatsApp({ draft })) throw new Error('Invalid original WhatsApp draft. Nothing was changed.');
  return JSON.stringify({ app: 'whatsapp-later', schemaVersion: 1, draft }, null, 2);
}
