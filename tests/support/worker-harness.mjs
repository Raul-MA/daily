import vm from 'node:vm';

export async function activateWorker(source, prefix) {
  const handlers = {};
  const deleted = [];
  const names = [];
  const sandbox = {
    self: { addEventListener: (name, handler) => { handlers[name] = handler; }, clients: { claim: async () => {} } },
    caches: { keys: async () => names, delete: async name => { deleted.push(name); return true; } },
  };
  vm.runInNewContext(`${source}\nglobalThis.currentCache = CACHE_NAME;`, sandbox);
  names.push(sandbox.currentCache, `${prefix}prior`, 'daily-shell-v1', 'unrelated', 'crois-v10', 'toniq-v6', 'plant-tracker-v3.5', 'time-budget-v3.2', 'board-game-score-tracker-shell-v6');
  const pending = [];
  handlers.activate({ waitUntil: promise => pending.push(promise) });
  await Promise.all(pending);
  return { deleted, current: sandbox.currentCache, names };
}
