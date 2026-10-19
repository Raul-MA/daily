import { test, expect } from '@playwright/test';
import { openApp, createPlayer, createGame, testIds } from './helpers.js';
import { readGameData, seedGameData } from './shared-data.js';
import { fixtureData } from './fixture-data.js';

test.use({ serviceWorkers: 'allow' });

test('games Spanish management history statistics and backup screens reopen offline without data writes', async ({ page, context }) => {
  await page.goto('/daily/#/games');
  await seedGameData(page, fixtureData('gameplay-1.json', '2026-07-07T18:00:00.000Z'));
  await page.reload();
  const before = await readGameData(page);
  await page.getByRole('button', { name: 'Español', exact: true }).click();
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller) await new Promise(resolve => navigator.serviceWorker.addEventListener('controllerchange', resolve, { once: true }));
  });
  await context.setOffline(true);
  await page.reload();
  await page.setViewportSize({ width: 320, height: 740 });
  for (const [nav, heading] of [
    [testIds.navPlay, 'Prepara la mesa'], [testIds.navPlayers, 'Personas en la mesa'],
    [testIds.navGames, 'Reglas de puntuación'], [testIds.navHistory, 'Partidas terminadas'],
    [testIds.navStats, 'Récords'], [testIds.navSettings, 'Datos locales'],
  ]) {
    await page.getByRole('button', { name: 'Apps', exact: true }).click();
    await page.getByTestId(nav).last().click();
    await expect(page.locator('[data-module=games] h1')).toHaveText(heading);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  await expect(page.getByTestId(testIds.settingsLanguage)).toHaveValue('es');
  expect(await readGameData(page)).toEqual(before);
});

test('games Spanish scores finish and history retain literal English user names and notes', async ({ page }) => {
  await openApp(page);
  await createPlayer(page, 'Play');
  await createPlayer(page, 'Win');
  await createGame(page, 'History');
  await page.getByTestId(testIds.gameItem).getByRole('button', { name: 'Edit', exact: true }).click();
  await page.locator('[name=notes]').fill('No winner 🧩');
  await page.getByTestId(testIds.gameSave).click();
  await page.getByRole('button', { name: 'Español', exact: true }).click();
  await page.getByTestId(testIds.navPlay).first().click();
  await page.getByTestId(testIds.playPlayerToggle).nth(0).check();
  await page.getByTestId(testIds.playPlayerToggle).nth(1).check();
  await page.getByTestId(testIds.playStart).click();
  await expect(page.locator('.round-title').first()).toHaveText('Ronda 1');
  await page.getByTestId(testIds.scoreInput).first().fill('3+5');
  await page.getByTestId(testIds.scoreInput).first().blur();
  page.once('dialog', async dialog => {
    expect(dialog.message()).toBe('¿Terminar esta sesión?');
    await dialog.accept();
  });
  await page.getByTestId(testIds.finishSession).click();
  await expect(page.getByTestId(testIds.historyItem)).toContainText('Ganador:');
  await page.getByTestId(testIds.historyItem).click();
  await expect(page.getByTestId(testIds.gameDetail)).toContainText('Resultado');
  const data = await readGameData(page);
  expect(data.players.map(player => player.name).sort()).toEqual(['Play', 'Win']);
  expect(data.games[0].name).toBe('History');
  expect(data.games[0].notes).toBe('No winner 🧩');
});

test('games notifications and validation translate on remount without renewing expiry', async ({ page }) => {
  await page.clock.install();
  await page.clock.pauseAt(new Date());
  await openApp(page);
  await createPlayer(page, 'Ada');
  await page.clock.fastForward(2000);
  await page.getByRole('button', { name: 'Español', exact: true }).click();
  await expect(page.getByTestId(testIds.appToast)).toContainText('Jugador guardado.');
  await page.clock.fastForward(1700);
  await expect(page.getByTestId(testIds.appToast)).toHaveCount(0);
  await page.getByTestId(testIds.navPlay).first().click();
  await page.getByTestId(testIds.playStart).click();
  await expect(page.getByTestId(testIds.appToast)).toContainText('Elige un juego.');
  await page.getByRole('button', { name: 'English', exact: true }).click();
  await expect(page.getByTestId(testIds.appToast)).toContainText('Choose a game.');
});

test('games failed-write errors translate after remount while retaining the unsaved draft', async ({ page }) => {
  await openApp(page);
  await createPlayer(page, 'Ada');
  await page.getByTestId(testIds.playerItem).getByRole('button', { name: 'Edit', exact: true }).click();
  await page.getByTestId(testIds.playerName).fill('Draft 🧩');
  const before = await readGameData(page);
  await page.evaluate(() => {
    const original = Storage.prototype.setItem;
    window.gamesQuota = true;
    Storage.prototype.setItem = function (key, value) {
      if (key === 'daily:v1' && window.gamesQuota) throw new Error('QuotaExceededError');
      return original.call(this, key, value);
    };
  });
  await page.getByTestId(testIds.playerSave).click();
  await expect(page.getByTestId(testIds.appToast)).toContainText('QuotaExceededError');
  await page.evaluate(() => { window.gamesQuota = false; });
  await page.getByRole('button', { name: 'Español', exact: true }).click();
  await expect(page.getByTestId(testIds.appToast)).toContainText('No queda espacio de almacenamiento');
  await expect(page.getByTestId(testIds.playerName)).toHaveValue('Draft 🧩');
  expect((await readGameData(page)).players).toEqual(before.players);
});
