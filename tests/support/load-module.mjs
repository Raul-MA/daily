import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

export const sources = {
  plants: 'stillgreen', coffee: 'coffee-tracker', games: 'game-tracker',
  'time-budget': 'timeBudget', piano: 'toniq', whatsapp: 'schedule-whatsapp',
};

export function modulePath(module, path) {
  const baseline = process.env.DAILY_SOURCE_ROOT;
  if (baseline) return resolve(baseline, sources[module], path);
  return resolve('modules', module, 'src', path);
}

function absent(module, path) {
  const fail = () => { throw new Error(`Unimplemented ${module}: ${path}`); };
  return new Proxy(fail, { get: fail });
}

export async function loadModule(module, path) {
  const target = modulePath(module, path);
  if (existsSync(target)) return import(pathToFileURL(target).href);
  return new Proxy({}, { get: (_, name) => name === 'then' ? undefined : absent(module, `${path}:${String(name)}`) });
}
