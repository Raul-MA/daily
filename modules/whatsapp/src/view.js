import { markup } from './markup.js';
import { bindComposer, initializeComposer, refreshComposer, field } from './controller.js';
import { mountBackup } from './backup-ui.js';
import { text, translateMarkup, saveError } from './i18n.js';

export function mountWhatsApp(options) {
  const host = document.createElement('section');
  host.dataset.module = 'whatsapp';
  host.innerHTML = `<div class="whatsapp-composer">${markup}</div>`;
  host.querySelector('h1').tabIndex = -1;
  const controller = new AbortController();
  const context = { ...options, host, language: document.documentElement.lang, now: () => Date.now(), signal: controller.signal, clipboard: navigator.clipboard, navigate: url => { window.location.href = url; }, changed: () => document.dispatchEvent(new Event('daily:form-state')) };
  translateMarkup(host, context.language);
  initializeComposer(context);
  context.expected = options.ui.expected ?? context.expected;
  if (options.ui.saveFailure) field(context, 'status').textContent = saveError(context.language, options.ui.saveFailure);
  bindComposer(context);
  mountBackup(context);
  const refresh = () => { if (!document.hidden) refreshComposer(context); };
  document.addEventListener('visibilitychange', refresh, { signal: controller.signal });
  window.addEventListener('pageshow', refresh, { signal: controller.signal });
  const timer = setInterval(refresh, 15000);
  return {
    node: host,
    restore: () => { refreshComposer(context); if (field(context, 'composer').dataset.unsaved === 'true') context.changed(); },
    conflict: () => { options.ui.saveFailure = { message: 'Data changed in another view.' }; field(context, 'status').textContent = text(context.language, 'conflict'); },
    dispose: () => { options.ui.expected = field(context, 'composer').dataset.unsaved === 'true' ? context.expected : undefined; clearInterval(timer); clearTimeout(context.cleanTimer); controller.abort(); },
  };
}
