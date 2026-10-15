import type { DailyState } from '../../../../packages/data/src/daily-state.ts';
import { createActivities } from '../../../../packages/platform/src/activities.ts';
import { updateAllowed } from '../../../../packages/platform/src/update-gate.ts';
import { element } from './elements.ts';

type InstallPrompt = Event & { prompt: () => Promise<void> };
type PwaContext = { state: DailyState; host: HTMLElement; registration?: ServiceWorkerRegistration; prompt?: InstallPrompt; error: boolean };

function blocked(context: PwaContext) {
  try {
    return !updateAllowed({ dirty: Boolean(document.querySelector('[data-unsaved="true"]')), activities: createActivities(context.state).list() });
  } catch {
    return true;
  }
}

function copy(context: PwaContext) {
  const en = { install: 'Install Daily', help: 'On iPhone: Share → Add to Home Screen.', update: 'Update available', apply: 'Apply update', held: 'Finish activities and save forms before updating.', error: 'Offline setup failed. Retry after reconnecting.' };
  const es = { install: 'Instalar Daily', help: 'En iPhone: Compartir → Añadir a pantalla de inicio.', update: 'Actualización disponible', apply: 'Actualizar', held: 'Termina las actividades y guarda los formularios antes de actualizar.', error: 'No se pudo preparar el modo sin conexión. Reintenta al conectarte.' };
  try { return context.state.read().value.preferences.language === 'es' ? es : en; }
  catch { return en; }
}

function draw(context: PwaContext) {
  const text = copy(context);
  context.host.replaceChildren();
  if (context.error) context.host.append(element('p', '', text.error));
  if (context.registration?.waiting) {
    const button = element('button', 'pwa-button', text.apply);
    button.disabled = blocked(context);
    button.onclick = () => {
      if (blocked(context)) { draw(context); return; }
      context.registration?.waiting?.postMessage({ type: 'ACTIVATE_DAILY_UPDATE' });
    };
    context.host.append(element('p', '', text.update), button);
    if (button.disabled) context.host.append(element('p', '', text.held));
  }
  if (matchMedia('(display-mode: standalone)').matches) return;
  if (!context.prompt) {
    context.host.append(element('p', '', text.help));
    return;
  }
  const install = element('button', 'pwa-button', text.install);
  install.onclick = () => {
    void context.prompt?.prompt().catch(() => { context.error = true; draw(context); });
    context.prompt = undefined;
    draw(context);
  };
  context.host.append(install);
}

function watchRegistration(context: PwaContext, registration: ServiceWorkerRegistration) {
  context.registration = registration;
  const found = () => {
    const worker = registration.installing;
    if (worker) worker.addEventListener('statechange', () => draw(context));
  };
  registration.addEventListener('updatefound', found);
  found();
  draw(context);
  return () => registration.removeEventListener('updatefound', found);
}

export function mountPwa(state: DailyState, base: string) {
  if (!('serviceWorker' in navigator)) return () => undefined;
  const host = element('aside', 'daily-system');
  const context: PwaContext = { state, host, error: false };
  document.body.append(host);
  let active = true;
  let stopRegistration: () => void = () => undefined;
  const stopState = state.subscribe(() => draw(context));
  const install = (event: Event) => { event.preventDefault(); context.prompt = event as InstallPrompt; draw(context); };
  let controlled = Boolean(navigator.serviceWorker.controller);
  const changed = () => {
    if (controlled) location.reload();
    controlled = Boolean(navigator.serviceWorker.controller);
  };
  const input = (event: Event) => {
    if (event.target instanceof Element) {
      const form = event.target.closest('form');
      if (form) form.dataset.unsaved = 'true';
    }
    draw(context);
  };
  navigator.serviceWorker.addEventListener('controllerchange', changed);
  window.addEventListener('beforeinstallprompt', install);
  document.addEventListener('input', input);
  void navigator.serviceWorker.register(`${base}sw.js`, { scope: base }).then(registration => {
    if (active) stopRegistration = watchRegistration(context, registration);
  }).catch(() => { if (active) { context.error = true; draw(context); } });
  return () => {
    active = false;
    stopState();
    stopRegistration();
    host.remove();
    window.removeEventListener('beforeinstallprompt', install);
    document.removeEventListener('input', input);
    navigator.serviceWorker.removeEventListener('controllerchange', changed);
  };
}
