import { test, expect } from '@playwright/test';
import { openApp, createPlayer, createGame, testIds } from './helpers.js';
import { readGameData } from './shared-data.js';

async function setup(page, language = 'en', count = 2) {
  await openApp(page);
  for (let index = 0; index < count; index += 1) await createPlayer(page, `Player ${index + 1}`);
  if (language === 'es') await page.getByRole('button', { name: 'Español', exact: true }).click();
  await createGame(page, 'Wingspan', 'wingspan_base');
  await page.getByTestId(testIds.navPlay).first().click();
  await page.getByTestId(testIds.playGameSelect).selectOption({ label: 'Wingspan' });
}

async function start(page) {
  await page.getByTestId(testIds.playPlayerToggle).nth(0).check();
  await page.getByTestId(testIds.playPlayerToggle).nth(1).check();
  await page.getByTestId(testIds.playStart).click();
  await expect(page.getByTestId('wingspan-sheet')).toBeVisible();
  await expect(page.getByTestId(testIds.addRound)).toHaveCount(0);
  const sheet = await page.getByTestId('wingspan-sheet').boundingBox();
  const timing = await page.locator('.timing-panel').boundingBox();
  expect(sheet.y).toBeLessThan(timing.y);
}

async function fillPlayer(page, index, scores) {
  const inputs = page.getByTestId('wingspan-player').nth(index).getByTestId('wingspan-category');
  for (const [category, score] of scores.entries()) {
    await inputs.nth(category).fill(String(score));
    await inputs.nth(category).press('Tab');
  }
}

async function finish(page) {
  page.once('dialog', dialog => dialog.accept());
  await page.getByTestId(testIds.finishSession).click();
}

test('Wingspan uses existing setup, saves categories through reload and history, and reports player averages', async ({ page }) => {
  await setup(page);
  await start(page);
  await fillPlayer(page, 0, [30, 5, 10, 12, 3, 8]);
  await fillPlayer(page, 1, [20, 6, 8, 20, 4, 6]);
  await expect(page.getByTestId('wingspan-total').first()).toHaveText('68');
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: 'reports/games-wingspan-desktop.png', fullPage: true });
  await page.setViewportSize({ width: 320, height: 740 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: 'reports/games-wingspan-phone.png', fullPage: true });
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.reload();
  await expect(page.getByTestId('wingspan-category').first()).toHaveValue('30');
  await finish(page);
  const data = await readGameData(page);
  expect(data.sessions[0].winnerPlayerIds).toEqual([data.players[0].id]);
  expect(data.sessions[0].rounds).toEqual([]);
  await page.getByTestId(testIds.historyItem).click();
  await expect(page.getByTestId('wingspan-total').first()).toHaveText('68');
  await expect(page.getByTestId('wingspan-category')).toHaveCount(0);
  await page.getByTestId(testIds.navStats).first().click();
  await expect(page.getByTestId('wingspan-reports')).toContainText('Bird points');
  await page.screenshot({ path: 'reports/games-wingspan-reports-desktop.png', fullPage: true });
  await page.setViewportSize({ width: 320, height: 740 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: 'reports/games-wingspan-reports-phone.png', fullPage: true });
  await page.setViewportSize({ width: 1280, height: 900 });
  await expect(page.getByTestId('wingspan-report-player').first()).toContainText('30');
  await page.getByTestId('wingspan-report-player-filter').selectOption(data.players[1].id);
  await expect(page.getByTestId('wingspan-report-player')).toHaveCount(1);
  await expect(page.getByTestId('wingspan-report-player')).toContainText('Player 2');
});

test('Wingspan shows its five-player limit and blocks a sixth participant before starting', async ({ page }) => {
  await setup(page, 'en', 6);
  await expect(page.getByTestId('wingspan-player-limit')).toContainText('2–5');
  for (let index = 0; index < 5; index += 1) await page.getByTestId(testIds.playPlayerToggle).nth(index).check();
  await expect(page.getByTestId(testIds.playPlayerToggle).nth(5)).toBeDisabled();
  await page.getByTestId('inline-player-name').fill('Extra player');
  await page.getByTestId('inline-player-add').click();
  await expect(page.getByTestId(testIds.playPlayerToggle)).toHaveCount(7);
  await expect(page.getByTestId(testIds.playPlayerToggle).filter({ visible: true })).toHaveCount(7);
  expect(await page.getByTestId(testIds.playPlayerToggle).evaluateAll(inputs => inputs.filter(input => input.checked).length)).toBe(5);
  await page.getByTestId(testIds.playStart).click();
  expect((await readGameData(page)).sessions[0].participants).toHaveLength(5);
});

test('Wingspan Spanish phone flow requires completed categories and resolves ties with unused food', async ({ page }) => {
  await setup(page, 'es');
  await start(page);
  await page.setViewportSize({ width: 320, height: 740 });
  await expect(page.getByTestId('wingspan-sheet')).toContainText('Huevos');
  await finish(page);
  await expect(page.getByTestId(testIds.appToast)).toContainText('categorías');
  await fillPlayer(page, 0, [0, 0, 0, 0, 0, 0]);
  await fillPlayer(page, 1, [0, 0, 0, 0, 0, 0]);
  await page.getByTestId('wingspan-unused-food').nth(0).fill('2');
  await page.getByTestId('wingspan-unused-food').nth(0).press('Tab');
  await page.getByTestId('wingspan-unused-food').nth(1).fill('3');
  await page.getByTestId('wingspan-unused-food').nth(1).press('Tab');
  await finish(page);
  const data = await readGameData(page);
  expect(data.sessions[0].winnerPlayerIds).toEqual([data.players[1].id]);
  await page.getByRole('button', { name: 'Apps', exact: true }).click();
  await page.getByTestId(testIds.navStats).last().click();
  await expect(page.getByTestId('wingspan-reports')).toContainText('Puntos de aves');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('Wingspan category edits retain unsaved values after a storage failure', async ({ page }) => {
  await setup(page);
  await start(page);
  await page.evaluate(() => { Storage.prototype.setItem = () => { throw new Error('QuotaExceededError'); }; });
  await page.getByTestId('wingspan-category').first().fill('25');
  await page.getByTestId('wingspan-category').first().press('Tab');
  await expect(page.getByTestId(testIds.appToast)).toContainText('QuotaExceeded');
  await expect(page.getByTestId('wingspan-category').first()).toHaveValue('25');
  const data = await readGameData(page);
  expect(data.sessions[0].scorecard.players[data.players[0].id].categories.birds).toBeNull();
});
