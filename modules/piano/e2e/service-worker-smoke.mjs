import { baseline, hashFor } from './paths.mjs';
import assert from 'node:assert/strict';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_EXECUTABLE_PATH ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH } : {}) });
const context = await browser.newContext({ serviceWorkers: 'allow' });
const baseURL = process.env.TONIQ_URL || 'http://127.0.0.1:8766/daily/';
const page = await context.newPage();
page.setDefaultTimeout(15000);
try {
    await page.goto(`${baseURL.replace(/\/$/, '')}/${hashFor('/')}`);
    await page.locator('.course-lessons').waitFor();
    await page.waitForFunction(() => navigator.serviceWorker.controller?.state === 'activated');
    const cacheName = await page.evaluate(async prefix => {
        const names = await caches.keys();
        return names.find(name => name.startsWith(prefix));
    }, baseline ? 'toniq-' : 'daily-pwa-');
    assert.ok(cacheName, 'installation populated the app cache');
    assert.equal(await page.evaluate(async () => Boolean(await caches.match(location.href))), true, 'the document is precached before going offline');
    await context.setOffline(true);
    await page.reload();
    await page.locator('.course-lessons').waitFor();
    await page.locator('.course-lesson-title a').first().click();
    await page.locator('.practice-setup button[type="submit"]').click();
    await page.locator('[data-action="next"]').click();
    await page.locator('[data-action="reveal"]').click();
    await page.locator('.keyboard-key.is-selected').first().waitFor();
    assert.equal(await page.locator('.practice-answer').count(), 1);
    console.log(`Service worker activated (${cacheName}); offline reload and guided reveal passed`);
}
finally {
    await context.close();
    await browser.close();
}
