const SESSION_KEY = 'daily:readwise:session:v1';
const LOCAL_KEY = 'daily:readwise:token:v1';

function stored(storage, key) {
  try {
    const value = JSON.parse(storage?.getItem(key) ?? 'null');
    return value && typeof value.token === 'string' && typeof value.accountId === 'string' ? value : null;
  } catch { return null; }
}
function loadCredentials(stores, installed) {
  const persistent = installed ? stored(stores.local, LOCAL_KEY) : null;
  if (persistent) return { ...persistent, mode: 'persistent' };
  const session = stored(stores.session, SESSION_KEY);
  return session ? { ...session, mode: 'session' } : { token: '', accountId: '', mode: 'memory' };
}
function saveCredential(stores, record) {
  const targets = [
    { storage: stores.local, key: LOCAL_KEY, mode: 'persistent' },
    { storage: stores.session, key: SESSION_KEY, mode: 'session' },
  ];
  const destination = targets.find(target => target.mode === record.mode);
  if (record.token && destination) destination.storage?.setItem(destination.key, JSON.stringify({ token: record.token, accountId: record.accountId }));
  for (const target of targets) if (target.mode !== record.mode || !record.token) target.storage?.removeItem(target.key);
}
function nextIdentity(current, token) { return token === current.token && current.accountId ? current.accountId : crypto.randomUUID(); }
export function createCredentials(options) {
  const stores = { local: options.storage ?? globalThis.localStorage, session: options.sessionStorage ?? globalThis.sessionStorage };
  let current = loadCredentials(stores, options.installed);
  function set(value, mode) {
    if (typeof value !== 'string' || !['memory', 'session', 'persistent'].includes(mode)) throw new Error('Invalid credential preference.');
    const token = value.trim();
    const next = { token, accountId: nextIdentity(current, token), mode };
    saveCredential(stores, next);
    current = next;
  }
  return { token: () => current.token, accountId: () => current.accountId, mode: () => current.mode, set };
}
