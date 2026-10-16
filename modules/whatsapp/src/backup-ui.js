import { downloadJSON } from '../../../packages/ui/src/download.js';
import { saveError } from './i18n.js';
import { initializeComposer } from './controller.js';

function labels(language) {
  if (language === 'es') return { title: 'Copia del borrador', export: 'Exportar borrador de WhatsApp', file: 'Importar borrador de WhatsApp', recovery: 'Descargar copia de recuperación', confirm: 'Confirmar importación', cancel: 'Cancelar importación', preview: 'borradores. Reemplaza el borrador de WhatsApp; las demás aplicaciones se conservan. Una hora pasada debe cambiarse antes de crear el recordatorio.', saved: 'Borrador importado.' };
  return { title: 'Draft backup', export: 'Export WhatsApp draft', file: 'Import WhatsApp draft', recovery: 'Download recovery backup', confirm: 'Confirm import', cancel: 'Cancel import', preview: 'drafts. Replace the WhatsApp draft; other apps are kept. Past reminder times must be changed before creating a reminder.', saved: 'Draft imported.' };
}
function get(form, suffix) { return form.querySelector(`#whatsapp-import-${suffix}`); }
function show(context, form, copy) {
  get(form, 'preview').hidden = !context.ui.importPreview;
  get(form, 'confirm').disabled = !context.ui.importRecovery;
  if (context.ui.importPreview) get(form, 'message').textContent = `${context.ui.importPreview.counts.drafts} ${copy.preview}`;
  context.changed();
}
function cancel(context, form, copy) {
  context.ui.importJob++;
  context.ui.importPreview = null;
  context.ui.importRecovery = false;
  get(form, 'file').value = '';
  form.dataset.unsaved = 'false';
  show(context, form, copy);
}
async function select(context, form, copy) {
  const file = get(form, 'file').files[0];
  if (!file) return;
  const job = ++context.ui.importJob;
  context.ui.importPreview = null;
  context.ui.importRecovery = false;
  show(context, form, copy);
  try {
    const input = await file.text();
    if (context.signal.aborted || job !== context.ui.importJob) return;
    context.ui.importPreview = context.service.previewImport(input);
    show(context, form, copy);
  } catch (error) { get(form, 'status').textContent = saveError(context.language, error); }
}
function confirm(context, form, copy) {
  context.service.applyImport(context.ui.importPreview);
  cancel(context, form, copy);
  context.ui.lastThingsUrl = '';
  context.ui.manualURL = '';
  context.ui.expected = undefined;
  initializeComposer(context);
  context.host.querySelector('#composer').dataset.unsaved = 'false';
  get(form, 'status').textContent = copy.saved;
  context.changed();
}
export function mountBackup(context) {
  const copy = labels(context.language);
  context.ui.importJob ??= 0;
  const form = document.createElement('form');
  form.className = 'whatsapp-backup';
  form.id = 'whatsapp-import';
  form.innerHTML = `<h2>${copy.title}</h2><button type="button" id="whatsapp-export">${copy.export}</button><label>${copy.file}<input type="file" id="whatsapp-import-file" accept=".json,application/json"></label><div id="whatsapp-import-preview" hidden><p id="whatsapp-import-message"></p><button type="button" id="whatsapp-import-recovery">${copy.recovery}</button><button type="button" id="whatsapp-import-confirm" disabled>${copy.confirm}</button><button type="button" id="whatsapp-import-cancel">${copy.cancel}</button></div><p id="whatsapp-import-status" role="status"></p>`;
  const guard = operation => () => { try { operation(); } catch (error) { get(form, 'status').textContent = saveError(context.language, error); } };
  const options = { signal: context.signal };
  form.addEventListener('submit', event => event.preventDefault(), options);
  get(form, 'file').addEventListener('change', () => select(context, form, copy), options);
  form.querySelector('#whatsapp-export').addEventListener('click', guard(() => downloadJSON(context.service.exportBackup(), 'daily-whatsapp.json')), options);
  get(form, 'recovery').addEventListener('click', guard(() => { downloadJSON(context.service.exportRecovery(), 'daily-recovery.json'); context.ui.importRecovery = true; show(context, form, copy); }), options);
  get(form, 'confirm').addEventListener('click', guard(() => confirm(context, form, copy)), options);
  get(form, 'cancel').addEventListener('click', () => cancel(context, form, copy), options);
  context.host.querySelector('.whatsapp-composer').append(form);
  show(context, form, copy);
}
