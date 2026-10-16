import { hashFor, sourcePrefix } from '../paths.mjs';
import { page, baseURL } from './core.mjs';
await page.route('**/favicon.ico', route => route.fulfill({ status: 204 }));
await page.goto(`${baseURL}/${hashFor('/learn')}`);
await page.locator('.practice-setup').waitFor();
await page.evaluate(async prefix => {
    const { LESSONS } = await import(`${prefix}music/learning-path.js`);
    const { getChordTones } = await import(`${prefix}music/chords.js`);
    const { createPracticeSession } = await import(`${prefix}components/practice-session.js`);
    const lesson = LESSONS[0];
    const original = { application: lesson.application, recall: lesson.recall };
    const tones = getChordTones('C', 'maj7');
    const cases = [
        { keyboard: { root: 'C', tones: tones.slice(1) }, expected: [64, 67, 71] },
        { keyboard: { tones: [...tones.slice(1), tones[0]] }, expected: [64, 67, 71, 72] },
        { keyboard: { root: 'C', tones: [{ note: 'C', octave: 5 }, { note: 'C', octave: 4 }] }, expected: [60, 72] },
    ];
    function checkFixture(fixture, cleanup, expected) {
        try {
            fixture.querySelector('[type="submit"]').click();
            for (const block of ['recall', 'apply']) {
                fixture.querySelector('[data-action="next"]').click();
                fixture.querySelector('[data-action="reveal"]').click();
                const actual = [...fixture.querySelectorAll('.keyboard-key.is-selected')].map(key => Number(key.dataset.midi));
                if (JSON.stringify(actual) !== JSON.stringify(expected))
                    throw new Error(`${block}: expected ${expected}, received ${actual}`);
            }
        }
        finally {
            cleanup();
            fixture.remove();
        }
    }
    try {
        for (const { keyboard, expected } of cases) {
            lesson.application = { ...original.application, keyboard, sequence: [{ label: 'Example', instruction: 'Play these notes.', keyboard }] };
            lesson.recall = { kind: 'creative' };
            const fixture = document.createElement('div');
            document.body.append(fixture);
            const cleanup = createPracticeSession(fixture, lesson.id);
            checkFixture(fixture, cleanup, expected);
        }
    }
    finally {
        Object.assign(lesson, original);
    }
}, sourcePrefix);
const epoch = new Date('2026-10-10T12:00:00Z');
await page.clock.install({ time: epoch });
await page.clock.pauseAt(new Date(epoch.getTime() + 1000));
await page.evaluate(() => {
    const startInterval = window.setInterval.bind(window);
    const stopInterval = window.clearInterval.bind(window);
    window.__practiceTestIntervals = new Set();
    window.setInterval = (...args) => {
        const id = startInterval(...args);
        window.__practiceTestIntervals.add(id);
        return id;
    };
    window.clearInterval = id => {
        window.__practiceTestIntervals.delete(id);
        return stopInterval(id);
    };
});
