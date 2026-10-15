export const widgetIds = ['plants', 'activities', 'review', 'reader', 'quick', 'piano'] as const;
export const quickIds = ['coffee', 'games', 'countdown', 'budget'] as const;
export type WidgetId = typeof widgetIds[number];
export type QuickId = typeof quickIds[number];
export type Language = 'en' | 'es';
export type Preferences = { language: Language; widgets: WidgetId[]; quickActions: QuickId[] };
export type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };
export type DailyDocument = { version: 1; preferences: Preferences; modules: Record<string, { version: number; data: JsonValue }> };

function object(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function json(value: unknown): value is JsonValue {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return true;
  if (typeof value === 'number') return Number.isFinite(value);
  if (Array.isArray(value)) return value.every(json);
  return object(value) && Object.values(value).every(json);
}

function knownList(value: unknown, allowed: readonly string[]) {
  return Array.isArray(value) && new Set(value).size === value.length && value.every(item => typeof item === 'string' && allowed.includes(item));
}

export function isLanguage(value: unknown): value is Language {
  return value === 'en' || value === 'es';
}

function preferences(value: unknown): value is Preferences {
  return object(value) && isLanguage(value.language) && knownList(value.widgets, widgetIds) && knownList(value.quickActions, quickIds);
}

function modulePayload(value: unknown) {
  return object(value) && typeof value.version === 'number' && Number.isInteger(value.version) && value.version >= 1 && json(value.data);
}

export function validateDailyDocument(value: unknown): value is DailyDocument {
  return object(value) && value.version === 1 && preferences(value.preferences) && object(value.modules) && Object.values(value.modules).every(modulePayload);
}

export function initialDailyDocument(language: Language): DailyDocument {
  return { version: 1, preferences: { language, widgets: [...widgetIds], quickActions: [...quickIds] }, modules: {} };
}
