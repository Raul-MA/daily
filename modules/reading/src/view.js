import { mountReadingBackup } from './backup-ui.js';
import { translateMarkup, readerText } from './ui/i18n.js';
import { captureDrafts, restoreDrafts } from '../../../packages/ui/src/drafts.js';
import { pickerMarkup } from './ui/markup.js';
import { field, syncMain, syncSettings, restoreOrder, restoreMain } from './ui/fields.js';
import { renderPicks } from './ui/cards.js';
import { launchConfig, mainChange, openSettings, moveLocation, failed, summary } from './ui/options.js';
import { pick, submit, testToken, forget } from './ui/actions.js';
import { initialReading } from './validation.js';

function isInstalled() { return window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true; }
function clear(context) {
  if (!window.confirm('Remove Reader token, cached documents, and saved Reader preferences? Other apps are kept.')) return;
  context.service.save({ ...context.service.read(), ...initialReading() });
  forget(context);
  context.config = { ...context.service.read().settings, open: false };
  syncMain(context);
  syncSettings(context);
}
function bind(context) {
  const guard = operation => event => {
    try { Promise.resolve(operation(event)).catch(error => { if (!context.disposed) failed(context, error); }); }
    catch (error) { failed(context, error); }
  };
  const actions = {
    settingsButton: () => openSettings(context), closeSettings: () => { field(context, 'settingsDialog').close(); context.ui.dialogOpen = false; },
    pickButton: () => pick(context), againButton: () => pick(context), refreshButton: () => pick(context, true),
    testButton: () => testToken(context), forgetTokenButton: () => forget(context), clearDataButton: () => clear(context),
  };
  context.host.addEventListener('click', guard(event => {
    const button = event.target.closest('button');
    if (!button) return;
    if (button.matches('[data-location-up], [data-location-down]')) return moveLocation(context, button);
    if (Object.hasOwn(actions, button.id)) return actions[button.id]();
  }), { signal: context.controller.signal });
  context.host.addEventListener('change', guard(event => mainChange(context, event)), { signal: context.controller.signal });
  field(context, 'reader-controls').addEventListener('submit', event => event.preventDefault(), { signal: context.controller.signal });
  field(context, 'settingsForm').addEventListener('submit', guard(event => submit(context, event)), { signal: context.controller.signal });
}
function validateRemembered(context) {
  if (!context.service.token() || !context.service.read().lastItem) return;
  context.service.revalidateLastItem().catch(error => { if (!context.disposed) failed(context, error); });
}
export function mountReader(options) {
  const host = document.createElement('section');
  host.dataset.module = 'reading';
  host.dataset.readerPage = 'picker';
  host.innerHTML = pickerMarkup;
  field({ host }, 'pageTitle').tabIndex = -1;
  const launch = launchConfig(options.service, options.route);
  const context = { ...options, host, language: document.documentElement.lang, config: launch.config, run: launch.run, installed: isInstalled(), controller: new AbortController(), disposed: false };
  if (context.installed) {
    field(context, 'rememberTokenLabel').textContent = 'Save token on this installed app';
    field(context, 'tokenStorageHelp').textContent = 'Kept in memory unless you choose to save it on this installed app. It is never added to the URL.';
  }
  translateMarkup(host, context.language);
  mountReadingBackup(context);
  bind(context);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) renderPicks(context); }, { signal: context.controller.signal });
  syncMain(context);
  syncSettings(context);
  renderPicks(context);
  summary(context);
  restoreDrafts(host, options.ui.drafts ?? []);
  if (options.ui.dialogOpen || !context.service.token()) queueMicrotask(() => { if (!context.disposed) openSettings(context); });
  queueMicrotask(() => validateRemembered(context));
  const stop = options.service.subscribe(() => { if (!context.disposed) renderPicks(context); });
  if (launch.run && context.service.token() && !options.ui.ran) {
    options.ui.ran = true;
    queueMicrotask(() => pick(context).catch(error => failed(context, error)));
    context.run = false;
  }
  return {
    node: host,
    restore: () => { restoreOrder(field(context, 'settingsForm')); restoreMain(context); },
    conflict: () => failed(context, new Error(readerText(context.language, 'conflict'))),
    dispose: () => { context.disposed = true; options.ui.drafts = captureDrafts(host); options.ui.dialogOpen = field(context, 'settingsDialog').open; context.controller.abort(); stop(); },
  };
}
