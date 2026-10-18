import { mountSections } from './sections.js';
import { restoreNotice } from './notices.js';
import { mountCountdowns } from './countdown-ui.js';
import { createTimeApp } from './app.js';
import { template } from './template.js';
import { initialize, stopPresentation, ensureFresh, failure } from './lifecycle.js';
import { bindEvents } from './events.js';
import { prepareForms, rememberDrafts, restoreSetup, restoreForms } from './forms.js';
import { mountBackupUI, exportTemplates, importTemplates } from './backup-ui.js';

function scopedDocument(host) {
  return {
    getElementById: id => host.querySelector(`#${CSS.escape(id)}`), querySelector: value => host.querySelector(value),
    querySelectorAll: value => host.querySelectorAll(value), createElement: value => document.createElement(value),
    addEventListener: (...args) => host.addEventListener(...args),
  };
}
export function mountTimeBudget(options) {
  const host = document.createElement('section');
  host.dataset.module = 'time-budget';
  const language = options.service.language();
  host.lang = language;
  host.innerHTML = template(language);
  const app = createTimeApp({ host, language, ui: options.ui, dom: scopedDocument(host), service: options.service, ensureFresh, failure, exportTemplates, importTemplates });
  app.keyboardAction = action => {
    try { app.ensureFresh(); action(); }
    catch (error) { app.failure(error); }
  };
  app.cancelNewTask = node => node.closest('.add-task-form').remove();
  app.reload = () => {
    stopPresentation(app);
    app.importRequest = null;
    for (const input of host.querySelectorAll('input[type="file"]')) input.value = '';
    app.state.goalTime = null;
    app.documentData = app.service.read();
    app.state = createTimeApp().state;
    app.dom.getElementById('taskList').replaceChildren();
    app.dom.getElementById('setupScreen').classList.toggle('hidden', Boolean(app.documentData.session));
    app.dom.getElementById('timerScreen').classList.toggle('hidden', !app.documentData.session);
    initialize(app);
    restoreNotice(app);
    host.querySelector('[data-time-import-preview]').hidden = true;
    for (const form of host.querySelectorAll('form')) delete form.dataset.unsaved;
    document.dispatchEvent(new Event('daily:form-state'));
  };
  prepareForms(app);
  initialize(app);
  app.setupGoalTimeListener();
  app.setupKeyboardShortcuts();
  restoreSetup(app, options.ui);
  mountBackupUI(app);
  const stopCountdowns = mountCountdowns(app);
  mountSections(app, options.ui);
  const unbind = bindEvents(app);
  restoreNotice(app);
  host.querySelector('h1').tabIndex = -1;
  return {
    node: host,
    dispose: () => { app.disposed = true; rememberDrafts(app, options.ui); stopPresentation(app); stopCountdowns(); unbind(); },
    restore: () => restoreForms(app, options.ui),
    conflict: () => app.notify('Data changed in another view. Keep your draft and reopen Time Budget.'),
  };
}
