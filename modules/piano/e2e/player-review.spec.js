import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

const example = readFileSync(new URL('../docs/exercise-player/example.json', import.meta.url), 'utf8');
async function open(page) { await page.goto('./#/piano/reference/exercise-player'); await expect(page.locator('.player-page h1')).toBeVisible(); }
async function imported(page) { await open(page); await page.locator('[name="import-json"]').fill(example); await page.locator('[data-player-action="import"]').click(); await expect(page.locator('[name="speed"]')).toBeVisible(); }
const raw = page => page.evaluate(() => localStorage.getItem('daily:v1'));

test('player import rename and correction drafts survive language remounts and clear after save', async ({ page }) => {
  await open(page); await page.locator('[name="import-json"]').fill(example);
  await expect(page.locator('form[data-unsaved="true"] [name="import-json"]')).toHaveCount(1);
  await page.getByRole('button', { name: 'Español', exact: true }).click();
  await expect(page.locator('[name="import-json"]')).toHaveValue(example);
  await page.locator('[data-player-action="import"]').click(); await expect(page.locator('form[data-unsaved="true"]')).toHaveCount(0);
  await page.locator('.player-management summary').click(); await page.locator('[name="exerciseTitle"]').fill('My draft');
  await page.getByRole('button', { name: 'English', exact: true }).click();
  await expect(page.locator('[name="exerciseTitle"]')).toBeVisible(); await expect(page.locator('[name="exerciseTitle"]')).toHaveValue('My draft');
  await page.locator('[data-player-action="rename"]').click(); await expect(page.locator('form[data-unsaved="true"]')).toHaveCount(0);
  await page.getByText('Correct a note', { exact: true }).click(); await page.locator('[name="notePitch"]').fill('51');
  await page.getByRole('button', { name: 'Español', exact: true }).click();
  await expect(page.locator('[name="notePitch"]')).toBeVisible(); await expect(page.locator('[name="notePitch"]')).toHaveValue('51');
  await page.locator('[data-player-action="correct"]').click(); await expect(page.locator('form[data-unsaved="true"]')).toHaveCount(0);
});

test('changing the corrected note keeps its editor open and keyboard focus on the selector', async ({ page }) => {
  await imported(page); const before = await raw(page);
  await page.getByText('Correct a note', { exact: true }).click(); await page.locator('[name="noteId"]').focus();
  await page.locator('[name="noteId"]').selectOption('n2');
  await expect(page.locator('[name="notePitch"]')).toBeVisible(); await expect(page.locator('[name="noteId"]')).toBeFocused();
  await expect(page.locator('[name="notePitch"]')).toHaveValue('60'); expect(await raw(page)).toBe(before);
});

test('Spanish player validation explains file shape reference and syntax failures without changing paths', async ({ page }) => {
  await open(page); await page.getByRole('button', { name: 'Español', exact: true }).click();
  await page.locator('[name="import-file"]').setInputFiles({ name: 'invalid.json', mimeType: 'application/json', buffer: Buffer.from('{"schemaVersion":99}') });
  await expect(page.locator('[data-player-error]')).toContainText('$.schemaVersion: el valor admitido es 1');
  await page.locator('[name="import-json"]').fill('{}'); await page.locator('[data-player-action="import"]').click();
  await expect(page.locator('[data-player-error]')).toContainText('$.schemaVersion: obligatorio');
  const duplicate = JSON.parse(example); duplicate.tracks.push(duplicate.tracks[0]);
  await page.locator('[name="import-json"]').fill(JSON.stringify(duplicate)); await page.locator('[data-player-action="import"]').click();
  await expect(page.locator('[data-player-error]')).toContainText('$.tracks[2].id: duplicado lh');
  await page.locator('[name="import-json"]').fill('{'); await page.locator('[data-player-action="import"]').click();
  await expect(page.locator('[data-player-error]')).toContainText('JSON no válido');
});

test('importing from the bottom reveals and focuses the player heading in document scroll', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 500 }); await imported(page);
  await page.locator('.player-import summary').click();
  await page.locator('[name="import-json"]').fill(JSON.stringify({ ...JSON.parse(example), id: 'bottom-import' }));
  await page.locator('[data-player-action="import"]').click();
  await expect(page.locator('.player-page h1')).toBeInViewport(); await expect(page.locator('.player-page h1')).toBeFocused();
});

test('late file reads cannot overwrite newer imports or save after leaving the player', async ({ page }) => {
  await open(page);
  await page.evaluate(() => { const original = File.prototype.text; window.releaseImports = []; File.prototype.text = function () { return new Promise(resolve => window.releaseImports.push(async () => resolve(await original.call(this)))); }; });
  await page.locator('[name="import-file"]').setInputFiles({ name: 'old.json', mimeType: 'application/json', buffer: Buffer.from(example) });
  await page.evaluate(json => { const data = new DataTransfer(); data.items.add(new File([json], 'latest.json')); document.querySelector('.player-page').dispatchEvent(new DragEvent('drop', { bubbles: true, dataTransfer: data })); }, JSON.stringify({ ...JSON.parse(example), id: 'latest' }));
  await expect.poll(() => page.evaluate(() => window.releaseImports.length)).toBe(2);
  await page.evaluate(() => window.releaseImports[1]()); await expect(page.locator('[name="exerciseId"]')).toHaveValue('latest');
  const before = await raw(page); await page.evaluate(() => window.releaseImports[0]()); expect(await raw(page)).toBe(before);
  await page.locator('.player-import summary').click();
  await page.locator('[name="import-file"]').setInputFiles({ name: 'late.json', mimeType: 'application/json', buffer: Buffer.from(example) });
  await page.getByRole('link', { name: 'Home', exact: true }).click(); await page.evaluate(() => window.releaseImports[2]()); expect(await raw(page)).toBe(before);
});

test('switching exercises cannot apply another exercise title or correction draft', async ({ page }) => {
  await imported(page); await page.locator('.player-import summary').click();
  await page.locator('[name="import-json"]').fill(JSON.stringify({ ...JSON.parse(example), id: 'second', title: 'Second' }));
  await page.locator('[data-player-action="import"]').click(); await page.locator('.player-management summary').click();
  await page.locator('[name="exerciseTitle"]').fill('Unrelated draft');
  await page.getByText('Correct a note', { exact: true }).click(); await page.locator('[name="notePitch"]').fill('51');
  await page.locator('[name="exerciseId"]').selectOption('documentation-triplets');
  await expect(page.locator('[name="exerciseTitle"]')).toHaveValue('Two hands: triplets and silence');
  await expect(page.locator('[name="notePitch"]')).toHaveValue('48'); await expect(page.locator('form[data-unsaved="true"]')).toHaveCount(0);
});
