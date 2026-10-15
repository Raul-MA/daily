import { getState } from './state.js';
import { getActiveSession, addRound, removeRound, updateOutcome, updateCollaborativeOutcome, updateSessionTiming, finishSessionWithTiming } from '../../backend/features/sessions.js';
import { gameUI } from './context.js';
import { testIds } from './testIds.js';
import { guard, listen } from './events.js';
import { updateScorePreview } from './updateScorePreview.js';
import { commitScoreInput } from './commitScoreInput.js';
import { applyResult } from './applyResult.js';
import { readTimingInputs } from './readTimingInputs.js';
import { TOAST_DURATION_MS } from './constants.js';
import { navigate } from './router.js';

export function bindSession() {
  const data = getState();
  const session = getActiveSession(data);
  if (!session) return;
  gameUI.app.querySelectorAll(`[data-testid="${testIds.scoreInput}"]`).forEach((input) => {
    input.addEventListener("focus", guard(() => input.select()));
    input.addEventListener("click", guard(() => input.select()));
    input.addEventListener("input", guard(() => updateScorePreview(input)));
    input.addEventListener("keydown", guard((event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        commitScoreInput(input, session);
      }
    }));
    input.addEventListener("blur", guard(() => commitScoreInput(input, session)));
  });
  listen(`[data-testid="${testIds.addRound}"]`, "click", () => applyResult(addRound(getState(), session.id)));
  gameUI.app.querySelectorAll("[data-action='remove-round']").forEach((button) => {
    button.addEventListener("click", guard((event) => {
      event.preventDefault();
      applyResult(removeRound(getState(), session.id, button.dataset.roundId));
    }));
  });
  gameUI.app.querySelectorAll(`[data-testid="${testIds.outcomeSelect}"]`).forEach((select) => {
    select.addEventListener("change", guard(() => applyResult(updateOutcome(getState(), session.id, select.dataset.playerId, select.value))));
  });
  listen(`[data-testid="${testIds.collaborativeOutcome}"]`, "change", (event) => {
    applyResult(updateCollaborativeOutcome(getState(), session.id, event.target.value));
  });
  [testIds.sessionStartedAt, testIds.sessionCompletedAt, testIds.sessionDurationOverride].forEach((id) => {
    listen(`[data-testid="${id}"]`, "change", () => {
      applyResult(updateSessionTiming(getState(), session.id, readTimingInputs()), "", TOAST_DURATION_MS);
    });
  });
  listen(`[data-testid="${testIds.finishSession}"]`, "click", () => {
    if (data.settings.confirmBeforeFinishingSession && !window.confirm("Finish this session?")) return;
    applyResult(finishSessionWithTiming(getState(), session.id, readTimingInputs({ useNowForMissingEnd: true })), "Session finished.");
    if (!getActiveSession(getState())) navigate("history");
  });
}
