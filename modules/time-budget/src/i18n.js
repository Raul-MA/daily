import { spanish } from './translations.js';

export const dictionaries = {
  en: Object.fromEntries(Object.keys(spanish).map(key => [key, key])), es: spanish,
};

export function translate(language, text, params = {}) {
  const source = dictionaries[language]?.[text] ?? text;
  return Object.entries(params).reduce((value, [key, replacement]) => value.replaceAll(`{${key}}`, String(replacement)), source);
}

export function copy(text, params = {}) { return translate(this.language ?? 'en', text, params); }

export function message(text, params = {}) {
  return this.copy(String(text ?? ''), params);
}
