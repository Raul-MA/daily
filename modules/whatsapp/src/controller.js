import { buildThingsUrl, localFields, defaultDraft, draftError } from './app.js';
import { text, validationText, saveError } from './i18n.js';

export function field(context, id) { return context.host.querySelector(`#${id}`); }
function readDraft(context) { return Object.fromEntries(['recipient', 'date', 'time', 'message'].map(name => [name, field(context, name).value])); }
function status(context, value) { field(context, 'status').textContent = value; }
function changed(context, dirty = false) {
  field(context, 'composer').dataset.unsaved = String(dirty);
  context.changed();
}
export function resetComposer(context, draft = defaultDraft(context.now())) {
  field(context, 'composer').reset();
  for (const [key, value] of Object.entries(draft)) field(context, key).value = value;
  field(context, 'manual-copy').hidden = !context.ui.manualURL;
  field(context, 'link').value = context.ui.manualURL ?? '';
}
export function refreshComposer(context) {
  const draft = readDraft(context);
  const error = draftError(draft, new Date(context.now()));
  const earliest = localFields(new Date(Math.ceil((context.now() + 1) / 60000) * 60000));
  field(context, 'date').min = localFields(new Date(context.now())).date;
  field(context, 'time').min = draft.date === earliest.date ? earliest.time : '';
  field(context, 'create').disabled = Boolean(error);
  field(context, 'copy').disabled = Boolean(error) && !context.ui.lastThingsUrl;
  field(context, 'validation').textContent = error && draft.recipient.trim() && draft.message.trim() ? validationText(context.language, error) : '';
  return !error;
}
export function initializeComposer(context) {
  context.expected = context.service.read();
  resetComposer(context, context.expected.draft ?? defaultDraft(context.now()));
  refreshComposer(context);
}
function input(context) {
  clearTimeout(context.cleanTimer);
  context.saveTurn = (context.saveTurn ?? 0) + 1;
  const turn = context.saveTurn;
  context.ui.saveFailure = null;
  context.ui.lastThingsUrl = '';
  context.ui.manualURL = '';
  field(context, 'manual-copy').hidden = true;
  status(context, '');
  refreshComposer(context);
  try {
    context.expected = context.service.saveDraft(readDraft(context), context.expected);
    context.cleanTimer = setTimeout(() => { if (!context.signal?.aborted && context.saveTurn === turn) changed(context); }, 0);
  } catch (error) { changed(context, true); failure(context, error); }
}
function failure(context, error) {
  context.ui.saveFailure = { name: error.name, message: error.message };
  status(context, saveError(context.language, error));
}
function submit(context, event) {
  event.preventDefault();
  if (!refreshComposer(context) || !field(context, 'composer').reportValidity()) return;
  try {
    const draft = readDraft(context);
    const url = buildThingsUrl(draft.recipient, draft.date, draft.time, draft.message);
    context.expected = context.service.clearDraft(context.expected);
    context.ui.saveFailure = null;
    context.ui.lastThingsUrl = url;
    context.ui.manualURL = '';
    resetComposer(context);
    refreshComposer(context);
    changed(context);
    status(context, text(context.language, 'opening'));
    context.navigate(url);
  } catch (error) { failure(context, error); }
}
async function copy(context) {
  if (!refreshComposer(context) && !context.ui.lastThingsUrl) return;
  const draft = readDraft(context);
  const url = context.ui.lastThingsUrl || buildThingsUrl(draft.recipient, draft.date, draft.time, draft.message);
  try { await context.clipboard.writeText(url); status(context, text(context.language, 'copied')); }
  catch {
    context.ui.manualURL = url;
    field(context, 'manual-copy').hidden = false;
    const link = field(context, 'link');
    link.value = url;
    link.focus();
    link.select();
    status(context, text(context.language, 'manual'));
  }
}
export function bindComposer(context) {
  const options = context.signal ? { signal: context.signal } : {};
  field(context, 'composer').addEventListener('input', () => input(context), options);
  field(context, 'composer').addEventListener('submit', event => submit(context, event), options);
  field(context, 'copy').addEventListener('click', () => copy(context), options);
}
