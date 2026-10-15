import { readData, writeSettings } from "../core/storage.js";

export function getSettings() {
  return readData().settings;
}

export function updateSettings(patch) {
  const data = readData();
  data.settings = { ...data.settings, ...patch };
  writeSettings(data, patch);
  return data.settings;
}
