import { patterns } from './translations/patterns.js';

function compile([source, translated]) {
  const names = [];
  const expression = source.split(/(\{\w+\})/g).map(part => {
    if (/^\{\w+\}$/.test(part)) { names.push(part.slice(1, -1)); return '([^<>]*?)'; }
    return part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }).join('');
  return { names, translated, expression: new RegExp(`^${expression}$`) };
}
const compiled = patterns.map(compile);

export function interpolate(text, params) {
  return Object.entries(params).reduce((value, [key, replacement]) => value.replaceAll(`{${key}}`, String(replacement)), text);
}

export function translatePattern(text, translate) {
  if (text.includes('<') || text.length > 2000) return text;
  for (const pattern of compiled) {
    const match = pattern.expression.exec(text);
    if (!match) continue;
    const params = Object.fromEntries(pattern.names.map((name, index) => [name, translate(match[index + 1])]));
    if (pattern.names.includes('plural') && params.plural) params.plural = pattern.translated.includes('bemol') ? 'es' : 's';
    return interpolate(pattern.translated, params);
  }
  return text;
}
