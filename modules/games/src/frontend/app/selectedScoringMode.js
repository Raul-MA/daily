import { gameUI } from './context.js';

export function selectedScoringMode(form, game) { return form.get('scoringMode') || gameUI.ui.gameFormMode || game?.scoringMode || 'highest_score_after_rounds'; }
