import { globSync, readFileSync } from 'node:fs';

const expected = { general: 54, plants: 7, coffee: 21, games: 24, piano: 41, whatsapp: 3 };

export function discover(module) {
  const browser = module === 'coffee' || module === 'games';
  const pattern = module === 'general' ? 'tests/general/*.test.mjs' : `modules/${module}/${browser ? 'e2e/*.spec.js' : 'test/*.{test.mjs,cjs}'}`;
  const files = globSync(pattern).sort();
  const count = files.reduce((sum, file) => sum + [...readFileSync(file, 'utf8').matchAll(/^test\(/gm)].length, 0);
  if (!expected[module] || count !== expected[module]) {
    throw new Error(`Test discovery mismatch: ${module}, expected ${expected[module] ?? 'characterization suite not yet authored'}, found ${count}`);
  }
  return files;
}

export function discoverBrowser(module) {
  if (module !== 'general') return discover(module);
  const files = globSync('tests/e2e/*.spec.js').sort();
  const count = files.reduce((sum, file) => sum + [...readFileSync(file, 'utf8').matchAll(/^test\(/gm)].length, 0);
  if (count !== 17) throw new Error(`General browser discovery mismatch: expected 17, found ${count}`);
  return files;
}
