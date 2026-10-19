function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('daily-piano-scores-v1', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('files');
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
export async function scoreFile(action, key, file) {
  const database = await openDatabase();
  try {
    return await new Promise((resolve, reject) => {
      const transaction = database.transaction('files', action === 'get' ? 'readonly' : 'readwrite');
      const store = transaction.objectStore('files');
      let request;
      if (action === 'put') request = store.put(file, key);
      else if (action === 'delete') request = store.delete(key);
      else request = store.get(key);
      transaction.oncomplete = () => resolve(request.result);
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error ?? new Error('Score file save aborted.'));
    });
  } finally { database.close(); }
}
export function attachmentKey(exerciseId, attachmentId) { return JSON.stringify([exerciseId, attachmentId]); }
