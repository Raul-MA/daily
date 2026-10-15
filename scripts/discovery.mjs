import { globSync, readFileSync } from 'node:fs';

const expected = { general: 65, plants: 23, coffee: 28, games: 30, piano: 41, whatsapp: 3 };

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
  if (module === 'plants') {
    const files = globSync('modules/plants/e2e/*.spec.js');
    const count = files.reduce((sum, file) => sum + [...readFileSync(file, 'utf8').matchAll(/^test\(/gm)].length, 0);
    if (count !== 11) throw new Error(`Plant browser discovery mismatch: expected 11, found ${count}`);
    return files;
  }
  if (module !== 'general') return discover(module);
  const files = globSync('tests/e2e/*.spec.js').sort();
  const count = files.reduce((sum, file) => sum + [...readFileSync(file, 'utf8').matchAll(/^test\(/gm)].length, 0);
  if (count !== 19) throw new Error(`General browser discovery mismatch: expected 19, found ${count}`);
  return files;
}

export function discoverDomainUnit(module) {
  const expectedCounts = { coffee: 17, games: 15 };
  const files = globSync(`modules/${module}/test/*.test.mjs`).sort();
  const count = files.reduce((sum, file) => sum + [...readFileSync(file, 'utf8').matchAll(/^test\(/gm)].length, 0);
  if (count !== expectedCounts[module]) throw new Error(`${module} unit discovery mismatch: expected ${expectedCounts[module]}, found ${count}`);
  return files;
}
