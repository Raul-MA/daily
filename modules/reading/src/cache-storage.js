export function readCache(storage, key, accountId) {
  try {
    const value = JSON.parse(storage?.getItem(key) ?? 'null');
    return value?.version === 1 && value.accountId === accountId ? value : null;
  } catch { return null; }
}
export function writeCache(storage, key, value) {
  try { storage?.setItem(key, JSON.stringify(value)); return true; }
  catch { return false; }
}
export function removeCache(storage, key) {
  try { storage?.removeItem(key); }
  catch { return false; }
  return true;
}
