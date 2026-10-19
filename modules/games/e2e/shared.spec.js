import { test, expect } from '@playwright/test';
import { openApp, createPlayer, seedScoreGame, startScoreSession, testIds } from './helpers.js';
import { readGameData, seedGameData } from './shared-data.js';
import { fixtureData } from './fixture-data.js';

test('game activity survives Home reload and elapsed time without creating another session', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-10-15T12:00:00Z') });
  await openApp(page);
  await seedScoreGame(page);
  await page.clock.pauseAt(new Date('2026-10-15T12:10:00Z'));
  await startScoreSession(page);
  const before = await readGameData(page);
  await page.clock.fastForward(90000);
  await page.getByRole('link', { name: 'Home', exact: true }).click();
  const resume = page.locator('[data-widget=activities]').getByRole('link').filter({ hasText: 'Azul' });
  await expect(resume).toContainText('1:30');
  await page.reload();
  await expect(resume).toContainText('1:30');
  await resume.click();
  await expect(page).toHaveURL(new RegExp(`/games/session/${before.sessions[0].id}$`));
  await expect(page.getByTestId(testIds.activeSession)).toBeVisible();
  expect(await readGameData(page)).toEqual(before);
});

test('game form drafts survive shared language changes and notification expiry', async ({ page }) => {
  await page.clock.install();
  await openApp(page);
  await createPlayer(page, 'Ada');
  await page.getByTestId(testIds.navGames).first().click();
  await page.getByTestId(testIds.gameName).fill('Juego 🧩');
  await page.getByTestId(testIds.gameMode).selectOption('first_to_points');
  await page.getByTestId('game-target-score').fill('999');
  await page.locator('[name=notes]').fill('Mi nota');
  await page.getByRole('button', { name: 'Español', exact: true }).click();
  await expect(page.getByTestId(testIds.gameName)).toHaveValue('Juego 🧩');
  await expect(page.getByTestId('game-target-score')).toHaveValue('999');
  await expect(page.locator('[name=notes]')).toHaveValue('Mi nota');
  await page.clock.fastForward(4000);
  await expect(page.getByTestId(testIds.appToast)).toHaveCount(0);
  await expect(page.getByTestId(testIds.gameName)).toHaveValue('Juego 🧩');
  expect((await readGameData(page)).games).toHaveLength(0);
});

test('game player edits retain drafts and refuse to overwrite another tab', async ({ page, context }) => {
  await openApp(page);
  await createPlayer(page, 'Ada');
  await page.getByTestId(testIds.playerItem).getByRole('button', { name: 'Edit', exact: true }).click();
  await page.getByTestId(testIds.playerName).fill('Unsaved draft');
  const other = await context.newPage();
  await other.goto('/daily/#/');
  await other.evaluate(() => {
    const root = JSON.parse(localStorage.getItem('daily:v1'));
    root.modules.games.data.players[0].name = 'Other tab';
    localStorage.setItem('daily:v1', JSON.stringify(root));
  });
  await expect(page.locator('[data-game-conflict]')).toBeVisible();
  await page.getByTestId(testIds.playerSave).click();
  await expect(page.getByTestId(testIds.playerName)).toHaveValue('Unsaved draft');
  expect((await readGameData(page)).players[0].name).toBe('Other tab');
});

test('game import cancellation and stable history detail links leave saved records intact', async ({ page }) => {
  const data = fixtureData('gameplay-1.json', '2026-07-07T18:00:00.000Z');
  await page.goto('/daily/#/games');
  await seedGameData(page, data);
  await page.goto('/daily/#/games/history');
  await page.reload();
  const before = await readGameData(page);
  await page.getByTestId(testIds.historyItem).first().click();
  await expect(page).toHaveURL(/#\/games\/history\/[^/]+$/);
  await page.reload();
  await expect(page.getByTestId(testIds.gameDetail)).toBeVisible();
  await page.getByTestId(testIds.navSettings).first().click();
  await page.getByTestId(testIds.importInput).setInputFiles({ name: 'games.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(before)) });
  await expect(page.locator('[data-games-confirm-import]')).toBeDisabled();
  await page.locator('[data-games-cancel-import]').click();
  expect(await readGameData(page)).toEqual(before);
});

test('an obsolete game session link never opens a different active session', async ({ page }) => {
  await openApp(page);
  await seedScoreGame(page);
  await startScoreSession(page);
  const before = await readGameData(page);
  await page.goto('/daily/#/games/session/missing');
  await expect(page.getByRole('heading', { name: 'Game not found', exact: true })).toBeVisible();
  await expect(page.getByTestId(testIds.activeSession)).toHaveCount(0);
  expect(await readGameData(page)).toEqual(before);
});
