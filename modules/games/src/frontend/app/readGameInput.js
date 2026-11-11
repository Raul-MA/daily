import { selectedScoringMode } from './selectedScoringMode.js';
import { gameInputValue } from './gameInputValue.js';

export function readGameInput(form, existingGame, settings) {
  const mode = selectedScoringMode(form, existingGame);
  const lowestWins = mode === 'lowest_score_after_rounds';
  return {
    name: form.get('name'),
    isCollaborative: Boolean(form.get('isCollaborative')),
    scoringMode: lowestWins ? 'highest_score_after_rounds' : mode,
    roundCount: gameInputValue(form, existingGame, 'roundCount', settings.defaultRoundCount),
    targetScore: gameInputValue(form, existingGame, 'targetScore', settings.defaultTargetScore),
    higherScoreWins: !lowestWins,
    notes: form.get('notes')
  };
}
