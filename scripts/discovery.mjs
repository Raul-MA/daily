import { globSync, readFileSync } from 'node:fs';

const expected = { general: 65, plants: 23, coffee: 28, games: 30, 'time-budget': 17, piano: 53, reading: 51, whatsapp: 9 };

export function discover(module) {
  const browser = ['coffee', 'games', 'time-budget'].includes(module);
  const pattern = module === 'general' ? 'tests/general/*.test.mjs' : `modules/${module}/${browser ? 'e2e/*.spec.js' : 'test/*.{test.mjs,cjs}'}`;
  const files = globSync(pattern).sort();
  const count = files.reduce((sum, file) => sum + [...readFileSync(file, 'utf8').matchAll(/^test\(/gm)].length, 0);
  if (!expected[module] || count !== expected[module]) {
    throw new Error(`Test discovery mismatch: ${module}, expected ${expected[module] ?? 'characterization suite not yet authored'}, found ${count}`);
  }
  return files;
}

export function discoverBrowser(module) {
  if (['plants', 'piano', 'reading', 'whatsapp'].includes(module)) {
    const files = globSync(`modules/${module}/e2e/*.spec.js`);
    const count = files.reduce((sum, file) => sum + [...readFileSync(file, 'utf8').matchAll(/^test\(/gm)].length, 0);
    const counts = { plants: 11, piano: 10, reading: 30, whatsapp: 9 };
    const expectedCount = counts[module];
    if (count !== expectedCount) throw new Error(`${module} browser discovery mismatch: expected ${expectedCount}, found ${count}`);
    return files;
  }
  if (module !== 'general') return discover(module);
  const files = globSync('tests/e2e/*.spec.js').sort();
  const count = files.reduce((sum, file) => sum + [...readFileSync(file, 'utf8').matchAll(/^test\(/gm)].length, 0);
  if (count !== 19) throw new Error(`General browser discovery mismatch: expected 19, found ${count}`);
  return files;
}

export function discoverDomainUnit(module) {
  const expectedCounts = { coffee: 17, games: 15, 'time-budget': 17 };
  const files = globSync(`modules/${module}/test/*.test.mjs`).sort();
  const count = files.reduce((sum, file) => sum + [...readFileSync(file, 'utf8').matchAll(/^test\(/gm)].length, 0);
  if (count !== expectedCounts[module]) throw new Error(`${module} unit discovery mismatch: expected ${expectedCounts[module]}, found ${count}`);
  return files;
}
