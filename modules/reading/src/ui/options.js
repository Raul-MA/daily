import { readerText, readerError } from './i18n.js';
import { createConfig } from '../config.js';
import { field, syncMain, syncSettings } from './fields.js';
import { status } from './cards.js';

export function launchConfig(service, route) {
  const url = new URL(window.location.href);
  for (const [key, value] of route.query) url.searchParams.set(key, value);
  const api = createConfig(url);
  return { config: api.readConfigFromUrl(service.read().settings), run: api.shouldAutoRunFromUrl() };
}
export function summary(context) {
  const language = context.language;
  const time = context.config.minutes > 0 ? readerText(language, 'window', { minutes: context.config.minutes }) : readerText(language, 'any');
  const count = context.config.count === 1 ? readerText(language, 'oneItem') : readerText(language, 'options', { count: context.config.count });
  const names = context.config.locations.map(location => readerText(language, ({ new: 'inbox', later: 'later', shortlist: 'shortlist' })[location]));
  const locations = new Intl.ListFormat(language, { type: 'conjunction' }).format(names);
  field(context, 'summary').textContent = readerText(language, context.config.policy === 'uniform' ? 'uniformSummary' : 'summary', { count, time, locations });
}
export function mainChange(context, event) {
  const ids = { countInput: 'count', customCount: 'count', minutesInput: 'minutes', customMinutes: 'minutes' };
  const key = ids[event.target.id];
  if (!key) return;
  const selector = field(context, `${key}Input`);
  const custom = key === 'count' ? 'customCount' : 'customMinutes';
  field(context, `${custom}Label`).hidden = selector.value !== 'custom';
  const input = selector.value === 'custom' ? field(context, custom) : selector;
  if (!input.reportValidity()) return;
  const value = Number(input.value);
  const data = context.service.read();
  const form = field(context, 'reader-controls');
  if (form.dataset.expected !== JSON.stringify(data.settings)) throw new Error('Data changed in another view. Your draft has been kept.');
  context.service.save({ ...data, settings: { ...data.settings, [key]: value } });
  form.dataset.expected = JSON.stringify(context.service.read().settings);
  form.dataset.unsaved = 'false';
  document.dispatchEvent(new Event('daily:form-state'));
  context.config[key] = value;
  summary(context);
}
export function updateUrl(context) {
  const config = context.config;
  const query = { count: config.count, minutes: config.minutes, progress: config.progress, locations: config.locations.join(','), scan: config.scanLimit, run: 1 };
  if (config.count === 1 && config.open) query.open = 'auto';
  const params = new URLSearchParams(query);
  history.replaceState(null, '', `${context.base}#/reading/picker?${params}`);
}
export function openSettings(context) {
  if (field(context, 'settingsForm').dataset.unsaved !== 'true') {
    syncSettings(context);
    field(context, 'tokenInput').value = context.service.token();
    field(context, 'rememberToken').checked = context.service.credentialMode() !== 'memory';
  }
  field(context, 'settingsDialog').showModal();
  context.ui.dialogOpen = true;
}
export function moveLocation(context, button) {
  const row = button.closest('[data-location]');
  const sibling = button.dataset.locationUp ? row.previousElementSibling : row.nextElementSibling;
  if (!sibling?.matches('[data-location]')) return;
  const container = row.parentElement;
  if (button.dataset.locationUp) container.insertBefore(row, sibling);
  else container.insertBefore(sibling, row);
  const form = row.closest('form');
  form.dataset.order = JSON.stringify(Array.from(container.querySelectorAll('[data-location]'), node => node.dataset.location));
  row.querySelector('input').dispatchEvent(new Event('input', { bubbles: true }));
}
export function restoreControls(context) { syncMain(context); summary(context); }
export function failed(context, error) { status(context, readerError(context.language, error), 'error', field(context, 'settingsDialog')?.open); }
