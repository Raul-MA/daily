import { test, expect } from '@playwright/test';
import { openApp, createPlayer, createGame, testIds } from './helpers.js';
import { readGameData, confirmGameImport } from './shared-data.js';

async function start(page) {
  await openApp(page);
  await createPlayer(page, 'Ada');
  await createPlayer(page, 'Grace');
  await createGame(page, 'Wingspan', 'wingspan_base');
  await page.getByTestId(testIds.navPlay).first().click();
  await page.getByTestId(testIds.playPlayerToggle).nth(0).check();
  await page.getByTestId(testIds.playPlayerToggle).nth(1).check();
  await page.getByTestId(testIds.playStart).click();
  await expect(page.getByTestId('wingspan-sheet')).toBeVisible();
}

async function fill(page) {
  for (let index = 0; index < 12; index += 1) {
    await page.getByTestId('wingspan-category').nth(index).fill(String(index + 1));
    await page.getByTestId('wingspan-category').nth(index).press('Tab');
  }
}

async function finish(page) {
  page.once('dialog', dialog => dialog.accept());
  await page.getByTestId(testIds.finishSession).click();
  await expect(page.getByTestId(testIds.historyItem)).toHaveCount(1);
}

test('Wingspan corrections recompute reports and category JSON exports restore the original breakdown', async ({ page }) => {
  await start(page);
  await fill(page);
  await finish(page);
  const original = (await readGameData(page)).sessions[0];
  await page.getByTestId(testIds.navSettings).first().click();
  const downloading = page.waitForEvent('download');
  await page.getByTestId(testIds.exportButton).click();
  const path = await (await downloading).path();
  await page.getByTestId(testIds.navHistory).first().click();
  await page.getByTestId(testIds.historyItem).click();
  page.once('dialog', dialog => dialog.accept());
  await page.locator('[data-action="edit-session"]').click();
  await page.getByTestId('wingspan-category').first().fill('100');
  await page.getByTestId('wingspan-category').first().press('Tab');
  await finish(page);
  await page.getByTestId(testIds.navStats).first().click();
  await expect(page.getByTestId('wingspan-report-player').first()).toContainText('100');
  await page.getByTestId(testIds.navSettings).first().click();
  await page.getByTestId(testIds.importInput).setInputFiles(path);
  await confirmGameImport(page);
  expect((await readGameData(page)).sessions[0]).toEqual(original);
  await page.getByTestId(testIds.navStats).first().click();
  await expect(page.getByTestId('wingspan-report-player').first()).not.toContainText('100');
});

test('Wingspan scoring and reports survive offline reload and language remount without losing drafts', async ({ page, context }) => {
  await start(page);
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller) await new Promise(resolve => navigator.serviceWorker.addEventListener('controllerchange', resolve, { once: true }));
  });
  await context.setOffline(true);
  await page.reload();
  await fill(page);
  const startedAt = (await readGameData(page)).sessions[0].startedAt;
  await page.getByTestId('wingspan-category').first().fill('25');
  await page.getByRole('button', { name: 'Español', exact: true }).click();
  await expect(page.getByTestId('wingspan-category').first()).toHaveValue('25');
  await expect(page.getByTestId('wingspan-sheet')).toContainText('Huevos');
  await page.getByTestId('wingspan-category').first().press('Tab');
  await page.reload();
  expect((await readGameData(page)).sessions[0].startedAt).toBe(startedAt);
  await finish(page);
  await page.getByTestId(testIds.navStats).first().click();
  await expect(page.getByTestId('wingspan-report-player').first()).toContainText('25');
});

test.use({ serviceWorkers: 'allow' });
