export async function requestPersistence(manager) {
  if (typeof manager?.persist !== 'function') return false;
  try { return await manager.persist() === true; }
  catch { return false; }
}
