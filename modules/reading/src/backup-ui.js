import { downloadJSON } from '../../../packages/ui/src/download.js';
import { field, syncMain, syncSettings } from './ui/fields.js';
import { readerError } from './ui/i18n.js';

const en = { title: 'Reader backups', export: 'Export Reader backup', file: 'Import Reader backup', recovery: 'Download recovery backup', confirm: 'Confirm Reader import', cancel: 'Cancel import', preview: 'Replace Reader preferences, current picks and remembered item. Other apps are kept. Reenter your token after import.', saved: 'Reader import saved. Reenter your token to refresh.', applied: 'Reader records were restored, but credential cleanup failed.', picks: 'picks', last: 'remembered item' };
const es = { title: 'Copias de Reader', export: 'Exportar copia de Reader', file: 'Importar copia de Reader', recovery: 'Descargar copia de recuperación', confirm: 'Confirmar importación de Reader', cancel: 'Cancelar importación', preview: 'Reemplaza las preferencias, selección y última lectura de Reader. Las demás aplicaciones se conservan. Vuelve a introducir el token después.', saved: 'Importación de Reader guardada. Introduce de nuevo tu token para actualizar.', applied: 'Se restauraron los datos de Reader, pero falló la limpieza de credenciales.', picks: 'lecturas', last: 'última lectura' };

function draw(context, form, copy) {
  const preview = context.ui.readerImportPreview;
  form.querySelector('#reader-import-preview').hidden = !preview;
  form.querySelector('#reader-import-confirm').disabled = !context.ui.readerImportRecovery;
  if (preview) form.querySelector('[data-reader-import-counts]').textContent = `${preview.counts.picks} ${copy.picks} · ${preview.counts.lastItem} ${copy.last}`;
  document.dispatchEvent(new Event('daily:form-state'));
}
function message(form, value) { form.querySelector('#reader-import-status').textContent = value; }
function cancel(context, form, copy) {
  context.ui.readerImportJob++;
  context.ui.readerImportPreview = null;
  context.ui.readerImportRecovery = false;
  form.querySelector('input').value = '';
  form.dataset.unsaved = 'false';
  message(form, '');
  draw(context, form, copy);
}
async function previewFile(context, form, copy) {
  const file = form.querySelector('input').files[0];
  if (!file) return;
  const job = ++context.ui.readerImportJob;
  context.ui.readerImportPreview = null;
  context.ui.readerImportRecovery = false;
  draw(context, form, copy);
  try {
    const text = await file.text();
    if (context.disposed || job !== context.ui.readerImportJob) return;
    context.ui.readerImportPreview = context.service.previewImport(text);
    message(form, copy.preview);
    draw(context, form, copy);
  } catch (error) { message(form, readerError(context.language, error)); }
}
function confirmed(context, form, copy) {
  try {
    context.service.applyImport(context.ui.readerImportPreview);
    cancel(context, form, copy);
    resetControls(context);
    message(form, copy.saved);
  } catch (error) {
    if (error.rootApplied) { resetControls(context); message(form, `${copy.applied} ${readerError(context.language, error)}`); }
    else message(form, readerError(context.language, error));
  }
}
function resetControls(context) {
  const settings = context.service.read().settings;
  context.config = { ...settings, open: settings.autoOpenSingle };
  context.ui.drafts = [];
  context.run = false;
  syncSettings(context);
  syncMain(context);
  field(context, 'tokenInput').value = '';
  field(context, 'rememberToken').checked = false;
  field(context, 'settingsForm').dataset.unsaved = 'false';
  document.dispatchEvent(new Event('daily:form-state'));
}
export function mountReadingBackup(context) {
  const copy = context.language === 'es' ? es : en;
  context.ui.readerImportJob ??= 0;
  const form = document.createElement('form');
  form.id = 'reader-import';
  form.innerHTML = `<h2>${copy.title}</h2><button id="reader-export" type="button" class="secondary-button">${copy.export}</button><label class="field">${copy.file}<input id="reader-import-file" type="file" accept=".json,application/json"></label><div id="reader-import-preview" hidden><p data-reader-import-counts></p><button id="reader-import-recovery" type="button" class="secondary-button">${copy.recovery}</button><button id="reader-import-confirm" type="button" class="primary-button" disabled>${copy.confirm}</button><button id="reader-import-cancel" type="button" class="text-button">${copy.cancel}</button></div><p id="reader-import-status" role="status" class="status" aria-live="polite"></p>`;
  const signal = context.controller.signal;
  form.addEventListener('submit', event => event.preventDefault(), { signal });
  form.querySelector('input').addEventListener('change', () => previewFile(context, form, copy), { signal });
  form.querySelector('#reader-export').addEventListener('click', () => {
    try { downloadJSON(context.service.exportBackup(), 'daily-reader.json'); }
    catch (error) { message(form, readerError(context.language, error)); }
  }, { signal });
  form.querySelector('#reader-import-recovery').addEventListener('click', () => {
    downloadJSON(context.service.exportRecovery(), 'daily-recovery.json');
    context.ui.readerImportRecovery = true;
    draw(context, form, copy);
  }, { signal });
  form.querySelector('#reader-import-confirm').addEventListener('click', () => confirmed(context, form, copy), { signal });
  form.querySelector('#reader-import-cancel').addEventListener('click', () => cancel(context, form, copy), { signal });
  field(context, 'settingsDialog').append(form);
  draw(context, form, copy);
}
