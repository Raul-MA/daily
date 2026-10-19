import { hashFor } from '../paths.mjs';
import { loadModule } from '../../../../tests/support/load-module.mjs';
import { mkdir } from 'node:fs/promises';
export const { LESSONS } = await loadModule('piano', 'js/music/learning-path.js');
export const { LIBRARY_GROUPS } = await loadModule('piano', 'js/components/navigation-data.js');
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
export const browser = process.env.PLAYWRIGHT_CDP_URL
    ? await chromium.connectOverCDP(process.env.PLAYWRIGHT_CDP_URL)
    : await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_EXECUTABLE_PATH ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH } : {}) });
export const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, serviceWorkers: 'block' });
export const page = await context.newPage();
export const errors = [];
page.on('pageerror', error => errors.push(error.message));
page.on('console', message => { if (message.type() === 'error')
    errors.push(message.text()); });
export const baseURL = process.env.TONIQ_URL || 'http://127.0.0.1:8766/daily';
export const screenshotDirectory = process.env.TONIQ_SCREENSHOTS;
if (screenshotDirectory)
    await mkdir(screenshotDirectory, { recursive: true });
export const screenshot = async (name) => {
    if (screenshotDirectory) {
        await page.locator('#page-content').evaluate(node => { node.scrollTop = 0; });
        await page.screenshot({ path: `${screenshotDirectory}/${name}.png`, fullPage: true, animations: 'disabled' });
        if (/inversion|extended-chord/.test(name)) {
            const expanded = await page.addStyleTag({ content: '#app-shell, #main-wrapper { height:auto; overflow:visible } #page-content { overflow:visible; flex:none }' });
            await page.screenshot({ path: `${screenshotDirectory}/${name}-full.png`, fullPage: true, animations: 'disabled' });
            await expanded.evaluate(node => node.remove());
        }
    }
};
export const action = name => page.locator(`[data-action="${name}"]`);
export const countIntervals = () => page.evaluate(() => window.__practiceTestIntervals.size);
export async function route(path, ready) {
    if (new URL(page.url()).hash === hashFor(path)) {
        await route(path === '/library' ? '/' : '/library', path === '/library' ? '.course-lessons' : '.library-grid');
    }
    const expectedPath = path === '/pentatonic/theory' ? '/scales/theory' : path;
    await page.evaluate(hash => { window.location.hash = hash; }, hashFor(path));
    await page.waitForFunction(hash => {
        const container = document.querySelector('#page-content');
        return location.hash === hash && container && !container.querySelector('[data-piano-loading]') && !/Loading…|Redirecting…/.test(container.textContent);
    }, hashFor(expectedPath));
    await page.locator(ready).waitFor();
}
export async function startRecall() {
    await page.locator('.practice-setup button[type="submit"]').click();
    await action('next').click();
    await page.locator('.practice-question').waitFor();
}
page.setDefaultTimeout(5000);
