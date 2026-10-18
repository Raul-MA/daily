import { test, expect } from '@playwright/test';
import { openApp, seedScoreGame, startScoreSession, testIds } from './helpers.js';
import { readGameData } from './shared-data.js';

test.use({ serviceWorkers: 'allow' });

test('game setup scores history and statistics work after an offline reload', async ({ page, context }, testInfo) => {
  await openApp(page);
  await seedScoreGame(page);
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller) await new Promise(resolve => navigator.serviceWorker.addEventListener('controllerchange', resolve, { once: true }));
  });
  await context.setOffline(true);
  await page.reload();
  await startScoreSession(page);
  await page.getByTestId(testIds.scoreInput).first().fill('3+5');
  await page.getByTestId(testIds.scoreInput).first().blur();
  await expect(page.getByTestId(testIds.sessionTotal).first()).toContainText('8');
  const active = await readGameData(page);
  await page.reload();
  await expect(page.getByTestId(testIds.activeSession)).toBeVisible();
  expect((await readGameData(page)).sessions[0]).toEqual(active.sessions[0]);
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await expect(page.locator('[data-module=games]')).toHaveCSS('background-color', 'rgb(248, 247, 243)');
  await page.screenshot({ path: testInfo.outputPath('games-phone.png'), fullPage: true });
  page.once('dialog', dialog => dialog.accept());
  await page.getByTestId(testIds.finishSession).click();
  await expect(page.getByTestId(testIds.historyItem)).toHaveCount(1);
  await page.getByRole('button', { name: 'Apps', exact: true }).click();
  await page.getByTestId(testIds.navStats).last().click();
  await expect(page.getByTestId(testIds.statsView)).toContainText('Ada');
  await page.getByRole('link', { name: 'Home', exact: true }).click();
  expect(await page.locator('html').evaluate(node => getComputedStyle(node).backgroundColor)).toBe('rgb(242, 242, 247)');
});
