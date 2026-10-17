import test from 'node:test';
import assert from 'node:assert/strict';
import { filledState } from '../fixtures/backup-data.mjs';

async function setup(options = {}) {
  const { connectRecoveryBackups } = await import('../../apps/daily/src/backup/recovery.js');
  const values = new Map([
    ['daily:v1', '{broken'], ['daily:v1:recovery', '{bad recovery'], ['daily:v1:corrupt', '{broken'],
    ['daily:readwise:token:v1', 'fixture-private-token'], ['daily:v1:unrelated', 'keep'], ['other-app', 'keep'],
  ]);
  const writes = [];
  const reads = [];
  const storage = { getItem: key => { reads.push(key); return values.get(key) ?? null; }, setItem: (key, value) => { writes.push(key); values.set(key, value); } };
  return { service: connectRecoveryBackups(storage, options), values, writes, reads, storage };
}
function file(root) { return JSON.stringify({ app: 'daily-pwa', schemaVersion: 1, data: root }); }

test('attention-screen raw recovery preserves only the three owned root snapshots without scanning storage', async () => {
  const fixture = await setup();
  const before = [...fixture.values];
  const text = fixture.service.exportRecovery();
  const backup = JSON.parse(text);
  assert.equal(backup.app, 'daily-storage-recovery');
  assert.equal(backup.entries['daily:v1'], '{broken');
  assert.equal(backup.entries['daily:v1:recovery'], '{bad recovery');
  assert.deepEqual(Object.keys(backup.entries), ['daily:v1', 'daily:v1:recovery', 'daily:v1:corrupt']);
  assert.equal(text.includes('fixture-private-token'), false);
  assert.ok(fixture.reads.every(key => Object.hasOwn(backup.entries, key)));
  assert.deepEqual([...fixture.values], before);
  assert.deepEqual(fixture.writes, []);
});

test('attention-screen restore validates full backups and replaces only the primary after a successful write', async () => {
  let cleanups = 0;
  const fixture = await setup({ afterRestore: () => { cleanups++; } });
  const { root } = await filledState();
  const before = [...fixture.values];
  assert.throws(() => fixture.service.previewImport('{bad'), /JSON|Unexpected|property/i);
  assert.throws(() => fixture.service.previewImport(file({ ...root, version: 99 })), /version/i);
  assert.deepEqual([...fixture.values], before);
  const preview = fixture.service.previewImport(file(root));
  assert.equal(preview.counts.plants, 1);
  fixture.storage.setItem = () => { throw new Error('QuotaExceededError'); };
  assert.throws(() => fixture.service.applyImport(preview), /Quota/);
  assert.equal(cleanups, 0);
  assert.deepEqual([...fixture.values], before);
  fixture.storage.setItem = (key, value) => { fixture.writes.push(key); fixture.values.set(key, value); };
  fixture.service.applyImport(preview);
  assert.deepEqual(fixture.writes, ['daily:v1']);
  assert.deepEqual(JSON.parse(fixture.values.get('daily:v1')), root);
  assert.equal(fixture.values.get('daily:v1:recovery'), '{bad recovery');
  assert.equal(fixture.values.get('other-app'), 'keep');
  assert.equal(cleanups, 1);
  assert.throws(() => fixture.service.applyImport(preview), /used|unknown/i);
});

test('attention-screen restore rejects stale or tampered previews and future stored root versions', async () => {
  const fixture = await setup();
  const { root } = await filledState();
  const tampered = fixture.service.previewImport(file(root));
  tampered.data.preferences.language = 'en';
  tampered.data.modules = {};
  assert.throws(() => fixture.service.applyImport(tampered), /changed|preview/i);
  const preview = fixture.service.previewImport(file(root));
  fixture.values.set('daily:v1:recovery', 'newer recovery');
  const before = [...fixture.values];
  assert.throws(() => fixture.service.applyImport(preview), /changed|conflict/i);
  assert.deepEqual([...fixture.values], before);
  fixture.values.set('daily:v1', JSON.stringify({ version: 99 }));
  const future = [...fixture.values];
  assert.ok(fixture.service.exportRecovery().includes('99'));
  assert.throws(() => fixture.service.previewImport(file(root)), /version|future/i);
  assert.deepEqual([...fixture.values], future);
});

test('attention-screen recovery propagates blocked reads and reports cleanup failure only after replacement', async () => {
  const fixture = await setup({ afterRestore: () => { throw new Error('credential storage blocked'); } });
  const { root } = await filledState();
  const preview = fixture.service.previewImport(file(root));
  assert.throws(() => fixture.service.applyImport(preview), error => error.rootApplied === true);
  assert.deepEqual(JSON.parse(fixture.values.get('daily:v1')), root);
  const before = [...fixture.values];
  fixture.storage.getItem = () => { throw new Error('Storage blocked'); };
  assert.throws(() => fixture.service.exportRecovery(), /blocked/);
  assert.throws(() => fixture.service.previewImport(file(root)), /blocked/);
  assert.deepEqual([...fixture.values], before);
});
