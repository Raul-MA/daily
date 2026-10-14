import assert from 'node:assert/strict';
export async function checkLayout({ mobilePage, width }, label) {
    const defects = await mobilePage.evaluate(() => {
        const problems = [];
        const main = document.querySelector('#page-content');
        if (document.documentElement.scrollWidth > innerWidth + 1)
            problems.push('document overflow');
        if (main.scrollWidth > main.clientWidth + 1)
            problems.push('page overflow');
        for (const table of document.querySelectorAll('.card-answer table')) {
            const card = table.closest('.exercise-card').getBoundingClientRect();
            const bounds = table.getBoundingClientRect();
            if (bounds.left < card.left - 1 || bounds.right > card.right + 1)
                problems.push(`clipped table ${Math.round(bounds.width)} in card ${Math.round(card.width)}`);
        }
        checkPopovers();
        function checkPopovers() {
            for (const node of document.querySelectorAll('.filter-popover.open, .search-results.open')) {
                const bounds = node.getBoundingClientRect();
                if (bounds.left < -1 || bounds.right > innerWidth + 1)
                    problems.push(`popover outside viewport ${bounds.left}–${bounds.right}`);
            }
        }
        return problems;
    });
    assert.deepEqual(defects, [], `${width}px ${label}`);
}
export async function checkPianos({ mobilePage, width }, label) {
    const keyboards = await mobilePage.locator('.keyboard-diagram').evaluateAll(figures => figures.map(figure => ({
        whites: [...figure.querySelectorAll('.keyboard-key:not(.is-black)')].map(key => Number(key.dataset.midi)),
        selected: [...figure.querySelectorAll('.keyboard-key.is-selected')].map(key => Number(key.dataset.midi)),
        caption: figure.querySelector('figcaption').textContent,
    })));
    assert.ok(keyboards.length, `${width}px ${label}: piano present`);
    for (const keyboard of keyboards) {
        assert.ok(keyboard.selected.length, `${label}: highlighted notes`);
        assert.match(keyboard.caption, /Octave numbers mark exact keys/);
        const low = Math.min(...keyboard.selected);
        assert.ok([low].some(note => keyboard.whites[0] < note && keyboard.whites[1] >= note), `${label}: cropped start`);
    }
}
