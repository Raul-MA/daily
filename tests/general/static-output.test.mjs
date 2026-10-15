import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, cpSync, readFileSync, existsSync, readdirSync, rmSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { spawnSync } from 'node:child_process';

function prepare(t, base = '/preview/deep/') {
  const root = mkdtempSync(join(tmpdir(), 'daily-static-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  for (const directory of ['apps', 'packages', 'modules']) cpSync(resolve(directory), join(root, directory), { recursive: true });
  const result = spawnSync(process.execPath, [resolve('scripts/build.mjs')], { cwd: root, env: { ...process.env, DAILY_BASE: base }, encoding: 'utf8' });
  return { root, result, output: join(root, 'dist') };
}

test('static preparation preserves native modules byte-for-byte and resolves every relative import', t => {
  const { root, result, output } = prepare(t);
  assert.equal(result.status, 0, result.stderr);
  const assets = JSON.parse(readFileSync(join(output, 'asset-list.json'), 'utf8'));
  for (const path of assets.filter(path => path.endsWith('.js'))) {
    const source = readFileSync(join(output, path), 'utf8');
    assert.equal(source, readFileSync(join(root, path), 'utf8'));
    for (const match of source.matchAll(/(?:from\s*|import\s*|import\()\s*['"](\.[^'"]+)['"]/g)) {
      assert.ok(match[1].endsWith('.js'), `${path}: ${match[1]}`);
      assert.ok(existsSync(resolve(dirname(join(output, path)), match[1])), `${path}: ${match[1]}`);
    }
  }
});

test('static preparation uses the configured base for HTML manifest and worker without shipping tests', t => {
  const { result, output } = prepare(t);
  assert.equal(result.status, 0, result.stderr);
  const manifest = JSON.parse(readFileSync(join(output, 'manifest.webmanifest'), 'utf8'));
  assert.equal(manifest.scope, '/preview/deep/');
  assert.equal(manifest.start_url, '/preview/deep/#/');
  assert.match(readFileSync(join(output, 'index.html'), 'utf8'), /content="\/preview\/deep\/"/);
  assert.match(readFileSync(join(output, 'sw.js'), 'utf8'), /self.DAILY_BASE="\/preview\/deep\/"/);
  assert.ok(!existsSync(join(output, 'tests')));
  assert.ok(!existsSync(join(output, 'reports')));
  assert.ok(!existsSync(join(output, 'node_modules')));
});

test('invalid static bases fail before replacing any previously prepared files', t => {
  const { root, result } = prepare(t, 'https://other.example/');
  assert.notEqual(result.status, 0);
  assert.ok(!existsSync(join(root, 'dist')));
  mkdirSync(join(root, 'dist'));
  writeFileSync(join(root, 'dist', 'retain'), 'old output');
  const retry = spawnSync(process.execPath, [resolve('scripts/build.mjs')], { cwd: root, env: { ...process.env, DAILY_BASE: '../' }, encoding: 'utf8' });
  assert.notEqual(retry.status, 0);
  assert.deepEqual(readdirSync(join(root, 'dist')), ['retain']);
});
