import fragments from './translations/fragments.js';
import symbolic from './translations/symbolic.js';
import corrections from './translations/corrections.js';
import copy0 from './translations/copy0.js';
import copy1 from './translations/copy1.js';
import copy2 from './translations/copy2.js';
import copy3 from './translations/copy3.js';
import copy4 from './translations/copy4.js';
import copy5 from './translations/copy5.js';
import extra from './translations/extra.js';
import controls from './translations/controls.js';
import terms from './translations/terms.js';
import { patterns } from './translations/patterns.js';
import { pianoContext } from './js/context.js';
import { interpolate, translatePattern } from './phrase-patterns.js';

const spanish = { ...copy0, ...copy1, ...copy2, ...copy3, ...copy4, ...copy5, ...extra, ...controls, ...terms, ...corrections, ...symbolic, ...fragments, ...Object.fromEntries(patterns) };
export const dictionaries = { en: Object.fromEntries(Object.keys(spanish).map(key => [key, key])), es: spanish };
const folded = new Map(Object.keys(spanish).map(key => [key.toLowerCase(), key]));

export function currentLanguage() { return pianoContext.language || 'en'; }
export function copy(value, params = {}) { return translate(currentLanguage(), value, params); }

export function translate(language, value, params = {}) {
  if (typeof value !== 'string') return value;
  if (language !== 'es') return interpolate(value, params);
  const key = Object.hasOwn(spanish, value) ? value : folded.get(value.toLowerCase());
  if (key !== undefined) return interpolate(spanish[key], Object.fromEntries(Object.entries(params).map(([name, item]) => [name, translate(language, item)])));
  const text = interpolate(value, params);
  const trimmed = text.trim();
  if (trimmed !== text) return text.replace(trimmed, translate(language, trimmed));
  return translatePattern(text, item => translate(language, item));
}

export function presentPrompt(prompt, language = currentLanguage()) {
  const result = structuredClone(prompt);
  result.question = translate(language, result.question);
  result.answer = translate(language, result.answer);
  return result;
}

export function presentAuthoredHTML(html, language = currentLanguage()) {
  return html.replace(/>([^<>]+)</g, (_, text) => `>${translate(language, text)}<`);
}
