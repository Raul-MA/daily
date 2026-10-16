export function captureQueue(app) {
  const list = app.dom.getElementById('remainingTasksList');
  return {
    editing: Array.from(list.querySelectorAll('.user-task-card.editing'), node => Number(node.dataset.taskIndex)),
    added: Boolean(list.querySelector('.add-task-form')),
    errors: Array.from(list.querySelectorAll('.budget-error'), node => ({
      index: node.closest('.user-task-card')?.dataset.taskIndex ?? null,
      kind: node.dataset.kind, minutes: Number(node.dataset.minutes),
    })),
  };
}

export function restoreQueue(app, snapshot) {
  if (!snapshot) return;
  for (const index of snapshot.editing) {
    if (app.state.tasks[index]) app.editRemainingTask(index);
  }
  if (snapshot.added) app.addRemainingTask();
}

export function restoreQueueErrors(app, snapshot) {
  for (const error of snapshot?.errors ?? []) {
    const selector = error.index === null ? '.add-task-form' : `[data-task-index="${CSS.escape(error.index)}"]`;
    const item = app.dom.getElementById('remainingTasksList').querySelector(selector);
    if (item) app.showBudgetError(item, error.minutes, error.kind);
  }
}
