import test from 'node:test';
import assert from 'node:assert/strict';
import { readGameInput } from '../src/frontend/app/readGameInput.js';
import { renderGameScoringFields } from '../src/frontend/app/renderGameScoringFields.js';
import { gameUI, createGameUI } from '../src/frontend/app/context.js';

test('lowest score creation uses the existing backup scoring contract and round fields', () => {
  gameUI.ui = createGameUI();
  const form = new FormData();
  form.set('name', 'Golf');
  form.set('scoringMode', 'lowest_score_after_rounds');
  form.set('roundCount', '3');
  const input = readGameInput(form, null, { defaultRoundCount: 5 });
  assert.equal(input.scoringMode, 'highest_score_after_rounds');
  assert.equal(input.higherScoreWins, false);
  assert.equal(Number(input.roundCount), 3);
  assert.match(renderGameScoringFields(null, { defaultRoundCount: 5 }, 'lowest_score_after_rounds'), /name="roundCount"/);
});

test('editing lowest score games can explicitly switch back to highest score', () => {
  gameUI.ui = createGameUI();
  const form = new FormData();
  form.set('scoringMode', 'highest_score_after_rounds');
  const input = readGameInput(form, { scoringMode: 'highest_score_after_rounds', higherScoreWins: false }, {});
  assert.equal(input.higherScoreWins, true);
});
