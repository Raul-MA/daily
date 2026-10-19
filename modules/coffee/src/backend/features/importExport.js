import { normalizeData } from "../core/schema.js";
import { readData, replaceData, writeData } from "../core/storage.js";
import { validateBackup } from "../core/validation.js";

function numberOrNull(value) {
  if (value === "" || value === undefined || value === null) return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function calculateCompositionRatio(addInMl, yieldValue) {
  const addIn = numberOrNull(addInMl);
  const coffee = numberOrNull(yieldValue);
  if (!addIn || !coffee) return null;
  return Number((addIn / coffee).toFixed(2));
}

function importedComposition(brew, drinkType) {
  const milk = ['flat_white', 'cappuccino', 'latte', 'cortado', 'macchiato'].includes(drinkType);
  return {
    waterMl: drinkType === 'americano' ? numberOrNull(brew.waterMl) : null,
    milkMl: milk ? numberOrNull(brew.milkMl) : null,
    milkBrand: milk ? brew.milkBrand || '' : '', milkType: milk ? brew.milkType || '' : '',
  };
}
function normalizeImportedEntry(entry) {
  const brew = entry.brew || {};
  const drinkType = brew.drinkType || 'espresso';
  const additions = importedComposition(brew, drinkType);
  return { ...entry, brew: { ...brew, drinkType, ...additions, compositionRatio: calculateCompositionRatio(drinkType === 'americano' ? additions.waterMl : additions.milkMl, brew.yieldValue) } };
}

function normalizeImportedData(data) {
  const normalized = normalizeData(data);
  return {
    ...normalized,
    entries: normalized.entries.map(normalizeImportedEntry)
  };
}

function hasOwn(object, key) {
  return Object.prototype.hasOwnProperty.call(object || {}, key);
}

function isObject(value) {
  return value && typeof value === "object" && !Array.isArray(value);
}

export function exportAll() {
  return readData();
}

export function importAll(incoming, { mode = "merge" } = {}) {
  const result = prepareImport(incoming, { mode });
  if (mode === 'replace') return replaceData(result);
  writeData(result);
  return result;
}

export function prepareImport(incoming, { mode = 'merge', current = readData() } = {}) {
  if (!['merge', 'replace'].includes(mode)) throw new Error('Unsupported import mode.');
  const errors = validateBackup(incoming);
  if (errors.length) throw new Error(errors.join(" "));
  assertUniqueIds(incoming);

  const normalized = normalizeImportedData(incoming);

  if (mode === "replace") {
    return normalized;
  }

  const entries = new Map(current.entries.map((entry) => [entry.id, entry]));
  const beans = new Map(current.beanPresets.map((bean) => [bean.id, bean]));

  normalized.entries.forEach((entry) => entries.set(entry.id, entry));
  normalized.beanPresets.forEach((bean) => beans.set(bean.id, bean));

  const merged = {
    ...current,
    entries: [...entries.values()],
    beanPresets: [...beans.values()],
    settings: mergeSettings(incoming, current, normalized)
  };

  return merged;
}

function assertUniqueIds(incoming) {
  for (const values of [incoming.entries, incoming.beanPresets]) {
    if (new Set(values.map(value => value.id)).size !== values.length) throw new Error('Duplicate coffee record ids.');
  }
}

function mergeSettings(incoming, current, normalized) {
  const incomingSettings = isObject(incoming.settings) ? incoming.settings : {};
  const incomingTools = isObject(incomingSettings.tools) ? incomingSettings.tools : {};
  const mergedSettings = {
    ...current.settings,
    ...normalized.settings,
    tools: {
      ...current.settings.tools,
      ...incomingTools
    }
  };
  if (!hasOwn(incomingSettings, "toolsConfigured")) {
    mergedSettings.toolsConfigured = current.settings.toolsConfigured;
  }
  if (!hasOwn(incomingSettings, "tools")) {
    mergedSettings.tools = current.settings.tools;
  }

  return mergedSettings;
}
