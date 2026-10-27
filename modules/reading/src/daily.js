export function localDay(timestamp = Date.now()) {
  const date = new Date(timestamp);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function createDailyPicks(service) {
  let state = { status: 'idle', error: null };
  let pending = null;
  let attempted = '';
  let stateKey = '';
  function key() { return `${localDay(service.now())}:${JSON.stringify(service.read().settings)}:${service.accountId?.() ?? service.token()}`; }
  function current() {
    const data = service.read();
    return data.picks && localDay(data.picks.selectedAt) === localDay(service.now()) && data.picks.settingsKey === JSON.stringify(data.settings);
  }
  function refresh() {
    if (!service.token()) return Promise.resolve(null);
    const operationKey = key();
    if (pending?.key === operationKey) return pending.promise;
    attempted = operationKey;
    stateKey = operationKey;
    state = { status: 'loading', error: null };
    const operation = { key: operationKey };
    operation.promise = Promise.resolve().then(() => service.pick()).then(value => {
      if (pending === operation) state = { status: 'ready', error: null };
      return value;
    }).catch(error => {
      if (pending === operation) state = { status: 'error', error };
      throw error;
    }).finally(() => {
      if (pending === operation) { pending = null; service.emit(); }
    });
    pending = operation;
    service.emit();
    return operation.promise;
  }
  function ensure() {
    if (pending?.key === key()) return pending.promise;
    if (!service.token() || current() || attempted === key()) return Promise.resolve(service.read().picks);
    return refresh();
  }
  return { ensure, refresh, snapshot: () => stateKey === key() ? state : { status: 'idle', error: null } };
}
