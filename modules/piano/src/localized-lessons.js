import { translate, currentLanguage } from './i18n.js';

const textFields = new Set(['title', 'objective', 'explanation', 'piano', 'away', 'example', 'label', 'instruction', 'selfChecks']);
const musicalFields = new Set(['keyboard', 'recall', 'roots']);
function localize(value, key, language) {
  if (musicalFields.has(key)) return structuredClone(value);
  if (typeof value === 'string' && textFields.has(key)) return translate(language, value);
  if (Array.isArray(value)) return value.map(item => localize(item, key, language));
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([name, item]) => [name, localize(item, name, language)]));
  return value;
}

export function localizedLesson(lesson, language = currentLanguage()) { return localize(lesson, '', language); }
