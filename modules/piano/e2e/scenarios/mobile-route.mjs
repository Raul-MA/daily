import assert from 'node:assert/strict';
import { screenshotDirectory } from './core.mjs';
import { checkLayout, checkPianos } from './mobile-checks.mjs';
import { checkAudio } from './mobile-audio.mjs';
import { checkFilters } from './mobile-filters.mjs';
export async function checkRoute(state, path) {
    const { mobilePage, mobileRoute, width } = state;
    console.log(`Touch ${width}px: ${path}`);
    await mobileRoute(path, '#page-content h1');
    await checkLayout(state, path);
    if (!path.endsWith('/exercises'))
        return;
    const card = mobilePage.locator('.exercise-card');
    if (await card.count()) {
        if (path === '/ear-training/exercises' && width === 360)
            await checkAudio(state, path);
        if (await mobilePage.locator('.filter-btn').count())
            await checkFilters(state, path);
        await card.locator('.card-hint').tap();
        await mobilePage.locator('.keyboard-diagram').first().waitFor();
        await checkPianos(state, path);
        await checkLayout(state, `${path} revealed`);
        await captureKeyboard(mobilePage, width, path);
        await mobilePage.locator('.random-btn').tap();
        await mobilePage.locator('.keyboard-diagram').first().waitFor({ state: 'hidden' });
        assert.equal(await mobilePage.locator('.keyboard-diagram').count(), 0);
        await card.locator('.card-hint').tap();
        await mobilePage.locator('.keyboard-diagram').first().waitFor();
        await checkPianos(state, `${path} filtered next`);
        await checkLayout(state, `${path} filtered next`);
    }
    else {
        await mobilePage.locator('#generate-btn').tap();
        await checkPianos(state, path);
        await checkLayout(state, `${path} generated`);
    }
}
async function captureKeyboard(mobilePage, width, path) {
    if (screenshotDirectory && width === 360 && /chord-inversions|extended-chords|rootless-voicings/.test(path)) {
        await mobilePage.screenshot({ path: `${screenshotDirectory}/touch-${path.split('/')[1]}.png`, fullPage: true, animations: 'disabled' });
    }
}
