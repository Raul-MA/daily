import { test, expect } from '@playwright/test';

test.use({ serviceWorkers: 'allow' });

async function ready(page) {
  await page.goto('/daily/#/');
  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller)), { timeout: 10000 }).toBe(true);
}

test('install identity and worker scope use the configured application base', async ({ page }) => {
  await page.goto('/daily/#/');
  const manifestPath = await page.locator('link[rel="manifest"]').getAttribute('href');
  const response = await page.request.get(manifestPath);
  const manifest = await response.json();
  expect(manifest.id).toBe('/daily/');
  expect(manifest.start_url).toBe('/daily/#/');
  expect(manifest.scope).toBe('/daily/');
  expect(manifest.icons.length).toBeGreaterThan(0);
  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller)), { timeout: 10000 }).toBe(true);
  const scope = await page.evaluate(async () => (await navigator.serviceWorker.ready).scope);
  expect(new URL(scope).pathname).toBe('/daily/');
  const touch = page.locator('link[rel="apple-touch-icon"]');
  await expect(touch).toHaveAttribute('href', '/daily/apple-touch-icon.png');
  const pngs = manifest.icons.filter(icon => icon.type === 'image/png');
  expect(pngs.some(icon => icon.sizes === '192x192')).toBe(true);
  expect(pngs.some(icon => icon.sizes === '512x512' && icon.purpose === 'maskable')).toBe(true);
  await page.context().setOffline(true);
  for (const source of [...new Set(pngs.map(icon => icon.src)), await touch.getAttribute('href')]) {
    const pixels = await page.evaluate(async src => {
      const image = new Image();
      image.src = src;
      await image.decode();
      const canvas = document.createElement('canvas');
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const drawing = canvas.getContext('2d');
      drawing.drawImage(image, 0, 0);
      return { width: canvas.width, height: canvas.height, alpha: [...drawing.getImageData(0, 0, canvas.width, canvas.height).data].filter((value, index) => index % 4 === 3).every(value => value === 255) };
    }, source);
    expect([180, 192, 512]).toContain(pixels.width);
    expect(pixels.height).toBe(pixels.width);
    expect(pixels.alpha).toBe(true);
  }
});

test('home settings and connection checks reopen offline without losing saved settings', async ({ page, context }) => {
  page.on('pageerror', error => console.error('Offline page error:', error.message));
  page.on('requestfailed', request => console.error('Offline request failed:', request.url(), request.failure()));
  await ready(page);
  await page.getByRole('button', { name: 'Español', exact: true }).click();
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Hoy', exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'Ajustes de Daily', exact: true }).click();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Ajustes', exact: true })).toBeVisible();
  await page.goto('/daily/diagnostics.html');
  await expect(page.locator('form')).toBeVisible();
});

test('offline cache contains generated assets and excludes API responses and credentials', async ({ page }) => {
  await ready(page);
  const entries = await page.evaluate(async () => {
    const keys = (await caches.keys()).filter(key => key.startsWith('daily-pwa-'));
    return Promise.all(keys.map(async key => (await (await caches.open(key)).keys()).map(request => request.url)));
  });
  const urls = entries.flat();
  expect(urls.some(url => /\/apps\/daily\/src\/main\.js$/.test(url))).toBe(true);
  for (const file of ['icon-192.png', 'icon-512.png', 'apple-touch-icon.png']) expect(urls.some(url => url.endsWith(`/daily/${file}`))).toBe(true);
  expect(urls.every(url => new URL(url).pathname.startsWith('/daily/'))).toBe(true);
  expect(urls.some(url => /readwise|Token|token=/.test(url))).toBe(false);
});
