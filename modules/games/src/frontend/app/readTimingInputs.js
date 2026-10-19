import { localDateTimeToIso } from './localDateTimeToIso.js';
import { gameUI } from './context.js';
import { testIds } from './testIds.js';

export function readTimingInputs({ useNowForMissingEnd = false } = {}) {
  const startedAt = localDateTimeToIso(fieldValue(testIds.sessionStartedAt));
  const completedInput = fieldValue(testIds.sessionCompletedAt);
  const completedAt = localDateTimeToIso(completedInput) || (useNowForMissingEnd ? new Date().toISOString() : null);
  const override = fieldValue(testIds.sessionDurationOverride);
  return {
    startedAt,
    completedAt,
    durationMinutesOverride: override === "" ? null : Number(override)
  };
}

function fieldValue(id) { return gameUI.app.querySelector(`[data-testid="${id}"]`)?.value; }
