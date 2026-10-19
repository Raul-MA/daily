import { validWhatsApp } from './validation.js';
import { DataConflictError } from '../../../packages/data/src/errors.js';

function parse(text) {
  const input = JSON.parse(text);
  if (!['daily-whatsapp', 'whatsapp-later'].includes(input?.app)) throw new Error('Unsupported WhatsApp backup format.');
  if (input.schemaVersion !== 1) throw new Error('Unsupported WhatsApp schema version.');
  const data = input.app === 'daily-whatsapp' ? input.data : { draft: input.draft };
  if (!validWhatsApp(data)) throw new Error('Invalid WhatsApp backup.');
  return data;
}
export function whatsappImports(state, service) {
  const previews = new WeakMap();
  function previewImport(text) {
    const data = parse(text);
    const preview = { data, counts: { drafts: data.draft ? 1 : 0 } };
    previews.set(preview, { root: JSON.stringify(state.read().value), preview: JSON.stringify(preview) });
    return preview;
  }
  function applyImport(preview) {
    const expected = previews.get(preview);
    if (!expected) throw new Error('Unknown WhatsApp import preview.');
    if (expected.root !== JSON.stringify(state.read().value)) throw new DataConflictError();
    if (expected.preview !== JSON.stringify(preview)) throw new Error('Changed WhatsApp import preview.');
    service.saveDraft(preview.data.draft, service.read());
    previews.delete(preview);
  }
  return { previewImport, applyImport, exportBackup: () => JSON.stringify({ app: 'daily-whatsapp', schemaVersion: 1, data: service.read() }, null, 2), exportRecovery: () => JSON.stringify(state.read().value, null, 2) };
}
