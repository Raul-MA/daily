import assert from 'node:assert/strict';
import { page, context, browser, errors } from './scenarios/core.mjs';
try {
    await import('./scenarios/renderer.mjs');
    await import('./scenarios/course.mjs');
    await import('./scenarios/guided-lessons.mjs');
    await import('./scenarios/duration.mjs');
    await import('./scenarios/pacing.mjs');
    await import('./scenarios/library.mjs');
    await import('./scenarios/narrow-layout.mjs');
    await import('./scenarios/mobile.mjs');
    assert.deepEqual(errors, [], 'browser must have no uncaught errors or console errors');
}
catch (error) {
    console.error('Browser state at failure:', await page.evaluate(() => ({ hash: location.hash, focused: document.activeElement?.tagName, heading: document.querySelector('#page-content h1')?.textContent })));
    throw error;
}
finally {
    await context.close();
    await browser.close();
}
