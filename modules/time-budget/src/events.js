const commands = new Set([
  'addTaskInput', 'moveTaskUp', 'moveTaskDown', 'removeTaskInput', 'startBudget', 'loadTemplate', 'saveTemplate', 'deleteTemplate', 'exportTemplates', 'importTemplates',
  'resetApp', 'toggleTimer', 'completeTask', 'addRemainingTask', 'moveRemainingTaskUp', 'moveRemainingTaskDown', 'editRemainingTask', 'deleteRemainingTask',
  'saveRemainingTask', 'saveNewRemainingTask', 'updateRemainingTasks', 'updateRemainingAssignedTime', 'skipReallocation', 'applyReallocation', 'updateReallocationSummary', 'cancelNewTask',
]);
function argument(value, node) {
  const text = value.trim();
  if (text === 'this') return node;
  if (text === 'false') return false;
  if (text === 'true') return true;
  if (/^\d+$/.test(text)) return Number(text);
  throw new Error('Unsupported Time Budget action argument.');
}
async function invoke(app, event) {
  const attribute = `data-time-${event.type}`;
  const node = event.target.closest(`[${attribute}]`);
  if (!node || !app.host.contains(node)) return;
  const match = /^app\.(\w+)\(([^()]*)\)$/.exec(node.getAttribute(attribute));
  if (!match || !commands.has(match[1])) throw new Error('Unsupported Time Budget action.');
  app.ensureFresh();
  const args = match[2].trim() ? match[2].split(',').map(value => argument(value, node)) : [];
  await runAction(app, match[1], args);
}
async function runAction(app, name, args) {
  if (app.pendingActions?.has(name)) return;
  app.pendingActions ??= new Set();
  app.pendingActions.add(name);
  try { await app[name](...args); }
  finally { app.pendingActions.delete(name); document.dispatchEvent(new Event('daily:form-state')); }
}
export function bindEvents(app) {
  const controller = new AbortController();
  for (const type of ['click', 'input', 'change']) app.host.addEventListener(type, event => {
    invoke(app, event).catch(error => app.failure(error));
  }, { signal: controller.signal });
  return () => controller.abort();
}
