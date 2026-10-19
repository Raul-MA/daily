import base from './translations/en.js';
import spanish from './translations/ui.js';
import errors from './translations/errors.js';

const source = { ...spanish, ...errors };
export const dictionaries = {
  en: { ...base, ...Object.fromEntries(Object.keys(source).map(key => [key, key])) },
  es: { ...Object.fromEntries(Object.entries(base).map(([key, value]) => [key, spanish[value]])), ...source },
};
const errorSources = Object.keys(errors).sort((a, b) => b.length - a.length);

export function getAvailableLanguages() { return Object.keys(dictionaries); }

export function t(language, key) { return dictionaries[language]?.[key] || dictionaries.en[key] || key; }

export function translate(language, text, params = {}) {
  return Object.entries(params).reduce((value, [key, replacement]) => value.replaceAll(`{${key}}`, String(replacement)), t(language, text));
}

export function translateMessage(language, message) {
  const text = String(message ?? '');
  if (language !== 'es') return text;
  if (source[text]) return source[text];
  return errorSources.reduce((value, key) => value.replaceAll(key, errors[key]), text);
}
