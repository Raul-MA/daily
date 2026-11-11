import { gameUI } from './context.js';
import { scoringModeChoice } from '../../backend/features/games.js';

export function selectedScoringMode(form, game) { return form.get('scoringMode') || gameUI.ui.gameFormMode || scoringModeChoice(game); }
