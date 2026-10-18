import { exportData, markDataExported, getBackupStatus } from '../store/store.js';
import { el, field, submit, button, anchor, download, announce, save } from './elements.js';

const pendingReads = new WeakMap();

function importDialog(context, preview, form) {
  const dialog = el('dialog', 'plant-dialog');
  dialog.setAttribute('aria-label', context.copy.importTitle);
  dialog.append(el('h2', '', context.copy.importTitle), el('p', '', context.copy.importCount.replace('{count}', preview.count)));
  const recovery = URL.createObjectURL(new Blob([context.service.exportMigration()], { type: 'application/json' }));
  const link = anchor(context.copy.recovery, recovery, 'btn btn-outline');
  link.download = 'stillgreen-recovery.json';
  const apply = button(context.copy.replace, () => {
    if (!save(context, form, () => context.service.applyImport(preview))) return;
    dialog.close();
    context.render();
    announce(context, context.copy.saved);
  }, 'btn btn-danger');
  apply.disabled = true;
  link.onclick = () => { apply.disabled = false; };
  dialog.append(link, button(context.copy.cancel, () => dialog.close()), apply);
  dialog.onclose = () => {
    URL.revokeObjectURL(recovery);
    form.dataset.unsaved = 'false';
    dialog.remove();
  };
  context.host.append(dialog);
  dialog.showModal();
}

async function previewFile(context, form) {
  const request = {};
  pendingReads.set(form, request);
  form.querySelector('[data-plant-import-error]')?.remove();
  const file = form.elements.namedItem('backup').files[0];
  if (!file) return;
  try {
    const text = await file.text();
    if (!form.isConnected || pendingReads.get(form) !== request) return;
    const preview = context.service.previewImport(text);
    importDialog(context, preview, form);
  } catch {
    if (!form.isConnected || pendingReads.get(form) !== request) return;
    const error = el('p', 'storage-error', context.copy.importError);
    error.dataset.plantImportError = '';
    error.setAttribute('role', 'alert');
    form.append(error);
    error.scrollIntoView({ block: 'nearest' });
  }
}

export function backups(context) {
  const section = el('section', 'settings-section');
  section.append(el('h2', 'settings-section-label', context.copy.data));
  const status = getBackupStatus();
  section.append(el('p', 'backup-status', `${context.copy.backupStatus}: ${status.changesSinceExport}`));
  section.append(button(context.copy.exportLegacy, () => {
    if (save(context, null, () => { download(exportData(), 'plantas.json'); markDataExported(); })) context.render();
  }));
  section.append(button(context.copy.exportMigration, () => {
    if (save(context, null, () => { download(context.service.exportMigration(), 'stillgreen-migration.json'); markDataExported(); })) context.render();
  }));
  const form = el('form', 'plant-import-form');
  form.id = 'plant-import-form';
  const file = field('backup', context.copy.file, '', 'file');
  file.querySelector('input').accept = '.json,application/json';
  file.querySelector('input').required = true;
  file.querySelector('input').onchange = () => { void previewFile(context, form); };
  form.append(file, submit(context.copy.preview));
  form.onsubmit = event => { event.preventDefault(); void previewFile(context, form); };
  section.append(form);
  return section;
}
