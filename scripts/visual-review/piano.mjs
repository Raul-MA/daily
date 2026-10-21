import { readFile } from 'node:fs/promises';

async function start(page) {
  await page.locator('.practice-setup button[type="submit"]').click();
  await page.locator('[data-action="next"]').click();
  await page.locator('.practice-question').waitFor();
}

async function imported(page) {
  const example = await readFile('modules/piano/docs/exercise-player/example.json', 'utf8');
  await page.locator('[name="import-json"]').fill(example);
  await page.locator('[data-player-action="import"]').click();
  await page.locator('[name="exerciseTitle"]').waitFor({ state: 'attached' });
}

async function correctionScore(page) {
  await imported(page);
  await page.getByText('Correct a note', { exact: true }).click();
  await page.getByText('Original score', { exact: true }).click();
  const png = await page.evaluate(() => {
    const canvas = document.createElement('canvas'); canvas.width = 600; canvas.height = 160;
    const pen = canvas.getContext('2d'); pen.fillStyle = 'white'; pen.fillRect(0, 0, 600, 160);
    pen.fillStyle = '#242b28'; pen.font = '18px serif'; pen.fillText('Visual review: reference score', 20, 28);
    for (let y = 60; y <= 108; y += 12) pen.fillRect(20, y, 560, 1);
    for (let x = 70; x < 500; x += 80) { pen.beginPath(); pen.ellipse(x, 84, 7, 5, -0.4, 0, 7); pen.fill(); pen.fillRect(x + 6, 45, 1, 39); }
    return canvas.toDataURL().split(',')[1];
  });
  await page.locator('[name="score-file"]').setInputFiles({ name: 'visual-score.png', mimeType: 'image/png', buffer: Buffer.from(png, 'base64') });
  await page.locator('[data-player-score] img').waitFor({ state: 'attached' });
  await page.getByText('Original score', { exact: true }).click();
  await page.locator('[data-player-score] img').waitFor();
}

function practiceStates(root) {
  const url = '/daily/#/piano/learn?lesson=interval-foundations';
  return [
    { name: 'setup-duration', prepare: page => page.locator('[data-disclosure="duration"] summary').click() },
    { name: 'practice-prompt', prepare: start },
    { name: 'practice-reveal', prepare: async page => {
      await start(page); await page.locator('[data-action="reveal"]').click();
      await page.locator('[data-disclosure="pacing"] summary').click();
      await page.locator('[data-disclosure="review"] summary').click();
    } },
    { name: 'practice-paused', prepare: async page => { await start(page); await page.locator('[data-action="pause"]').click(); } },
    { name: 'practice-completed', prepare: async page => { await start(page); await page.locator('[data-action="finish"]').click(); } },
  ].map(view => ({ ...view, url, root }));
}

function playerStates(root) {
  return [
    { name: 'empty-player' }, { name: 'player-loaded', prepare: imported },
    { name: 'player-management', prepare: async page => { await imported(page); await page.locator('.player-management summary').click(); } },
    { name: 'player-options', sections: { options: 'details:has(> summary:text-is("Practice options"))' }, prepare: async page => { await imported(page); await page.getByText('Practice options', { exact: true }).click(); } },
    { name: 'player-correction-score', sections: { correction: '[data-disclosure="player-correction"]', score: 'details:has(> summary:text-is("Original score"))' }, prepare: correctionScore },
    { name: 'player-playing', sequential: true, sections: { playback: '.player-controls' }, prepare: async page => {
      await imported(page); await page.locator('[name="loopEnabled"]').check();
      await page.locator('[data-player-action="play"]').click();
      await page.waitForFunction(() => document.querySelector('[data-player-status]')?.textContent.includes('playing'));
    } },
  ].map(view => ({ ...view, url: '/daily/#/piano/reference/exercise-player', root }));
}

export function pianoStates(fixture) {
  const spanish = structuredClone(fixture.active); spanish.preferences.language = 'es';
  const setup = structuredClone(fixture.lesson);
  setup.modules.activities.data = setup.modules.activities.data.filter(item => item.kind !== 'piano');
  return [
    ...practiceStates(setup),
    { name: 'search-results', url: '/daily/#/piano/library', root: fixture.active, prepare: async page => {
      await page.locator('.search-input').fill('interval'); await page.locator('.search-results.open').waitFor();
    } },
    { name: 'exercise-filters-reveal', url: '/daily/#/piano/exercises/intervals.practice', root: fixture.active, prepare: async page => {
      await page.locator('.exercise-card').click(); await page.locator('.filter-btn').click();
    } },
    ...playerStates(fixture.active),
    { name: 'spanish-settings', url: '/daily/#/piano/settings', root: spanish, prepare: page => page.locator('#piano-settings-minutes').fill('12') },
  ];
}
