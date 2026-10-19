import { evaluateScoreExpression } from './evaluateScoreExpression.js';
import { updateScorePreview } from './updateScorePreview.js';
import { getState } from './state.js';
import { isTargetReached } from './isTargetReached.js';
import { getActiveSession, updateScore } from '../../backend/features/sessions.js';
import { applyResult } from './applyResult.js';
import { TARGET_REACHED_MESSAGE, TOAST_DURATION_MS } from './constants.js';

export function commitScoreInput(input, session) {
  const evaluated = evaluateScoreExpression(input.value);
  updateScorePreview(input, evaluated);
  if (!evaluated.valid) return;
  input.value = evaluated.value;
  const previous = getState();
  const targetWasReached = isTargetReached(getActiveSession(previous));
  const result = updateScore(previous, { sessionId: session.id, roundId: input.dataset.roundId, playerId: input.dataset.playerId }, input.value);
  const targetReached = !targetWasReached && isTargetReached(getActiveSession(result.data));
  applyResult(result, targetReached ? TARGET_REACHED_MESSAGE : "", targetReached ? 0 : TOAST_DURATION_MS);
}
