import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';

test('legacy WhatsApp patch packages a working export link without modifying originals and refuses changed source HTML', t => {
  const root = mkdtempSync(join(tmpdir(), 'daily-whatsapp-patch-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const source = join(root, 'schedule-whatsapp');
  mkdirSync(source);
  const html = readFileSync('tests/fixtures/legacy-whatsapp-index.html', 'utf8');
  writeFileSync(join(source, 'index.html'), html);
  const output = join(root, 'export.patch');
  const prepare = () => spawnSync(process.execPath, [resolve('scripts/prepare-legacy-whatsapp.mjs'), root, output], { encoding: 'utf8' });
  const result = prepare();
  assert.equal(result.status, 0, result.stderr);
  assert.equal(readFileSync(join(source, 'index.html'), 'utf8'), html);
  const checked = spawnSync('git', ['apply', '--check', output], { cwd: source, encoding: 'utf8' });
  assert.equal(checked.status, 0, checked.stderr);
  const applied = spawnSync('git', ['apply', output], { cwd: source, encoding: 'utf8' });
  assert.equal(applied.status, 0, applied.stderr);
  assert.match(readFileSync(join(source, 'index.html'), 'utf8'), /href="daily-migration\/index.html"/);
  for (const name of ['index.html', 'entry.js', 'export.js', 'validation.js']) {
    assert.equal(readFileSync(join(source, 'daily-migration', name), 'utf8'), readFileSync(join('legacy/exporters/whatsapp', name), 'utf8'));
  }
  assert.equal(readFileSync(join(source, 'daily-migration/validation.js'), 'utf8'), readFileSync('modules/whatsapp/src/validation.js', 'utf8'));
  const before = readFileSync(output, 'utf8');
  const changed = prepare();
  assert.notEqual(changed.status, 0);
  assert.match(changed.stderr, /changed|review/i);
  assert.equal(readFileSync(output, 'utf8'), before);
});
