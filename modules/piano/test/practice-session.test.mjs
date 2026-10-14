import { loadModule } from '../../../tests/support/load-module.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
const { allocateSessionSeconds } = await loadModule('piano', 'js/components/practice-session.js');
test('ten-minute sessions reserve time for explanation, recall, application, and review', () => {
    assert.deepEqual(allocateSessionSeconds(10), [60, 180, 300, 60]);
});
test('every supported session duration preserves the budget and includes all four blocks', () => {
    for (let minutes = 3; minutes <= 120; minutes++) {
        const blocks = allocateSessionSeconds(minutes);
        assert.equal(blocks.length, 4);
        assert.equal(blocks.reduce((sum, duration) => sum + duration, 0), minutes * 60);
        assert.ok(blocks.every(duration => Number.isInteger(duration) && duration > 0));
        assert.ok(blocks[2] > blocks[1], 'application receives more time than recall');
        assert.equal(blocks[0], blocks[3], 'explanation and recap receive equal time');
    }
});
test('invalid or unsupported durations cannot produce an unusable session', () => {
    for (const duration of [0, 2, 121, -10, 3.5, NaN, Infinity, undefined, null, '', 'ten']) {
        assert.throws(() => allocateSessionSeconds(duration), RangeError);
    }
});
