import { initialState } from './initial-state.js';
import { stampForms } from './forms.js';

export function stopPresentation(app) {
  for (const key of ['intervalId', 'clockIntervalId', 'autosaveIntervalId']) clearInterval(app.state[key]);
  clearInterval(app.setupRemainingIntervalId);
  clearTimeout(app.toastTimeoutId);
  app.cancelScheduledNotification();
}
export function ensureFresh() {
  const expected = JSON.stringify(this.documentData);
  const actual = JSON.stringify(this.service.read());
  if (expected !== actual) throw new Error('Data changed in another view. Keep your draft and reopen Time Budget.');
  for (const form of this.host.querySelectorAll('form[data-unsaved="true"]')) {
    if (form.dataset.expected !== actual) throw new Error('Data changed in another view. Keep your draft and reopen Time Budget.');
  }
}
export function failure(error) {
  stopPresentation(this);
  try { this.documentData = this.service.read(); }
  catch { this.notify(error.message); return; }
  this.state = { ...initialState(), ...structuredClone(this.documentData.session ?? {}) };
  if (this.state.goalTime) {
    this.syncTimerControls();
    this.updateCurrentTask();
    this.startClock();
    if (this.state.timerRunning) this.state.intervalId = setInterval(() => this.updateTaskTimer(), 1000);
  }
  this.notify(error.message);
  this.host.querySelector('#toast').setAttribute('role', 'alert');
}
export function initialize(app) {
  app.documentData = app.service.read();
  app.loadState();
  if (!app.state.goalTime) { app.addTaskInput(false); app.addTaskInput(false); }
  app.loadTemplateList();
  stampForms(app);
}
