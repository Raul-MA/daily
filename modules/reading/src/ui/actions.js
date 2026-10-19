import { readerText } from './i18n.js';
import { field, readSettings, syncSettings } from './fields.js';
import { renderPicks, status } from './cards.js';
import { updateUrl, restoreControls } from './options.js';

export async function pick(context, refresh = false) {
  if (!context.service.token()) { field(context, 'settingsDialog').showModal(); status(context, readerText(context.language, 'missingToken'), 'error'); return; }
  field(context, 'pickButton').disabled = true;
  field(context, 'againButton').disabled = true;
  status(context, readerText(context.language, 'loading'));
  try {
    if (context.service.read().settings.updateUrlOnPick) updateUrl(context);
    const result = await context.service.pick({ ...context.config, refresh: refresh || Boolean(context.config.refresh) });
    if (context.disposed) return;
    renderPicks(context);
    status(context, pickMessage(context, result.documents.length));
    openSingle(context, result);
  } finally {
    field(context, 'pickButton').disabled = false;
    field(context, 'againButton').disabled = false;
  }
}
function pickMessage(context, count) {
  if (!count) return readerText(context.language, 'empty');
  return readerText(context.language, count < context.config.count ? 'fewer' : 'found', { count, requested: context.config.count });
}
function openSingle(context, result) {
  if (context.config.count !== 1 || !context.config.open || !result.documents.length) return;
  context.service.remember(result.documents[0]);
  window.location.assign(result.documents[0].url);
}
export function submit(context, event) {
  event.preventDefault();
  const launch = context.run ? { ...context.config } : null;
  const settings = readSettings(context);
  const data = context.service.read();
  context.service.save({ ...data, settings, lastItem: settings.rememberLastItem ? data.lastItem : null });
  const token = field(context, 'tokenInput').value.trim();
  let mode = 'memory';
  if (field(context, 'rememberToken').checked) mode = context.installed ? 'persistent' : 'session';
  context.service.setToken(token, mode);
  field(context, 'tokenInput').value = '';
  context.config = launch ?? { ...settings, open: settings.autoOpenSingle };
  syncSettings(context);
  restoreControls(context);
  field(context, 'settingsForm').dataset.unsaved = 'false';
  document.dispatchEvent(new Event('daily:form-state'));
  field(context, 'settingsDialog').close();
  context.ui.dialogOpen = false;
  status(context, readerText(context.language, 'saved'), 'success');
  if (context.run && token) { context.run = false; context.ui.ran = true; return pick(context); }
}
export async function testToken(context) {
  const token = field(context, 'tokenInput').value.trim();
  if (!token) { status(context, readerText(context.language, 'paste'), 'error', true); return; }
  const response = await fetch('https://readwise.io/api/v2/auth/', {
    headers: { Authorization: `Token ${token}` }, cache: 'no-store', credentials: 'omit', signal: AbortSignal.any([context.controller.signal, AbortSignal.timeout(20000)]), referrerPolicy: 'no-referrer',
  });
  if (context.disposed || field(context, 'tokenInput').value.trim() !== token) return;
  status(context, readerText(context.language, response.ok ? 'validToken' : 'invalidToken', { status: response.status }), response.ok ? 'success' : 'error', true);
}
export function forget(context) {
  context.ui.drafts = [];
  try { context.service.forgetToken(); }
  finally {
    field(context, 'tokenInput').value = '';
    field(context, 'rememberToken').checked = false;
    renderPicks(context);
  }
  status(context, readerText(context.language, 'forgotten'), 'success', true);
}
