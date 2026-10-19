import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

const example = readFileSync(new URL('../docs/exercise-player/example.json', import.meta.url), 'utf8');
async function open(page) { await page.goto('./#/piano/reference/exercise-player'); await expect(page.locator('.player-page h1')).toHaveText('Exercise player'); }
async function paste(page) { await page.locator('[name="import-json"]').fill(example); await page.locator('[data-player-action="import"]').click(); await expect(page.locator('[name="exerciseTitle"]')).toHaveValue('Two hands: triplets and silence'); }
async function noOverflow(page) {
  const dimensions = await page.evaluate(() => {
    const main = document.querySelector('#page-content'); const right = main.getBoundingClientRect().right;
    return { width: main.clientWidth, scroll: main.scrollWidth, offenders: [...main.querySelectorAll('*')].filter(node => node.getBoundingClientRect().right > right + 1).map(node => `${node.tagName}.${node.className}: ${node.getBoundingClientRect().width}`) };
  });
  expect(dimensions.scroll, JSON.stringify(dimensions)).toBeLessThanOrEqual(dimensions.width + 1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
}
async function saved(page) { return page.evaluate(() => JSON.parse(localStorage.getItem('daily:v1')).modules.piano.data.playerLibrary); }

test('player starts empty and accepts paste file and drop while failed imports preserve selection', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await open(page);
  await noOverflow(page); await expect(page.locator('[name="exerciseId"]')).toHaveCount(0);
  await expect(page.locator('.player-import')).toContainText('collection starts empty');
  await paste(page); const before = await saved(page);
  await page.locator('.player-import summary').click();
  await page.locator('[name="import-json"]').fill('{"schemaVersion":99}');
  await page.locator('[data-player-action="import"]').click();
  await expect(page.locator('[data-player-error]')).toContainText('schemaVersion');
  expect(await saved(page)).toEqual(before);
  const next = JSON.parse(example); next.id = 'file-import';
  await page.locator('[name="import-file"]').setInputFiles({ name: 'exercise.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(next)) });
  await expect(page.locator('[name="exerciseId"]')).toHaveValue('file-import');
  await page.evaluate(json => { const transfer = new DataTransfer(); transfer.items.add(new File([json], 'drop.json', { type: 'application/json' })); document.querySelector('.player-page').dispatchEvent(new DragEvent('drop', { bubbles: true, dataTransfer: transfer })); }, JSON.stringify({ ...next, id: 'drop-import' }));
  await expect(page.locator('[name="exerciseId"]')).toHaveValue('drop-import');
  await page.reload(); await expect(page.locator('[name="exerciseId"] option')).toHaveCount(3);
  const escaped = JSON.parse(example); escaped.id = 'escaped-ids';
  const hostile = 'left"><img src=x onerror="window.playerInjected=true">';
  escaped.tracks[0].id = hostile; escaped.variants[0].notes[0].id = hostile;
  for (const note of escaped.variants[0].notes) { if (note.trackId === 'lh') note.trackId = hostile; }
  for (const pedal of escaped.variants[0].pedalEvents) pedal.trackId = hostile;
  await page.locator('.player-import summary').click();
  await page.locator('[name="import-json"]').fill(JSON.stringify(escaped)); await page.locator('[data-player-action="import"]').click();
  await expect(page.locator('[name="exerciseId"]')).toHaveValue('escaped-ids');
  await expect(page.locator('.player-page img')).toHaveCount(0); expect(await page.evaluate(() => window.playerInjected)).toBeUndefined();
});

test('player reuses real audio samples and keyboard and supports seek pause resume mute speed and stop', async ({ page }) => {
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(() => {
    window.playerSources = [];
    const original = AudioContext.prototype.createBufferSource;
    AudioContext.prototype.createBufferSource = function () {
      const source = original.call(this); const record = { ended: false, cancelled: false };
      window.playerSources.push(record); source.addEventListener('ended', () => { record.ended = true; });
      const stop = source.stop.bind(source); source.stop = when => { if (when === undefined) record.cancelled = true; stop(when); };
      return source;
    };
  });
  await open(page); await paste(page);
  await page.locator('[name="speed"]').fill('50'); await page.locator('[name="speed"]').blur();
  await page.locator('[data-player-action="play"]').click();
  await expect(page.locator('[data-player-status]')).toContainText('60.0 quarter notes/min');
  await expect(page.locator('.keyboard-key.is-selected').first()).toBeVisible();
  await page.locator('[data-player-action="pause"]').click();
  const paused = await page.locator('[data-player-position]').textContent();
  await page.waitForTimeout(150); expect(await page.locator('[data-player-position]').textContent()).toBe(paused);
  await page.locator('[name="seek"]').fill('3840'); await page.locator('[data-player-action="seek"]').click();
  await page.locator('[data-player-action="play"]').click();
  await expect(page.locator('[data-player-status]')).toContainText('50.0 quarter notes/min');
  await page.locator('[name="mute:lh"]').check();
  await page.locator('[data-player-action="stop"]').click();
  await expect(page.locator('.keyboard-key.is-selected')).toHaveCount(0);
  await expect(page.locator('[data-player-position]')).toContainText('0 ticks');
  expect(await page.evaluate(() => window.playerSources.length > 0 && window.playerSources.every(source => source.cancelled || source.ended))).toBe(true);
  expect(errors).toEqual([]);
});

test('player corrects notes stores preferences separately and exports importable musical JSON', async ({ page }) => {
  await open(page); await paste(page);
  await page.getByText('Correct a note', { exact: true }).click();
  await page.locator('[name="notePitch"]').fill('50');
  await page.locator('[data-player-action="correct"]').click();
  expect((await saved(page)).exercises[0].variants[0].notes[0].pitch).toBe(50);
  await page.locator('[name="speed"]').fill('75'); await page.locator('[name="speed"]').blur();
  await page.locator('.player-management summary').click();
  const downloadPromise = page.waitForEvent('download'); await page.locator('[data-player-action="export"]').click();
  const download = await downloadPromise; const exported = JSON.parse(readFileSync(await download.path(), 'utf8'));
  expect(exported.variants[0].notes[0].pitch).toBe(50); expect(exported.speed).toBeUndefined();
  await page.reload(); await expect(page.locator('[name="speed"]')).toHaveValue('75');
  await page.locator('.player-management summary').click();
  await page.locator('[data-player-action="delete"]').click(); await expect(page.locator('[name="exerciseId"]')).toHaveCount(0);
  await page.locator('[name="import-json"]').fill(JSON.stringify(exported)); await page.locator('[data-player-action="import"]').click();
  await expect(page.locator('[name="speed"]')).toHaveValue('100');
});

test('player supports measure and exact beat loops score attachments and phone layout', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await open(page); await paste(page);
  await page.screenshot({ path: '/tmp/daily-player-mobile.png', fullPage: true });
  await page.locator('[name="measureStart"]').selectOption('m2');
  await page.locator('[data-player-action="measure-loop"]').click();
  await expect(page.locator('[name="loopStart"]')).toHaveValue('4');
  await page.locator('[name="loopStart"]').fill('4.333333333333333'); await page.locator('[name="loopStart"]').blur();
  expect((await saved(page)).preferences['documentation-triplets'].loop.startTick).toBe(4160);
  await page.getByText('Original score', { exact: true }).click();
  await page.locator('[name="attachmentId"]').fill('score-1');
  const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aF1sAAAAASUVORK5CYII=', 'base64');
  await page.locator('[name="score-file"]').setInputFiles({ name: 'score.png', mimeType: 'image/png', buffer: png });
  await page.getByText('Original score', { exact: true }).click();
  await expect(page.locator('[data-player-score] img')).toBeVisible();
  await page.reload();
  expect((await saved(page)).attachments['documentation-triplets'][0].id).toBe('score-1');
  expect((await saved(page)).exercises[0].variants[0].scoreReferences[0].attachmentId).toBe('score-1');
  await noOverflow(page);
  await page.evaluate(() => new Promise((resolve, reject) => {
    const request = indexedDB.open('daily-piano-scores-v1');
    request.onsuccess = () => { const database = request.result; const transaction = database.transaction('files', 'readwrite'); transaction.objectStore('files').clear(); transaction.oncomplete = () => { database.close(); resolve(); }; transaction.onerror = () => reject(transaction.error); };
  }));
  await page.reload(); await page.getByText('Original score', { exact: true }).click();
  await expect(page.locator('[data-player-score]')).toContainText('Score file missing');
  await page.locator('[data-player-action="play"]').click(); await expect(page.locator('[data-player-status]')).toContainText('playing');
  await page.locator('[data-player-action="stop"]').click();
});

test('the supplied timing exercise imports and plays its leading rest chord octave and triplet passage', async ({ page }) => {
  const fixture = new URL('../test/fixtures/timing-test.json', import.meta.url);
  await page.setViewportSize({ width: 320, height: 740 });
  await open(page);
  await page.locator('[name="import-file"]').setInputFiles({ name: 'timing-test.json', mimeType: 'application/json', buffer: readFileSync(fixture) });
  await expect(page.locator('[name="exerciseId"]')).toHaveValue('timing-test');
  await page.locator('[name="speed"]').fill('25'); await page.locator('[name="speed"]').blur();
  await page.locator('[data-player-action="play"]').click();
  await expect(page.locator('[data-player-status]')).toContainText('playing');
  await expect(page.locator('.keyboard-key.is-selected')).toHaveCount(0);
  await page.locator('[data-player-action="pause"]').click();
  await page.locator('[name="seek"]').fill('960'); await page.locator('[data-player-action="seek"]').click();
  await page.locator('[data-player-action="play"]').click();
  await expect(page.locator('.keyboard-key.is-selected')).toHaveCount(3);
  await page.locator('[data-player-action="pause"]').click();
  await page.locator('[name="seek"]').fill('2880'); await page.locator('[data-player-action="seek"]').click();
  await page.locator('[data-player-action="play"]').click();
  await expect(page.locator('.keyboard-key.is-selected[data-midi="60"]')).toBeVisible();
  await expect(page.locator('.keyboard-key.is-selected[data-midi="72"]')).toBeVisible();
  await page.locator('[data-player-action="pause"]').click();
  await page.locator('[name="seek"]').fill('4480'); await page.locator('[data-player-action="seek"]').click();
  await page.locator('[data-player-action="play"]').click();
  await expect(page.locator('[data-player-notes]')).toContainText('Accent');
  await expect(page.locator('[data-player-position]')).toContainText('LET');
  const keyboard = page.locator('[data-player-keyboard] .keyboard-scroll');
  await keyboard.evaluate(node => { node.scrollLeft = 150; }); await keyboard.focus();
  await expect(page.locator('.keyboard-key.is-selected[data-midi="65"]')).toBeVisible();
  expect(await keyboard.evaluate(node => node.scrollLeft)).toBe(150); await expect(keyboard).toBeFocused();
  await page.locator('[data-player-action="stop"]').click();
  await expect(page.locator('.keyboard-key.is-selected')).toHaveCount(0);
});
