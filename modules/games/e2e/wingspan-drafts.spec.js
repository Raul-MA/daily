import { test, expect } from '@playwright/test';
import { openApp, createPlayer, createGame, testIds } from './helpers.js';
import { readGameData } from './shared-data.js';

async function setup(page) {
  await openApp(page);
  await createPlayer(page, 'Ada');
  await createPlayer(page, 'Grace');
  await createGame(page, 'Wingspan', 'wingspan_base');
  await page.getByTestId(testIds.navPlay).first().click();
  await page.getByTestId(testIds.playPlayerToggle).nth(0).check();
  await page.getByTestId(testIds.playPlayerToggle).nth(1).check();
  await page.getByTestId(testIds.playStart).click();
  await expect(page.getByTestId('wingspan-sheet')).toBeVisible();
}

async function draftPlayer(page, index, values) {
  await page.getByTestId('wingspan-player').nth(index).getByTestId('wingspan-category').evaluateAll((inputs, scores) => {
    inputs.forEach((input, position) => {
      input.value = String(scores[position]);
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
  }, values);
}

test('Wingspan totals include every visible draft category and survive a language remount', async ({ page }) => {
  await setup(page);
  await draftPlayer(page, 0, [2, 3, 4, 5, 2, 4]);
  await expect(page.getByTestId('wingspan-total').first()).toHaveText('20');
  await page.getByRole('button', { name: 'Español', exact: true }).click();
  await expect(page.getByTestId('wingspan-category').first()).toHaveValue('2');
  await expect(page.getByTestId('wingspan-total').first()).toHaveText('20');
  await page.getByTestId('wingspan-unused-food').first().fill('30');
  await expect(page.getByTestId('wingspan-total').first()).toHaveText('20');
});

test('Wingspan finish saves all visible draft scores before calculating history and reports', async ({ page }) => {
  await setup(page);
  await draftPlayer(page, 0, [2, 3, 4, 5, 2, 4]);
  await draftPlayer(page, 1, [0, 0, 0, 0, 0, 0]);
  page.once('dialog', dialog => dialog.accept());
  await page.getByTestId(testIds.finishSession).click();
  await expect(page.getByTestId(testIds.historyItem)).toHaveCount(1);
  const data = await readGameData(page);
  const session = data.sessions[0];
  expect(session.scorecard.players[session.participants[0].playerId].categories).toEqual({ birds: 2, bonusCards: 3, goals: 4, eggs: 5, cachedFood: 2, tuckedCards: 4 });
  expect(session.winnerPlayerIds).toEqual([session.participants[0].playerId]);
  await page.reload();
  await page.getByTestId(testIds.historyItem).click();
  await expect(page.getByTestId('wingspan-total').first()).toHaveText('20');
  await page.getByTestId(testIds.navStats).first().click();
  await expect(page.getByTestId('wingspan-report-player').first()).toContainText('Ada');
  await expect(page.getByTestId(testIds.statsView)).toContainText('20');
});

test('Wingspan reuses arithmetic text inputs for live previews, Enter saves and completed totals', async ({ page }) => {
  await setup(page);
  const inputs = page.getByTestId('wingspan-player').first().getByTestId('wingspan-category');
  await expect(inputs.first()).toHaveAttribute('type', 'text');
  await inputs.first().fill('2+3');
  await expect(page.getByTestId('wingspan-total').first()).toHaveText('5');
  await expect(page.getByTestId('wingspan-player').first().getByTestId('score-preview').first()).toHaveText('Total: 5');
  await inputs.first().press('Enter');
  await expect(inputs.first()).toHaveValue('5');
  const expressions = ['12/3', '5*2', '8-3', '9/2', '1+1'];
  for (const [index, expression] of expressions.entries()) {
    await inputs.nth(index + 1).fill(expression);
    await inputs.nth(index + 1).press('Tab');
  }
  await expect(page.getByTestId('wingspan-total').first()).toHaveText('30');
  await page.getByTestId('wingspan-unused-food').first().fill('10/2');
  await page.getByTestId('wingspan-unused-food').first().press('Enter');
  await expect(page.getByTestId('wingspan-unused-food').first()).toHaveValue('5');
  await expect(page.getByTestId('wingspan-total').first()).toHaveText('30');
  await draftPlayer(page, 1, [0, 0, 0, 0, 0, 0]);
  page.once('dialog', dialog => dialog.accept());
  await page.getByTestId(testIds.finishSession).click();
  await page.getByTestId(testIds.historyItem).click();
  await expect(page.getByTestId('wingspan-total').first()).toHaveText('30');
});

test('Wingspan arithmetic rejects invalid or negative results without replacing saved scores', async ({ page }) => {
  await setup(page);
  const input = page.getByTestId('wingspan-category').first();
  for (const expression of ['1/0', '2+', '-3']) {
    await input.fill(expression);
    await expect(input).toHaveAttribute('aria-invalid', 'true');
    await input.press('Enter');
    await expect(page.getByTestId(testIds.appToast)).toBeVisible();
    const data = await readGameData(page);
    expect(data.sessions[0].scorecard.players[data.players[0].id].categories.birds).toBeNull();
    await expect(input).toHaveValue(expression);
  }
  await input.fill('6/2');
  await input.press('Enter');
  await expect(input).toHaveValue('3');
  await page.reload();
  await expect(input).toHaveValue('3');
});
