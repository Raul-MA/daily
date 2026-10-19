import { readerText, translateMarkup, readerError } from './ui/i18n.js';
import { pickerMarkup } from './ui/markup.js';
import { element, status } from './ui/cards.js';
import { syncSettings, readSettings, restoreOrder, field } from './ui/fields.js';
import { moveLocation } from './ui/options.js';

function input(id, title, value, bounds) {
  const label = element('label', 'field', title);
  const node = document.createElement('input');
  Object.assign(node, { id, name: id, type: 'number', min: bounds[0], max: bounds[1], step: '1', required: true, value });
  label.append(node);
  return label;
}
function formFor(settings) {
  const template = document.createElement('template');
  template.innerHTML = pickerMarkup;
  const form = template.content.querySelector('#settingsForm');
  form.id = 'readerPreferencesForm';
  form.removeAttribute('method');
  for (const selector of ['.dialog-header', '#tokenInput', '#rememberToken', '.dialog-actions', '.privacy-actions']) {
    const node = form.querySelector(selector);
    if (node.matches('input')) node.closest('label').remove();
    else node.remove();
  }
  form.prepend(element('h2', '', 'Reader preferences'), input('reader-default-count', 'Number of items (1–20)', settings.count, [1, 20]), input('reader-default-minutes', 'Maximum remaining minutes (0 = any)', settings.minutes, [0, 10000]));
  const save = element('button', 'primary-button', 'Save Reader preferences');
  save.type = 'submit';
  form.append(save);
  return form;
}
export function mountReaderPreferences(options) {
  const host = document.createElement('section');
  host.dataset.module = 'reading';
  host.className = 'reader-preferences';
  const context = { ...options, host, language: document.documentElement.lang };
  const form = formFor(options.service.read().settings);
  host.append(form);
  translateMarkup(host, context.language);
  syncSettings(context);
  form.addEventListener('submit', event => {
    event.preventDefault();
    try {
      const settings = { ...readSettings(context), count: Number(field(context, 'reader-default-count').value), minutes: Number(field(context, 'reader-default-minutes').value) };
      const data = options.service.read();
      form.dataset.unsaved = 'false';
      options.service.save({ ...data, settings, lastItem: settings.rememberLastItem ? data.lastItem : null });
      form.dataset.unsaved = 'false';
      syncSettings(context);
      status(context, readerText(context.language, 'preferencesSaved'), 'success', true);
    } catch (error) { form.dataset.unsaved = 'true'; status(context, readerError(context.language, error), 'error', true); }
  });
  host.addEventListener('click', event => {
    const button = event.target.closest('[data-location-up], [data-location-down]');
    if (button) moveLocation(context, button);
  });
  return { node: host, dispose() {}, restore: () => restoreOrder(form), conflict: () => status(context, readerText(context.language, 'conflict'), 'error', true) };
}
