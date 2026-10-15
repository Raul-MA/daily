import { createActivities } from '../../../../packages/platform/src/activities.js';
import { updateAllowed } from '../../../../packages/platform/src/update-gate.js';
import { element } from './elements.js';
function blocked(context) {
    try {
        return !updateAllowed({ dirty: Boolean(document.querySelector('[data-unsaved="true"]')), activities: createActivities(context.state).list() });
    }
    catch {
        return true;
    }
}
function copy(context) {
    const en = { install: 'Install Daily', help: 'On iPhone: Share → Add to Home Screen.', update: 'Update available', apply: 'Apply update', held: 'Finish activities and save forms in all open Daily tabs before updating.', error: 'Offline setup failed. Retry after reconnecting.' };
    const es = { install: 'Instalar Daily', help: 'En iPhone: Compartir → Añadir a pantalla de inicio.', update: 'Actualización disponible', apply: 'Actualizar', held: 'Termina las actividades y guarda los formularios en todas las pestañas de Daily antes de actualizar.', error: 'No se pudo preparar el modo sin conexión. Reintenta al conectarte.' };
    try {
        return context.state.read().value.preferences.language === 'es' ? es : en;
    }
    catch {
        return en;
    }
}
function draw(context) {
    const text = copy(context);
    context.host.replaceChildren();
    if (context.error)
        context.host.append(element('p', '', text.error));
    if (context.registration?.waiting) {
        const button = element('button', 'pwa-button', text.apply);
        button.disabled = blocked(context);
        button.onclick = () => {
            if (blocked(context)) {
                draw(context);
                return;
            }
            context.registration?.waiting?.postMessage({ type: 'ACTIVATE_DAILY_UPDATE' });
        };
        context.host.append(element('p', '', text.update), button);
        if (button.disabled || context.held)
            context.host.append(element('p', '', text.held));
    }
    if (matchMedia('(display-mode: standalone)').matches)
        return;
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
function watchRegistration(context, registration) {
    context.registration = registration;
    let watched;
    const drawUpdate = () => draw(context);
    const found = () => {
        watched?.removeEventListener('statechange', drawUpdate);
        watched = registration.installing;
        watched?.addEventListener('statechange', drawUpdate);
    };
    registration.addEventListener('updatefound', found);
    found();
    draw(context);
    return () => {
        registration.removeEventListener('updatefound', found);
        watched?.removeEventListener('statechange', drawUpdate);
    };
}

function updateReply(event, context) {
    if (event.data?.type === 'DAILY_UPDATE_CHECK' && event.source) {
        event.source.postMessage({ type: 'DAILY_UPDATE_STATE', id: event.data.id, blocked: blocked(context) });
    }
    if (event.data?.type === 'DAILY_UPDATE_RESULT') {
        context.held = event.data.allowed !== true;
        draw(context);
    }
}

export function mountPwa(state, base) {
    if (!('serviceWorker' in navigator))
        return () => undefined;
    const host = element('aside', 'daily-system');
    const context = { state, host, error: false };
    document.body.append(host);
    let active = true;
    let stopRegistration = () => undefined;
    const stopState = state.subscribe(() => draw(context));
    const formState = () => draw(context);
    document.addEventListener('daily:form-state', formState);
    const message = event => updateReply(event, context);
    navigator.serviceWorker.addEventListener('message', message);
    const install = (event) => { event.preventDefault(); context.prompt = event; draw(context); };
    let controlled = Boolean(navigator.serviceWorker.controller);
    const changed = () => {
        if (controlled)
            location.reload();
        controlled = Boolean(navigator.serviceWorker.controller);
    };
    const input = (event) => {
        if (event.target instanceof Element) {
            const form = event.target.closest('form');
            if (form)
                form.dataset.unsaved = 'true';
        }
        draw(context);
    };
    navigator.serviceWorker.addEventListener('controllerchange', changed);
    window.addEventListener('beforeinstallprompt', install);
    document.addEventListener('input', input);
    void navigator.serviceWorker.register(`${base}sw.js`, { scope: base }).then(registration => {
        if (active)
            stopRegistration = watchRegistration(context, registration);
    }).catch(() => { if (active) {
        context.error = true;
        draw(context);
    } });
    return () => {
        active = false;
        navigator.serviceWorker.removeEventListener('message', message);
        document.removeEventListener('daily:form-state', formState);
        stopState();
        stopRegistration();
        host.remove();
        window.removeEventListener('beforeinstallprompt', install);
        document.removeEventListener('input', input);
        navigator.serviceWorker.removeEventListener('controllerchange', changed);
    };
}
