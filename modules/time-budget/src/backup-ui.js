export function download(text, name) {
  const blob = new Blob([text], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
export function exportTemplates() {
  if (Object.keys(this.getTemplates()).length === 0) return this.notify('No templates to export yet.');
  download(this.service.exportTemplates(), 'timeBudget-templates.json');
}
export async function importTemplates(input) {
  if (!input.files[0]) return;
  this.preview = this.service.previewImport(await input.files[0].text());
  const node = this.host.querySelector('[data-time-import-preview]');
  node.hidden = false;
  node.querySelector('p').textContent = `${this.preview.counts.templates} templates · ${this.preview.counts.tasks} active tasks · ${this.preview.counts.countdowns} countdowns`;
  node.querySelector('[data-time-confirm]').disabled = true;
  document.dispatchEvent(new Event('daily:form-state'));
}
export function mountBackupUI(app) {
  const panel = document.createElement('section');
  panel.className = 'panel time-backup';
  panel.innerHTML = '<h2>Backups</h2><button type="button" class="button secondary" data-time-migration>Export full Time Budget</button><form id="time-import"><label>Import Time Budget backup<input data-time-file type="file" accept=".json,application/json" data-time-change="app.importTemplates(this)"></label><div data-time-import-preview hidden><p></p><button type="button" class="button secondary" data-time-recovery>Download recovery backup</button><button type="button" class="button primary" data-time-confirm disabled>Confirm import</button><button type="button" class="button ghost" data-time-cancel>Cancel import</button></div></form>';
  panel.querySelector('form').dataset.expected = JSON.stringify(app.documentData);
  app.host.append(panel);
  panel.querySelector('[data-time-migration]').onclick = () => download(app.service.exportMigration(), 'daily-time-budget.json');
  panel.querySelector('[data-time-recovery]').onclick = () => {
    download(app.service.exportRecovery(), 'daily-recovery.json');
    panel.querySelector('[data-time-confirm]').disabled = false;
  };
  panel.querySelector('[data-time-confirm]').onclick = () => {
    try {
      app.service.applyImport(app.preview);
      app.preview = null;
      app.reload();
    } catch (error) { app.failure(error); }
  };
  panel.querySelector('[data-time-cancel]').onclick = () => {
    app.preview = null;
    panel.querySelector('[data-time-import-preview]').hidden = true;
    for (const input of app.host.querySelectorAll('input[type="file"]')) input.value = '';
    delete panel.querySelector('form').dataset.unsaved;
    document.dispatchEvent(new Event('daily:form-state'));
  };
}
