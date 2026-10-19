import { test, expect } from '@playwright/test';
import { writeFileSync } from 'node:fs';
import { widthFixture } from './width-fixture.js';
import { widthRoutes } from './width-routes.js';
import { auditPageWidth, contentReady } from './width-checks.js';

async function visit(page, route, root) {
  await page.evaluate(({ root, url }) => {
    localStorage.setItem('daily:v1', JSON.stringify(root));
    history.replaceState(null, '', url);
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  }, { root, url: route.url });
  await contentReady(page, route);
  await expect(page).toHaveURL(new URL(route.redirect ?? route.url, page.url()).href);
}

test('every registered screen and Piano destination fills its available container', async ({ page }, testInfo) => {
  test.setTimeout(180000);
  const fixture = await widthFixture();
  const routes = widthRoutes(fixture.active);
  await page.route('https://readwise.io/api/**', request => request.abort());
  const results = [];
  for (const width of [1600, 900, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/daily/#/');
    for (const route of routes) {
      await visit(page, route, route.url.includes('?lesson=') ? fixture.lesson : fixture.active);
      results.push({ width, ...route, ...(await auditPageWidth(page, route.url)) });
      if (['plants', 'plantSettings', 'settings', 'reader', 'whatsapp', 'piano'].includes(route.page) && [1600, 390].includes(width)) {
        await page.screenshot({ path: testInfo.outputPath(`${route.page}-${width}.png`), fullPage: true });
      }
    }
    for (const [mode, app] of [['setup', 'time'], ['tools', 'coffee']]) {
      const route = { page: app, url: `/daily/#/${app}` };
      await visit(page, route, fixture[mode]);
      results.push({ width, mode, ...route, ...(await auditPageWidth(page, route.url)) });
    }
    await page.goto('/daily/diagnostics.html');
    results.push({ width, url: '/daily/diagnostics.html', ...(await auditPageWidth(page, '/daily/diagnostics.html')) });
  }
  writeFileSync('reports/full-width-route-audit.json', JSON.stringify({ routes: routes.length, widths: [1600, 900, 390, 320], checks: results.length, results }, null, 2));
  expect(results.flatMap(result => result.violations.map(violation => ({ width: result.width, route: result.url, ...violation })))).toEqual([]);
});
