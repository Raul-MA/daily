import test from 'node:test';
import assert from 'node:assert/strict';
import { filledState, memoryState, NOW } from '../fixtures/backup-data.mjs';
import { activityTime } from '../../packages/platform/src/activities.js';

async function backups(fixture, options = {}) {
  const { connectDailyBackups } = await import('../../apps/daily/src/backup/service.js');
  return connectDailyBackups(fixture.state, options);
}
function file(data) { return JSON.stringify({ app: 'daily-pwa', schemaVersion: 1, data }); }

test('combined backup exports every module layout language and original running timestamps without credentials or caches', async () => {
  const fixture = await filledState();
  const service = await backups(fixture);
  const before = fixture.writes.length;
  const text = service.exportBackup();
  const exported = JSON.parse(text);
  assert.equal(exported.app, 'daily-pwa');
  assert.equal(exported.schemaVersion, 1);
  assert.deepEqual(exported.data, fixture.root);
  assert.equal(Object.keys(exported.data.modules).length, 8);
  assert.equal(text.includes('fixture-private-token'), false);
  assert.equal(text.includes('account-epoch'), false);
  assert.equal(fixture.writes.length, before);
});

test('combined preview validates every module and shows counts without changing records', async () => {
  const fixture = await filledState();
  const service = await backups(fixture);
  const before = fixture.writes.length;
  const preview = service.previewImport(service.exportBackup());
  assert.equal(preview.counts.plants, 1);
  assert.equal(preview.counts.coffeeEntries, 1);
  assert.equal(preview.counts.beans, 1);
  assert.equal(preview.counts.gameSessions, 1);
  assert.equal(preview.counts.activities, 4);
  assert.equal(preview.counts.readerPicks, 1);
  assert.equal(preview.counts.whatsappDrafts, 1);
  assert.equal(fixture.writes.length, before);
  assert.deepEqual(fixture.state.read().value, fixture.root);
});

test('combined restore rejects unknown identities future schemas unknown modules and future module versions', async () => {
  const fixture = await filledState();
  const service = await backups(fixture);
  const cases = [
    { app: 'another-app', schemaVersion: 1, data: fixture.root },
    { app: 'daily-pwa', schemaVersion: 9, data: fixture.root },
    { ...fixture.root, version: 9 },
    { ...fixture.root, modules: { ...fixture.root.modules, mystery: { version: 1, data: {} } } },
    { ...fixture.root, modules: { ...fixture.root.modules, reading: { version: 9, data: fixture.root.modules.reading.data } } },
  ];
  for (const input of cases) assert.throws(() => service.previewImport(JSON.stringify(input)), /invalid|unsupported|version|module|format/i);
  assert.deepEqual(fixture.state.read().value, fixture.root);
});

test('combined restore rejects broken coffee references duplicate nested game rounds and invalid plant history', async () => {
  const fixture = await filledState();
  const service = await backups(fixture);
  for (const kind of ['coffee', 'games', 'plants']) {
    const data = structuredClone(fixture.root);
    if (kind === 'coffee') data.modules.coffee.data.entries[0].meta.beanPresetId = 'missing';
    if (kind === 'games') {
      const session = data.modules.games.data.sessions[0];
      session.rounds.push(structuredClone(session.rounds[0]));
    }
    if (kind === 'plants') data.modules.plants.data.plants[0].careLog.push(structuredClone(data.modules.plants.data.plants[0].careLog[0]));
    assert.throws(() => service.previewImport(file(data)), /invalid|duplicate|reference/i);
  }
  assert.deepEqual(fixture.state.read().value, fixture.root);
});

test('combined restore rejects orphan missing and inconsistent active activity mirrors', async () => {
  const fixture = await filledState();
  const service = await backups(fixture);
  for (const edit of ['orphan', 'missing', 'clock']) {
    const data = structuredClone(fixture.root);
    const activity = data.modules.activities.data.find(item => item.kind === 'piano');
    if (edit === 'orphan') activity.reference = 'absent-practice';
    if (edit === 'missing') data.modules.activities.data = data.modules.activities.data.filter(item => item.kind !== 'piano');
    if (edit === 'clock') activity.resumedAt++;
    assert.throws(() => service.previewImport(file(data)), /activity|reference|timing|mirror/i);
  }
  assert.deepEqual(fixture.state.read().value, fixture.root);
});

test('combined confirm performs one root replacement preserving overdue timers IDs layout and all records', async () => {
  const source = await filledState();
  const target = memoryState();
  let cleaned = 0;
  const service = await backups(target, { afterRestore: () => { cleaned++; } });
  const preview = service.previewImport(file(source.root));
  target.writes.length = 0;
  service.applyImport(preview);
  assert.deepEqual(target.state.read().value, source.root);
  assert.equal(target.writes.filter(key => key === 'daily:v1').length, 1);
  assert.equal(cleaned, 1);
  for (const activity of target.state.read().value.modules.activities.data.filter(item => item.kind !== 'game')) assert.equal(activityTime(activity, NOW).overdue, true);
  assert.throws(() => service.applyImport(preview), /unknown|used|preview/i);
});

test('combined failed primary or recovery writes retain records and do not reset credentials', async () => {
  const fixture = await filledState();
  let cleaned = 0;
  const service = await backups(fixture, { afterRestore: () => { cleaned++; } });
  const input = { ...fixture.root, preferences: { ...fixture.root.preferences, language: 'en' } };
  const original = fixture.storage.setItem;
  for (const failing of ['daily:v1:recovery', 'daily:v1']) {
    const preview = service.previewImport(file(input));
    fixture.storage.setItem = (key, value) => { if (key === failing) throw new Error('QuotaExceededError'); original(key, value); };
    assert.throws(() => service.applyImport(preview), /QuotaExceeded/);
    assert.deepEqual(fixture.state.read().value, fixture.root);
    assert.equal(cleaned, 0);
  }
});

test('combined preview rejects tampering and newer edits and can import validated prior root recovery documents', async () => {
  const fixture = await filledState();
  const service = await backups(fixture);
  const tampered = service.previewImport(service.exportBackup());
  tampered.data.preferences.language = 'en';
  assert.throws(() => service.applyImport(tampered), /changed|tamper/i);
  const stale = service.previewImport(service.exportBackup());
  fixture.state.updatePreferences({ language: 'en' });
  assert.throws(() => service.applyImport(stale), /changed|conflict/i);
  const recovery = service.exportRecovery();
  const preview = service.previewImport(recovery);
  service.applyImport(preview);
  assert.deepEqual(fixture.state.read().value, JSON.parse(recovery));
});

test('combined restore reports post-commit credential cleanup failures honestly and supports empty fresh roots', async () => {
  const source = await filledState();
  const target = memoryState();
  const service = await backups(target, { afterRestore: () => { throw new Error('Credential cleanup failed'); } });
  const preview = service.previewImport(file(source.root));
  assert.throws(() => service.applyImport(preview), error => error.rootApplied === true);
  assert.deepEqual(target.state.read().value, source.root);
  const empty = memoryState().state.read().value;
  const clean = await backups(target);
  clean.applyImport(clean.previewImport(file(empty)));
  assert.deepEqual(target.state.read().value, empty);
});
