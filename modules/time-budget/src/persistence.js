import { stampForms } from './forms.js';
export function saveState() {
  const { goalTime, startTime, tasks, currentTaskIndex, timerElapsed, timerRunning, timerStartTime } = this.state;
  this.sessionId ??= crypto.randomUUID();
  const session = { id: this.sessionId, goalTime, startTime, tasks, currentTaskIndex, timerElapsed, timerRunning, timerStartTime };
  this.documentData = this.service.save({ ...this.documentData, session });
  stampForms(this);
}
export function clearSession() {
  this.documentData = this.service.save({ ...this.documentData, session: null });
  this.sessionId = null;
  stampForms(this);
}
export function getTemplates() { return structuredClone(this.documentData.templates); }
export function saveTemplates(templates) { this.documentData = this.service.save({ ...this.documentData, templates }); stampForms(this); }
export function loadState() {
  const saved = this.documentData.session;
  if (!saved) return;
  this.sessionId = saved.id;
  Object.assign(this.state, structuredClone(saved));
  this.showTimerScreen();
  if (saved.timerRunning) {
    this.state.intervalId = setInterval(() => this.updateTaskTimer(), 1000);
    const elapsed = Math.max(0, Date.now() - saved.timerStartTime);
    this.state.timerElapsed = elapsed;
    this.scheduleTaskNotification();
  }
  const current = saved.tasks[saved.currentTaskIndex];
  if (current.status === 'completed') this.showReallocationModal(current.actualMinutes - current.allocatedMinutes);
}
