import { globSync, readFileSync } from 'node:fs';

const expected = { general: 2, plants: 7, coffee: 21, games: 24, piano: 41, whatsapp: 3 };

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
