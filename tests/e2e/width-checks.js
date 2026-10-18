import { expect } from '@playwright/test';

export async function auditPageWidth(page, route) {
  const measurements = await page.evaluate(() => {
    const pairs = [];
    const add = (selector, container) => {
      const parent = document.querySelector(container);
      if (!parent) return;
      const style = getComputedStyle(parent);
      const box = parent.getBoundingClientRect();
      const left = parseFloat(style.paddingLeft) + parseFloat(style.borderLeftWidth);
      const right = parseFloat(style.paddingRight) + parseFloat(style.borderRightWidth);
      for (const node of document.querySelectorAll(selector)) {
        if (!node.getClientRects().length || getComputedStyle(node).display === 'none') continue;
        const rect = node.getBoundingClientRect();
        pairs.push({ selector, className: node.className, actual: { x: rect.x, width: rect.width }, expected: { x: box.x + left, width: box.width - left - right } });
      }
    };
    add('.daily-shell', 'body');
    add('.shell-main', '.daily-shell');
    add('.shell-main > [data-module]', '.shell-main');
    add('.settings-view, #dashboard', '.shell-main');
    add('.module-placeholder', '.shell-main');
    add('[data-module="plants"] > :is(.plant-page-title, .plant-list-view, .plant-form, .detail-view, .plant-settings-view)', '[data-module="plants"]');
    add('[data-module="coffee"] > .app-shell', '[data-module="coffee"]');
    add('[data-module="games"] .workspace', '[data-module="games"] > .app-shell');
    add('[data-module="time-budget"] > :is(.app-shell, .time-countdowns, .time-backup)', '[data-module="time-budget"]');
    add('[data-module="time-budget"] .setup-grid', '#setupScreen');
    add('[data-module="piano"] #page-content > :is(header, section, article, div, main, form)', '#page-content');
    add('[data-module="piano"] :is(.theory-content, .exercise-card)', '[data-module="piano"] .card-area');
    add('[data-module="reading"] > .reader-shell', '[data-module="reading"]');
    add('[data-module="whatsapp"] > .whatsapp-composer', '[data-module="whatsapp"]');
    add('body:not(:has(.daily-shell)) > main', 'body');
    const overflow = document.documentElement.scrollWidth - innerWidth;
    const offenders = overflow > 1 ? [...document.querySelectorAll('body *')].filter(node => node.getBoundingClientRect().right > innerWidth + 1).slice(0, 12).map(node => ({ tag: node.tagName, id: node.id, className: String(node.className), right: node.getBoundingClientRect().right })) : [];
    return { pairs, overflow, offenders };
  });
  const violations = measurements.pairs.filter(pair => Math.abs(pair.actual.x - pair.expected.x) > 1 || Math.abs(pair.actual.width - pair.expected.width) > 1);
  if (measurements.overflow > 1) violations.push({ overflow: measurements.overflow, offenders: measurements.offenders });
  return { ...measurements, route, violations };
}

export async function contentReady(page, route) {
  const content = page.locator('.shell-main');
  await expect(content).toBeVisible();
  if (route.page.startsWith('piano')) {
    await expect(page.locator('#page-content h1')).toBeVisible();
    await expect(page.locator('[data-piano-loading]')).toHaveCount(0);
    if (route.url.includes('?lesson=')) await expect(page.locator('#page-content > .practice-page')).toBeVisible();
  }
  if (route.page === 'reader') await page.getByRole('button', { name: 'Close settings', exact: true }).click();
  await expect(page.locator('.storage-failure')).toHaveCount(0);
}
