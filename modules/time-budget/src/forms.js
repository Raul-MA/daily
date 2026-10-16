import { captureQueue, restoreQueue, restoreQueueErrors } from './queue-drafts.js';
import { captureDrafts, restoreDrafts } from '../../../packages/ui/src/drafts.js';

export function prepareForms(app) {
  for (const [target, id] of [['setupScreen', 'time-setup'], ['remainingTasksList', 'time-queue'], ['reallocationList', 'time-reallocation']]) {
    const node = app.dom.getElementById(target);
    const form = document.createElement('form');
    form.id = id;
    form.addEventListener('submit', event => event.preventDefault());
    node.replaceWith(form);
    form.append(node);
  }
  stampForms(app);
}
export function stampForms(app) {
  for (const form of app.host.querySelectorAll('form')) form.dataset.expected = JSON.stringify(app.documentData);
}
export function rememberDrafts(app, ui) {
  ui.drafts = captureDrafts(app.host);
  ui.queue = ui.drafts.some(form => form.id === 'time-queue') ? captureQueue(app) : null;
  ui.templatesOpen = app.host.querySelector('details.template-section').open;
  ui.setup = {
    goal: app.dom.getElementById('goalTime').value,
    rows: Array.from(app.host.querySelectorAll('#taskList .task-item'), node => ({ name: node.querySelector('.task-name-input').value, minutes: node.querySelector('.task-duration-input').value })),
  };
}
export function restoreSetup(app, ui) {
  if (!ui.setup || app.state.goalTime) return;
  app.dom.getElementById('goalTime').value = ui.setup.goal;
  app.dom.getElementById('taskList').replaceChildren();
  for (const row of ui.setup.rows) {
    app.addTaskInput(false);
    const node = app.dom.getElementById('taskList').lastElementChild;
    node.querySelector('.task-name-input').value = row.name;
    node.querySelector('.task-duration-input').value = row.minutes;
  }
  app.updateMoveButtons();
}
export function restoreForms(app, ui) {
  restoreQueue(app, ui.queue);
  app.host.querySelector('details.template-section').open = Boolean(ui.templatesOpen);
  restoreDrafts(app.host, ui.drafts ?? []);
  restoreQueueErrors(app, ui.queue);
  if (app.requiredDeficit) app.updateReallocationSummary(app.requiredDeficit);
  app.updateSetupTimeRemaining();
  app.updateRemainingAssignedTime();
  const input = app.host.querySelector('[data-time-file]');
  if (input?.files.length && !app.preview) app.importTemplates(input).catch(error => app.notify(error.message));
}
