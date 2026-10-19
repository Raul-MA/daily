export function validTime(value) {
  if (typeof value !== 'string' || !/^\d{2}:\d{2}$/.test(value)) return false;
  const [hours, minutes] = value.split(':').map(Number);
  return hours <= 23 && minutes <= 59;
}
function text(value, max) { return typeof value === 'string' && value.trim().length > 0 && value.length <= max; }
function minutes(value) { return Number.isInteger(value) && value >= 1 && value <= 1440; }
function timestamp(value) { return Number.isFinite(value) && value >= 0 && value <= 8640000000000000; }
export function validTemplates(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    && Object.entries(value).every(([name, tasks]) => text(name, 60) && Array.isArray(tasks) && tasks.length > 0 && tasks.every(validTemplateTask));
}
function validTemplateTask(task) { return task !== null && typeof task === 'object' && text(task.name, 120) && minutes(task.minutes); }
function validTask(task) {
  if (!task || !text(task.name, 120) || !minutes(task.allocatedMinutes)) return false;
  const id = text(task.id, 500) || timestamp(task.id);
  const actual = task.actualMinutes === null || timestamp(task.actualMinutes);
  return id && actual && ['pending', 'active', 'completed'].includes(task.status);
}
function validTasks(value) {
  if (!Array.isArray(value) || value.length === 0 || !value.every(validTask)) return false;
  return new Set(value.map(task => task.id)).size === value.length;
}
function validClock(value) {
  if (typeof value.timerRunning !== 'boolean' || !timestamp(value.timerElapsed)) return false;
  if (value.timerRunning) return timestamp(value.timerStartTime) && value.timerStartTime > 0;
  return value.timerStartTime === null || timestamp(value.timerStartTime);
}
export function validSession(value) {
  if (value === null) return true;
  if (!value || !text(value.id, 500) || !validTime(value.goalTime) || !timestamp(value.startTime)) return false;
  if (!validTasks(value.tasks) || !validClock(value)) return false;
  return validIndex(value);
}
function validIndex(value) {
  return Number.isInteger(value.currentTaskIndex) && value.currentTaskIndex >= 0 && value.currentTaskIndex < value.tasks.length;
}
export function validBudget(value) { return Boolean(value && validTemplates(value.templates) && validSession(value.session)); }
export function initialBudget() { return { templates: {}, session: null }; }
