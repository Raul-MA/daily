import { test, expect } from '@playwright/test';

const baseline = Boolean(process.env.DAILY_BASELINE_URL);
test('WhatsApp retains its original composer appearance and local reminder controls on phones', async ({ page }) => {
  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 844 });
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto(baseline ? './' : './#/whatsapp');
    await page.locator('#recipient').fill('Family & friends');
    await page.locator('#message').fill('Café 👋\nSee you soon!');
    await expect(page.locator('#create')).toBeEnabled();
    await expect(page.locator('#date')).not.toHaveValue('');
    await expect(page.locator('#time')).not.toHaveValue('');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    if (width === 390) await page.locator(baseline ? 'main' : '.whatsapp-composer').screenshot({ animations: 'disabled', path: `reports/whatsapp-${baseline ? 'source' : 'native'}-phone.png` });
    await page.emulateMedia({ colorScheme: 'dark' });
    const colors = await page.locator(baseline ? 'body' : '[data-module="whatsapp"]').evaluate(node => getComputedStyle(node).color);
    expect(colors).toBe('rgb(238, 238, 231)');
  }
});
