import assert from 'node:assert/strict';
import { page, LIBRARY_GROUPS, screenshot, route } from './core.mjs';
await route('/library', '.library-grid');
assert.equal(await page.locator('.nav-link.active[href="#/library"]').count(), 1);
export const libraryPaths = [...new Set(LIBRARY_GROUPS.flatMap(group => group.topics.flatMap(topic => topic.links.map(link => link.path))))];
for (const path of libraryPaths)
    assert.ok(await page.locator(`.library-grid a[href="#${path}"]`).count() > 0);
await screenshot('desktop-library');
for (const path of libraryPaths) {
    console.log(`Checking library route: ${path}`);
    await route(path, '#page-content h1');
    await page.waitForFunction(() => !document.querySelector('#page-content')?.textContent.includes('Loading…'));
    assert.ok((await page.locator('#page-content').textContent()).trim().length > 50, path);
    assert.equal(await page.locator('.nav-link.active[href="#/library"]').count(), 1, path);
    if (path.endsWith('/exercises')) {
        const isFlashcard = await page.locator('.exercise-card').count() > 0;
        if (isFlashcard) {
            assert.equal(await page.locator('.keyboard-diagram').count(), 0, `${path}: answer stays hidden`);
            await page.locator('.exercise-card').focus();
            await page.keyboard.press('Enter');
        }
        const keyboards = page.locator('.keyboard-diagram');
        assert.ok(await keyboards.count() > 0, `${path}: revealed answer includes a piano`);
        for (const keyboard of await keyboards.all()) {
            assert.ok(await keyboard.locator('.keyboard-key.is-selected').count() > 0, `${path}: highlighted notes`);
            assert.match(await keyboard.locator('figcaption').textContent(), /Octave numbers mark exact keys/, `${path}: exact octave notation`);
        }
        const ranges = await keyboards.evaluateAll(figures => figures.map(figure => ({
            whiteKeys: [...figure.querySelectorAll('.keyboard-key:not(.is-black)')].map(key => Number(key.dataset.midi)),
            lowest: Math.min(...[...figure.querySelectorAll('.keyboard-key.is-selected')].map(key => Number(key.dataset.midi))),
        })));
        for (const range of ranges) {
            const startsBefore = lowest => range.whiteKeys[0] < lowest && range.whiteKeys[1] >= lowest;
            assert.ok(startsBefore(range.lowest), `${path}: keyboard starts one white key before its notes`);
        }
        if (path === '/chord-inversions/exercises')
            await screenshot('desktop-inversion');
        if (path === '/extended-chords/exercises')
            await screenshot('desktop-extended-chord');
        if (isFlashcard) {
            await page.locator('.random-btn').click();
            assert.equal(await page.locator('.keyboard-diagram').count(), 0, `${path}: next prompt hides keyboard`);
        }
        else {
            await page.locator('#generate-btn').click();
            assert.ok(await keyboards.count() > 0, `${path}: generated progression retains keyboards`);
        }
    }
}
console.log(`PASS: ${libraryPaths.length} library routes, every exercise reveals exact-octave keyboards and hides them on next prompt`);
