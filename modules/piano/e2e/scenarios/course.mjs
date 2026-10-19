import { hashFor, hrefFor } from '../paths.mjs';
import assert from 'node:assert/strict';
import { page, LESSONS, screenshot, route } from './core.mjs';
await route('/', '.course-lessons');
assert.equal(await page.locator('.course-lesson').count(), LESSONS.length);
assert.equal(await page.locator(`.nav-link.active[href="${hrefFor('/')}"]`).count(), 1);
assert.equal(await page.locator('.course-lessons .btn-primary').count(), 1);
for (const lesson of LESSONS) {
    assert.equal(await page.locator(`.course-lesson-title a[href="${hrefFor(`/learn?lesson=${lesson.id}`)}"]`).count(), 1);
}
await screenshot('desktop-course');
await page.locator(`.course-lessons a[href="${hrefFor(`/learn?lesson=${LESSONS[4].id}`)}"]`).click();
await page.locator('.practice-setup').waitFor();
assert.equal(await page.locator('.practice-page h1').textContent(), LESSONS[4].title);
assert.equal(await page.locator('#practice-lesson').count(), 0);
assert.equal(await page.locator(`.nav-link.active[href="${hrefFor('/')}"]`).count(), 1);
await page.locator('.search-input').fill(LESSONS[0].title);
await page.locator(`.search-result-item[href="${hrefFor(`/learn?lesson=${LESSONS[0].id}`)}"]`).waitFor();
await page.locator('.search-input').press('ArrowDown');
await page.locator('.search-input').press('Enter');
await page.waitForFunction(title => document.querySelector('.practice-page h1')?.textContent === title, LESSONS[0].title);
assert.equal(await page.locator('.practice-page h1').evaluate(node => node === document.activeElement), true);
await page.locator('.search-input').fill('intervals');
await page.locator('.search-input').press('Shift+Tab');
await page.locator('.search-results.open').waitFor({ state: 'hidden' });
await page.locator('.search-input').fill('intervals');
await page.locator(`.search-result-item[href="${hrefFor('/intervals/theory')}"]`).click();
await page.waitForFunction(hash => location.hash === hash && document.activeElement?.tagName === 'H1', hashFor('/intervals/theory'));
