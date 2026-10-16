import { href } from '../../../../packages/platform/src/router.js';
import { backupCopy } from './copy.js';
import { bindBackup } from './actions.js';

function legacyLinks(context, host) {
  const copy = context.copy;
  const title = document.createElement('h3');
  title.textContent = copy.legacy;
  const help = document.createElement('p');
  help.textContent = copy.legacyHelp;
  const links = document.createElement('nav');
  links.setAttribute('aria-label', copy.legacy);
  for (const [name, page] of [['plants', 'plantSettings'], ['coffee', 'coffeeSettings'], ['games', 'gamesSettings'], ['time', 'time'], ['reader', 'reader'], ['whatsapp', 'whatsapp']]) {
    const link = document.createElement('a');
    link.href = href({ page }, context.base);
    link.textContent = copy[name];
    links.append(link);
  }
  host.append(title, help, links);
}
function draw(context) {
  const { form, ui, copy } = context;
  form.querySelector('#daily-backup-preview').hidden = !ui.preview;
  form.querySelector('#daily-backup-cancel').hidden = !ui.hasFile;
  form.querySelector('#daily-backup-confirm').disabled = !ui.preview || !ui.recovery;
  form.dataset.unsaved = String(Boolean(ui.hasFile));
  const list = form.querySelector('[data-daily-backup-counts]');
  list.replaceChildren();
  for (const [key, count] of Object.entries(ui.preview?.counts ?? {})) {
    const item = document.createElement('li');
    item.textContent = `${copy.counts[key]}: ${count}`;
    list.append(item);
  }
  form.querySelector('#daily-backup-status').textContent = copy[ui.message] ?? '';
  document.dispatchEvent(new Event('daily:form-state'));
}
export function mountDailyBackup(options) {
  const host = document.createElement('section');
  host.className = 'settings-panel daily-backup';
  const form = document.createElement('form');
  form.id = 'daily-backup-form';
  const copy = backupCopy(document.documentElement.lang);
  form.innerHTML = `<h2>${copy.title}</h2><button id="daily-backup-export" type="button">${copy.export}</button><label>${copy.file}<input id="daily-backup-file" type="file" accept=".json,application/json"></label><div id="daily-backup-preview" hidden><p>${copy.preview}</p><p>${copy.clocks}</p><ul data-daily-backup-counts></ul><button id="daily-backup-confirm" type="button" disabled>${copy.confirm}</button></div><button id="daily-backup-recovery" type="button">${copy.recovery}</button><button id="daily-backup-cancel" type="button" hidden>${copy.cancel}</button><p id="daily-backup-status" role="status" aria-live="polite"></p>`;
  const controller = new AbortController();
  options.ui.job ??= 0;
  const context = { ...options, form, copy, signal: controller.signal };
  context.draw = () => draw(context);
  bindBackup(context);
  host.append(form);
  legacyLinks(context, host);
  draw(context);
  return { node: host, dispose: () => controller.abort() };
}
