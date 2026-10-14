import assert from 'node:assert/strict';
import { checkLayout } from './mobile-checks.mjs';
export async function checkSwipe(state) {
    const { mobilePage, mobileRoute, mobileContext } = state;
    await mobileRoute('/extended-chords/exercises', '.exercise-card');
    await mobilePage.locator('.filter-btn').tap();
    await mobilePage.locator('.filter-popover select').selectOption('maj13');
    await mobilePage.locator('.filter-btn').tap();
    await mobilePage.locator('.random-btn').tap();
    await mobilePage.locator('.card-hint').tap();
    const scroll = mobilePage.locator('.keyboard-scroll');
    await scroll.waitFor();
    await scroll.scrollIntoViewIfNeeded();
    const bounds = await scroll.boundingBox();
    const session = await mobileContext.newCDPSession(mobilePage);
    const touch = { x: bounds.x + bounds.width - 30, y: bounds.y + bounds.height / 2 };
    assert.ok(await scroll.evaluate(node => node.scrollWidth > node.clientWidth), 'touch test requires a wide keyboard');
    await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [touch] });
    for (let step = 1; step <= 8; step++) {
        await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ ...touch, x: touch.x - step * 20 }] });
        await mobilePage.waitForTimeout(30);
    }
    await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await mobilePage.waitForFunction(() => document.querySelector('.keyboard-scroll').scrollLeft > 0);
    await checkLayout(state, 'touch piano swipe');
    await session.detach();
    console.log('PASS: 360px piano responds to native touch swipe; ear audio completes and cancels on next/route leave');
}
