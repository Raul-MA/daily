import { selectedScoringMode } from './selectedScoringMode.js';
import { gameInputValue } from './gameInputValue.js';

export function readGameInput(form, existingGame, settings) {
 return { name: form.get('name'), isCollaborative: Boolean(form.get('isCollaborative')), scoringMode: selectedScoringMode(form, existingGame), roundCount: gameInputValue(form, existingGame, 'roundCount', settings.defaultRoundCount), targetScore: gameInputValue(form, existingGame, 'targetScore', settings.defaultTargetScore), higherScoreWins: existingGame?.higherScoreWins ?? true, notes: form.get('notes') };
}
