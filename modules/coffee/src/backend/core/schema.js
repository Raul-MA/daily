export const SCHEMA_VERSION = 1;

export const STORAGE_KEY = "coffee-tracker:v1";

export const DEFAULT_SETTINGS = {
  theme: "system",
  language: "en",
  burrTouchReference: "",
  defaultYieldUnit: "g",
  historyListView: "compact",
  lastExportedAt: null,
  toolsConfigured: false,
  tools: {
    wdt: false,
    distributor: false,
    puckScreen: false
  }
};

export function createEmptyData() {
  return {
    schemaVersion: SCHEMA_VERSION,
    entries: [],
    beanPresets: [],
    settings: normalizeSettings()
  };
}

function normalizeSettings(value = {}) {
  const settings = value && typeof value === "object" ? value : {};
  const tools = toolObject(settings.tools);
  const historyListView = ["compact", "detailed"].includes(settings.historyListView) ? settings.historyListView : DEFAULT_SETTINGS.historyListView;
  const language = ["en", "es"].includes(settings.language) ? settings.language : DEFAULT_SETTINGS.language;
  return {
    ...DEFAULT_SETTINGS,
    ...settings,
    language,
    historyListView,
    tools: {
      ...DEFAULT_SETTINGS.tools,
      ...tools
    }
  };
}

export function normalizeData(value) {
  if (!value || typeof value !== "object") {
    return createEmptyData();
  }

  return {
    schemaVersion: value.schemaVersion || SCHEMA_VERSION,
    entries: Array.isArray(value.entries) ? value.entries : [],
    beanPresets: Array.isArray(value.beanPresets) ? value.beanPresets : [],
    settings: normalizeSettings(value.settings)
  };
}

function toolObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}
