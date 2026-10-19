import { test, expect } from '@playwright/test';

test('the focused desktop skip link is above the fixed sidebar and activates main content', async ({ page }) => {
  await page.goto('./#/'); await page.locator('.skip-link').focus();
  expect(await page.locator('.skip-link').evaluate(node => {
    const box = node.getBoundingClientRect();
    return node.contains(document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2));
  })).toBe(true);
  await page.keyboard.press('Enter'); await expect(page.locator('#content')).toBeFocused();
});

test('storage recovery releases an open phone drawer so all recovery controls can scroll into view', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 500 }); await page.goto('./#/plants');
  await page.getByRole('button', { name: 'Apps', exact: true }).click();
  await page.evaluate(() => { localStorage.setItem('daily:v1', '{broken'); window.dispatchEvent(new StorageEvent('storage', { key: 'daily:v1' })); });
  await expect(page.getByRole('heading', { name: 'Local data needs attention', exact: true })).toBeVisible();
  expect(await page.locator('body').evaluate(node => getComputedStyle(node).overflowY)).not.toBe('hidden');
  expect(await page.locator('[data-menu-open="true"]').count()).toBe(0);
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight)); expect(await page.evaluate(() => scrollY)).toBeGreaterThan(0);
});

test('same-route sidebar links preserve modified and nonprimary browser clicks', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 }); await page.goto('./#/plants');
  await page.getByRole('button', { name: 'Apps', exact: true }).click();
  const outcomes = await page.locator('.shell-sidebar [data-app-switcher] a[href$="#/plants"]').evaluate(link => {
    const clicks = [{ ctrlKey: true }, { metaKey: true }, { shiftKey: true }, { altKey: true }, { button: 1 }, {}];
    return clicks.map(options => {
      let prevented;
      document.addEventListener('click', event => { prevented = event.defaultPrevented; event.preventDefault(); }, { once: true });
      link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, ...options }));
      return { prevented, open: document.querySelector('[data-menu-open="true"]') !== null };
    });
  });
  expect(outcomes.slice(0, 5)).toEqual(Array.from({ length: 5 }, () => ({ prevented: false, open: true })));
  expect(outcomes[5]).toEqual({ prevented: true, open: false });
});
