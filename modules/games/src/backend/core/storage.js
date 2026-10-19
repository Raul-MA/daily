import { createEmptyData, normalizeData, STORAGE_KEY } from "./schema.js";

let binding = null;
export function bindGameStorage(adapter) {
  binding = adapter;
  return () => { if (binding === adapter) binding = null; };
}
export function saveSettings(data, patch) {
  return binding ? binding.save(data, { language: patch.language }) : saveData(data);
}

export function loadData() {
  if (binding) return binding.read();
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return createEmptyData();

  try {
    return normalizeData(JSON.parse(raw));
  } catch {
    return createEmptyData();
  }
}

export function saveData(data) {
  if (binding) return binding.save(data);
  const normalized = normalizeData(data);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  return normalized;
}

export function replaceData(data) {
  if (binding) return binding.replace(data);
  return saveData(data);
}

export function clearData() {
  if (binding) return binding.replace(createEmptyData());
  localStorage.removeItem(STORAGE_KEY);
}
