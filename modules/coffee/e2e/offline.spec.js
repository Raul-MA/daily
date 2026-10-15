import { test, expect } from '@playwright/test';
import { gotoApp, testIds, readCoffeeData } from './helpers.js';

test.use({ serviceWorkers: 'allow' });

test('coffee forms history insights and beans remain available offline', async ({ page, context }, testInfo) => {
  await gotoApp(page);
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller) await new Promise(resolve => navigator.serviceWorker.addEventListener('controllerchange', resolve, { once: true }));
  });
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByTestId(testIds.entryForm)).toBeVisible();
  await page.getByTestId(testIds.navHistory).click();
  await expect(page.getByTestId(testIds.entryList)).toBeVisible();
  await page.getByTestId(testIds.navInsights).click();
  await expect(page.getByTestId(testIds.insightGrid)).toBeVisible();
  await page.getByTestId(testIds.navSettings).click();
  await page.locator('#beanBrand').fill('Offline ☕');
  await page.locator('#beanBlend').fill('Casa');
  await page.getByTestId(testIds.saveBean).click();
  await expect(page.getByTestId(testIds.beanList)).toContainText('Offline ☕');
  expect((await readCoffeeData(page)).beanPresets).toHaveLength(2);
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(await page.locator('#coffee-tabs span').evaluateAll(labels => labels.every(label => {
    const range = document.createRange();
    range.selectNodeContents(label);
    return range.getClientRects().length === 1;
  }))).toBe(true);
  await expect(page.locator('[data-module=coffee]')).toHaveCSS('background-color', 'rgb(240, 239, 234)');
  await page.screenshot({ path: testInfo.outputPath('coffee-phone.png'), fullPage: true });
  await page.getByRole('button', { name: 'Español', exact: true }).click();
  await page.setViewportSize({ width: 320, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await expect(page.locator('#coffee-tabs')).toContainText('Estadísticas');
});
