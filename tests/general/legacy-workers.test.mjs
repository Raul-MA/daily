import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { activateWorker } from '../support/worker-harness.mjs';

const originals = JSON.parse(await readFile(new URL('../fixtures/legacy-workers/provenance.json', import.meta.url), 'utf8'));

async function verify(index) {
  const { repo, prefix } = originals[index];
  const source = await readFile(new URL(`../fixtures/legacy-workers/${repo}.js`, import.meta.url), 'utf8');
  const { patchWorker } = await import('../../scripts/legacy/workers.mjs');
  const prepared = process.env.DAILY_ORIGINAL_WORKERS ? source : patchWorker(repo, source);
  const result = await activateWorker(prepared, prefix);
  assert.deepEqual(result.deleted, [`${prefix}prior`]);
  assert.ok(result.names.includes(result.current));
}

test('plants worker removes only its old caches', () => verify(0));
test('coffee worker removes only its old caches', () => verify(1));
test('games worker removes only its old caches', () => verify(2));
test('Time Budget worker removes only its old caches', () => verify(3));
test('piano worker removes only its old caches', () => verify(4));
