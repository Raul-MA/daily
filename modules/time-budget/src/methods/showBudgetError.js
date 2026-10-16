export function showBudgetError(item, overMinutes, kind = 'budget') {
  let error = item.querySelector('.budget-error');
  if (!error) {
    error = this.dom.createElement('span');
    error.className = 'budget-error';
    item.insertBefore(error, item.querySelector('.task-actions'));
  }
  error.dataset.kind = kind;
  error.dataset.minutes = String(Math.ceil(overMinutes));
  error.textContent = kind === 'input' ? this.copy('Enter a task and 1–1440 minutes') : this.copy('{count} min over budget', { count: Math.ceil(overMinutes) });
}
