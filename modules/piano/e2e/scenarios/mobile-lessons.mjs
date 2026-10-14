import assert from 'node:assert/strict';
import { LESSONS } from './core.mjs';
import { checkLayout, checkPianos } from './mobile-checks.mjs';
export async function checkLessons(state) {
    const { mobilePage, mobileRoute, width } = state;
    for (const lesson of LESSONS) {
        console.log(`Touch ${width}px lesson: ${lesson.id}`);
        for (const piano of [true, false]) {
            await mobileRoute(`/learn?lesson=${lesson.id}`, '.practice-setup');
            await mobilePage.locator('[name="piano"]').setChecked(piano);
            await mobilePage.locator('.practice-setup button[type="submit"]').tap();
            await mobilePage.locator('[data-action="next"]').tap();
            assert.equal(await mobilePage.locator('.keyboard-diagram').count(), 0);
            await mobilePage.locator('[data-action="reveal"]').tap();
            await mobilePage.locator('.keyboard-diagram').first().waitFor();
            await checkPianos(state, `${lesson.id} recall`);
            await checkLayout(state, `${lesson.id} recall`);
            await mobilePage.locator('[data-disclosure="review"] summary').tap();
            await checkLayout(state, `${lesson.id} review`);
            await mobilePage.locator('[data-action="next"]').tap();
            await mobilePage.locator('[data-action="reveal"]').tap();
            await mobilePage.locator('.keyboard-diagram').first().waitFor();
            await checkPianos(state, `${lesson.id} apply`);
            await checkLayout(state, `${lesson.id} apply`);
            await mobilePage.locator('[data-action="next"]').tap();
            assert.ok(await mobilePage.locator('.practice-self-checks li').count() > 0);
            await mobilePage.locator('[data-action="finish"]').tap();
            assert.match(await mobilePage.locator('.practice-page').textContent(), /Session finished/);
            await checkLayout(state, `${lesson.id} recap`);
        }
    }
}
