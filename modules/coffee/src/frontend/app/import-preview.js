import { tr } from './copy.js';
import { coffee } from './context.js';
import { render, renderTabs } from './navigation.js';
import { applyLanguage, showToast, showToastKey, attempt } from './notifications.js';

export function downloadJson(text, filename) {
  const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function showImportPreview(preview) {
  const spanish = coffee.host.lang === 'es';
  coffee.host.querySelector('[data-coffee-import-preview]')?.remove();
  const dialog = document.createElement('dialog');
  dialog.dataset.coffeeImportPreview = '';
  const heading = document.createElement('h2');
  heading.textContent = spanish ? 'Vista previa de importación' : 'Import preview';
  const summary = document.createElement('p');
  const mode = tr({ merge: 'optionMergeImport', replace: 'optionReplaceImport' }[preview.mode]);
  summary.textContent = `${mode}: ${preview.counts.beans} ${spanish ? 'cafés' : 'beans'}, ${preview.counts.entries} ${spanish ? 'bebidas' : 'drinks'}`;
  const recovery = button(spanish ? 'Descargar copia de recuperación' : 'Download recovery backup', 'coffeeRecovery');
  const confirm = button(spanish ? 'Confirmar importación' : 'Confirm import', 'coffeeConfirmImport');
  const cancel = button(spanish ? 'Cancelar' : 'Cancel', 'coffeeCancelImport');
  confirm.disabled = true;
  recovery.addEventListener('click', () => attempt(() => {
    downloadJson(coffee.service.exportRecovery(), 'daily-before-coffee-import.json');
    confirm.disabled = false;
  }));
  confirm.addEventListener('click', () => apply(preview, dialog));
  cancel.addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => { dialog.remove(); document.dispatchEvent(new Event('daily:form-state')); });
  dialog.append(heading, summary, recovery, confirm, cancel);
  dialog.dataset.unsaved = 'true';
  coffee.host.append(dialog);
  dialog.showModal();
  document.dispatchEvent(new Event('daily:form-state'));
}
function button(text, key) {
  const node = document.createElement('button');
  node.type = 'button';
  node.textContent = text;
  node.dataset[key] = '';
  return node;
}
function apply(preview, dialog) {
  try {
    coffee.service.applyImport(preview);
    dialog.close();
    applyLanguage();
    renderTabs();
    render();
    showToastKey('toastImportComplete');
  } catch (error) { showToast(error.message); }
}
