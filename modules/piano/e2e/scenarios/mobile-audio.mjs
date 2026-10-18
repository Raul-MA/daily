import { hrefFor, baseline } from '../paths.mjs';
import assert from 'node:assert/strict';
export async function checkAudio(state, path) {
    const { mobilePage, mobileRoute } = state;
    await mobilePage.evaluate(() => {
        const NativeAudio = window.Audio;
        window.__testAudio = [];
        window.Audio = function (...args) {
            const audio = new NativeAudio(...args);
            window.__testAudio.push(audio);
            return audio;
        };
    });
    await mobilePage.locator('.play-btn').tap();
    await mobilePage.waitForFunction(() => document.querySelector('.ear-training-status')?.textContent === 'What interval was that?');
    await mobilePage.locator('.play-btn').tap();
    await mobilePage.locator('.random-btn').tap();
    const expectedStatus = await mobilePage.locator('.ear-training-status').textContent();
    await mobilePage.waitForTimeout(3500);
    assert.equal(await mobilePage.locator('.ear-training-status').textContent(), expectedStatus, 'next prompt cancels previous audio state updates');
    await mobilePage.locator('.play-btn').tap();
    if (!baseline) await mobilePage.getByRole('button', { name: 'Apps', exact: true }).tap();
    await mobilePage.locator(`.nav-link[href="${hrefFor('/library')}"]`).tap();
    await mobilePage.locator('.library-grid').waitFor();
    assert.equal(await mobilePage.evaluate(() => window.__testAudio.every(audio => audio.paused)), true, 'leaving ear training stops audio');
    await mobileRoute(path, '.exercise-card');
}
