import { test, expect } from '@playwright/test';

test.use({ serviceWorkers: 'allow' });

async function saved(page) {
  return page.evaluate(() => { const root = JSON.parse(localStorage.getItem('daily:v1')); return JSON.stringify({ piano: root.modules.piano, activities: root.modules.activities }); });
}

test('piano Spanish lessons and running prompts preserve canonical English records and timestamps', async ({ page }) => {
  const time = new Date('2026-10-15T12:00:00Z');
  await page.clock.install({ time });
  await page.clock.pauseAt(time);
  await page.goto('./#/piano/learn?lesson=interval-foundations');
  await page.locator('.practice-setup button[type=submit]').click();
  await page.locator('[data-action=next]').click();
  const question = await page.locator('.practice-question').textContent();
  const before = await saved(page);
  await page.getByRole('button', { name: 'Español', exact: true }).click();
  await expect(page.locator('[data-module=piano] h1')).toHaveText('Encuentra terceras y quintas');
  await expect(page.locator('[data-action=reveal]')).toHaveText('Mostrar respuesta');
  await expect(page.locator('.practice-question')).not.toHaveText(question);
  expect(await saved(page)).toBe(before);
  await page.clock.runFor(90000);
  await expect(page.locator('[data-clock]')).toContainText('1:30 transcurridos');
  expect(await saved(page)).toBe(before);
  await page.getByRole('link', { name: 'Inicio', exact: true }).click();
  await expect(page.locator('[data-widget=activities]')).toContainText('Encuentra terceras y quintas');
  await expect(page.locator('[data-piano-practice]')).toContainText('Encuentra terceras y quintas');
  expect(await saved(page)).toBe(before);
  await page.goto('./#/piano/learn?lesson=interval-foundations');
  await page.getByRole('button', { name: 'English', exact: true }).click();
  await expect(page.locator('.practice-question')).toHaveText(question);
  expect(await saved(page)).toBe(before);
});

test('piano Spanish library and every destination open offline at 320px', async ({ page, context }) => {
  test.setTimeout(180000);
  await page.goto('./#/piano');
  await page.getByRole('button', { name: 'Español', exact: true }).click();
  await expect(page.locator('[data-module=piano] h1')).toHaveText('Aprende a improvisar');
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller) await new Promise(resolve => navigator.serviceWorker.addEventListener('controllerchange', resolve, { once: true }));
  });
  const destinations = await page.evaluate(async () => {
    const { DESTINATIONS } = await import('/daily/modules/piano/src/js/components/navigation-data.js');
    const { pianoHref } = await import('/daily/modules/piano/src/js/router.js');
    return DESTINATIONS.map(item => ({ id: item.id, url: pianoHref(item.path) }));
  });
  await context.setOffline(true);
  await page.setViewportSize({ width: 320, height: 740 });
  const missingCopy = [];
  for (const destination of destinations) {
    await page.goto(destination.url);
    await expect(page.locator('[data-module=piano] h1'), destination.id).toBeVisible();
    await expect(page.locator('[data-piano-loading]')).toHaveCount(0);
    await expect(page.locator('[data-module=piano] h1')).not.toContainText(/\b(Theory|Exercises|Cards|Scales|Intervals|Learn|Tensions|Chords)\b/);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), destination.id).toBe(true);
    const untranslated = await page.locator('[data-module=piano]').evaluate(async root => {
      const { dictionaries } = await import('/daily/modules/piano/src/i18n.js');
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      const missing = [];
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        const text = node.textContent.trim();
        if (!node.parentElement.closest('code,kbd,script,style') && dictionaries.es[text] && dictionaries.es[text] !== text) missing.push(text);
      }
      return missing;
    });
    if (untranslated.length) missingCopy.push({ id: destination.id, untranslated });
  }
  expect(missingCopy).toEqual([]);
});

test('piano Spanish search finds translated lessons and reference topics', async ({ page }) => {
  await page.goto('./#/piano/library');
  await page.getByRole('button', { name: 'Español', exact: true }).click();
  const search = page.getByRole('combobox', { name: 'Buscar páginas y contenido', exact: true });
  await search.fill('terceras');
  await expect(page.locator('.search-results')).toContainText('Encuentra terceras y quintas');
  await search.fill('armaduras');
  await expect(page.locator('.search-results')).toContainText('Armaduras');
});

test('piano language remounts preserve the ordinary exercise question answer and filters', async ({ page }) => {
  await page.goto('./#/piano/exercises/intervals.practice');
  await page.locator('.filter-btn').click();
  await page.locator('.multi-select').selectOption(['3', '7']);
  await page.locator('.random-btn').click();
  await page.locator('.exercise-card').click();
  await expect(page.locator('.exercise-card')).toHaveClass(/revealed/);
  const notes = await page.locator('.keyboard-key.is-selected').evaluateAll(nodes => nodes.map(node => [node.dataset.note, node.dataset.octave]));
  expect(notes.length).toBeGreaterThan(0);
  const before = await saved(page);
  await page.getByRole('button', { name: 'Español', exact: true }).click();
  await expect(page.locator('.exercise-card')).toHaveClass(/revealed/);
  expect(await page.locator('.keyboard-key.is-selected').evaluateAll(nodes => nodes.map(node => [node.dataset.note, node.dataset.octave]))).toEqual(notes);
  expect(await page.locator('.multi-select').evaluate(node => Array.from(node.selectedOptions, option => option.value))).toEqual(['3', '7']);
  expect(await saved(page)).toBe(before);
  await page.goto('./#/piano/exercises/chord-inversions.practice');
  await page.locator('.exercise-controls button').nth(2).click();
  await page.locator('.exercise-card').click();
  await page.getByRole('button', { name: 'English', exact: true }).click();
  await expect(page.locator('.exercise-controls button').nth(2)).toHaveClass(/btn-primary/);
  await expect(page.locator('.exercise-card')).toHaveClass(/revealed/);
  await page.goto('./#/piano/exercises/chord-progressions.practice');
  await page.locator('#root-select').selectOption('D');
  await page.locator('#length-select').selectOption('6');
  await page.locator('#generate-btn').click();
  const progression = await page.locator('.progression-area .chord-name').allTextContents();
  expect(progression).toHaveLength(6);
  await page.getByRole('button', { name: 'Español', exact: true }).click();
  await expect(page.locator('#root-select')).toHaveValue('D');
  await expect(page.locator('#length-select')).toHaveValue('6');
  expect(await page.locator('.progression-area .chord-name').allTextContents()).toEqual(progression);
});
