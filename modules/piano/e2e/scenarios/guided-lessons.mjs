import assert from 'node:assert/strict';
import { page, LESSONS, route, action, startRecall, countIntervals } from './core.mjs';
for (let index = 0; index < LESSONS.length; index++) {
    for (const piano of [true, false]) {
        await route(`/learn?lesson=${LESSONS[index].id}`, '.practice-setup');
        await page.waitForFunction(title => document.querySelector('.practice-page h1')?.textContent === title, LESSONS[index].title);
        await page.locator('[name="piano"]').setChecked(piano);
        await page.locator('[data-minutes="5"]').click();
        await startRecall();
        assert.match(await page.locator('.practice-session-heading').textContent(), piano ? /At the piano/ : /Away from the piano/);
        assert.equal(await page.locator('.practice-answer').count(), 0);
        assert.equal(await page.locator('.keyboard-diagram').count(), 0);
        await action('reveal').click();
        assert.equal(await action('reveal').count(), 0);
        assert.equal(await page.locator('.practice-answer').evaluate(node => node === document.activeElement), true);
        assert.ok((await page.locator('.practice-answer').textContent()).trim().length > 0);
        assert.equal(await page.locator('.keyboard-diagram').count(), 1);
        await action('prompt').click();
        assert.equal(await page.locator('.practice-answer').count(), 0);
        await action('next').click();
        await action('reveal').click();
        assert.ok((await page.locator('.practice-answer').textContent()).trim().length > 0);
        if (await action('prompt').count()) {
            const before = await page.locator('.practice-card .label').textContent();
            await action('prompt').click();
            assert.notEqual(await page.locator('.practice-card .label').textContent(), before);
            assert.equal(await page.locator('.practice-answer').count(), 0);
        }
        else {
            assert.equal(await page.locator('.practice-pacing').count(), 0);
        }
        await action('next').click();
        assert.ok(await page.locator('.practice-self-checks li').count() > 0);
        await action('finish').click();
        assert.match(await page.locator('.practice-page').textContent(), /Session finished/);
        assert.equal(await countIntervals(), 0);
        if (index === 0 && piano) {
            await action('repeat').click();
            await action('finish').click();
            await action('next-lesson').click();
            await page.waitForFunction(title => document.querySelector('.practice-page h1')?.textContent === title, LESSONS[1].title);
            assert.equal(new URL(page.url()).hash, `#/learn?lesson=${LESSONS[1].id}`);
        }
    }
}
console.log('PASS: all ten lessons in piano and away modes, reveal, sequence, recap, repeat, next lesson');
