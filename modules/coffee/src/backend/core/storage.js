import { STORAGE_KEY, createEmptyData, normalizeData } from "./schema.js";

let binding = null;
export function bindCoffeeStorage(adapter) {
  binding = adapter;
  return () => { if (binding === adapter) binding = null; };
}
export function writeSettings(data, patch) {
  if (binding) return binding.save(data, patch.language);
  return writeData(data);
}

export function readData() {
  if (binding) return binding.read();
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const data = createEmptyData();
    writeData(data);
    return data;
  }

  try {
    return normalizeData(JSON.parse(raw));
  } catch {
    return createEmptyData();
  }
}

export function writeData(data) {
  if (binding) return binding.save(data);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizeData(data)));
}

export function replaceData(data) {
  const normalized = normalizeData(data);
  writeData(normalized);
  return normalized;
}
