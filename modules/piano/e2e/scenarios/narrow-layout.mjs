import assert from 'node:assert/strict';
import { page, screenshot, route, action, startRecall } from './core.mjs';
await page.setViewportSize({ width: 360, height: 640 });
await route('/', '.course-lessons');
const start = page.locator('.course-lessons .btn-primary');
const startBounds = await start.boundingBox();
assert.ok(startBounds && startBounds.y >= 0 && startBounds.y + startBounds.height <= 640, 'first lesson CTA fits on the initial mobile screen');
await screenshot('mobile-course');
await start.click();
await page.locator('.practice-setup').waitFor();
await startRecall();
await action('reveal').click();
await page.locator('[data-disclosure="review"] summary').click();
await screenshot('mobile-recall');
const layout = await page.evaluate(() => ({
    viewport: window.innerWidth,
    documentWidth: document.documentElement.scrollWidth,
    pageWidth: document.querySelector('#page-content').clientWidth,
    pageScrollWidth: document.querySelector('#page-content').scrollWidth,
}));
assert.ok(layout.documentWidth <= layout.viewport + 1, JSON.stringify(layout));
assert.ok(layout.pageScrollWidth <= layout.pageWidth + 1, JSON.stringify(layout));
await action('finish').click();
await route('/extended-chords/exercises', '.exercise-card');
await page.locator('.filter-btn').click();
await page.locator('.multi-select').selectOption('maj13');
await page.locator('.multi-select').press('Escape');
await page.locator('.random-btn').click();
await page.locator('.exercise-card').focus();
await page.keyboard.press('Enter');
const keyboardScroll = page.locator('.keyboard-scroll').first();
assert.ok(Number(await page.locator('.keyboard-diagram').first().getAttribute('data-octaves')) >= 2);
const keyboardLayout = await keyboardScroll.evaluate(node => ({
    width: node.clientWidth,
    scrollWidth: node.scrollWidth,
    pageWidth: document.querySelector('#page-content').clientWidth,
    pageScrollWidth: document.querySelector('#page-content').scrollWidth,
    documentWidth: document.documentElement.scrollWidth,
    viewport: window.innerWidth,
}));
assert.ok(keyboardLayout.scrollWidth > keyboardLayout.width, 'multiple octaves scroll inside the keyboard');
assert.ok(keyboardLayout.pageScrollWidth <= keyboardLayout.pageWidth + 1, JSON.stringify(keyboardLayout));
assert.ok(keyboardLayout.documentWidth <= keyboardLayout.viewport + 1, JSON.stringify(keyboardLayout));
await keyboardScroll.focus();
await page.keyboard.press('ArrowRight');
await page.waitForFunction(() => document.querySelector('.keyboard-scroll').scrollLeft > 0);
assert.ok(await keyboardScroll.evaluate(node => node.scrollLeft > 0), 'keyboard scrolling works with keyboard input');
await keyboardScroll.evaluate(node => { node.scrollLeft = 0; });
await screenshot('mobile-extended-chord');
