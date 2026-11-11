import { test, expect } from '@playwright/test';
import { openApp, createPlayer, testIds } from './helpers.js';
import { readGameData } from './shared-data.js';

async function lowestScoreGame(page, language) {
  await openApp(page);
  await createPlayer(page, 'Ada');
  await createPlayer(page, 'Grace');
  if (language === 'es') await page.getByRole('button', { name: 'Español', exact: true }).click();
  await page.getByTestId(testIds.navGames).first().click();
  const label = language === 'es' ? 'Menor puntuación tras las rondas' : 'Lowest score after rounds';
  await expect(page.getByTestId(testIds.gameMode).locator('option', { hasText: label })).toHaveCount(1);
  await page.getByTestId(testIds.gameName).fill('Golf');
  await page.getByTestId(testIds.gameMode).selectOption('lowest_score_after_rounds');
  await page.getByTestId(testIds.gameRoundCount).fill('2');
  await page.getByTestId(testIds.gameSave).click();
  await expect(page.getByTestId(testIds.gameItem)).toContainText(label);
  await page.getByTestId(testIds.gameItem).getByRole('button', { name: language === 'es' ? 'Editar' : 'Edit', exact: true }).click();
  await expect(page.getByTestId(testIds.gameMode)).toHaveValue('lowest_score_after_rounds');
  await expect(page.getByTestId(testIds.gameRoundCount)).toHaveValue('2');
  await page.getByTestId(testIds.gameSave).click();
  await page.getByTestId(testIds.navPlay).first().click();
  await page.getByTestId(testIds.playPlayerToggle).nth(0).check();
  await page.getByTestId(testIds.playPlayerToggle).nth(1).check();
  await page.getByTestId(testIds.playStart).click();
  await expect(page.getByTestId(testIds.activeSession)).toContainText(label);
  await enterScores(page, ['-3', '9']);
  await page.getByTestId(testIds.addRound).click();
  await enterScores(page, ['2', '-5'], 2);
  await page.reload();
  await expect(page.getByTestId(testIds.sessionTotal).first()).toContainText('Ada');
  await expect(page.getByTestId(testIds.sessionTotal).first().locator('strong')).toHaveText('-1');
  page.once('dialog', dialog => dialog.accept());
  await page.getByTestId(testIds.finishSession).click();
  const data = await readGameData(page);
  expect(data.games[0].higherScoreWins).toBe(false);
  expect(data.sessions[0].roundCount).toBe(2);
  expect(data.sessions[0].winnerPlayerIds).toEqual([data.players.find(player => player.name === 'Ada').id]);
  await page.getByTestId(testIds.historyItem).click();
  await expect(page.getByTestId(testIds.gameDetail)).toContainText(label);
}

async function enterScores(page, scores, offset = 0) {
  for (const [index, score] of scores.entries()) {
    await page.getByTestId(testIds.scoreInput).nth(offset + index).fill(score);
    await page.getByTestId(testIds.scoreInput).nth(offset + index).blur();
  }
}

test('lowest score wins across rounds, reload, editing and completed history', async ({ page }) => {
  await lowestScoreGame(page, 'en');
  await page.getByTestId(testIds.navGames).first().click();
  await page.getByTestId(testIds.gameItem).getByRole('button', { name: 'Edit', exact: true }).click();
  await page.getByTestId(testIds.gameMode).selectOption('highest_score_after_rounds');
  await page.getByTestId(testIds.gameSave).click();
  expect((await readGameData(page)).games[0].higherScoreWins).toBe(true);
  await page.getByTestId(testIds.navHistory).first().click();
  await page.getByTestId(testIds.historyItem).click();
  await expect(page.getByTestId(testIds.gameDetail)).toContainText('Lowest score after rounds');
});

test('lowest score game setup and results work in Spanish at phone width', async ({ page }) => {
  await lowestScoreGame(page, 'es');
  await page.setViewportSize({ width: 320, height: 740 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
