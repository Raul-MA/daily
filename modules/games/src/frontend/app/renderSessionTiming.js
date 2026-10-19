import { copy } from './copy.js';
import { getDurationMinutes } from '../../backend/features/sessions.js';
import { formatDuration } from './formatDuration.js';
import { testIds } from './testIds.js';
import { escapeHtml } from '../components/components.js';
import { formatDateTimeLocal } from './formatDateTimeLocal.js';

export function renderSessionTiming(session) {
  const duration = getDurationMinutes(session);
  return `
    <section class="ledger-block timing-panel">
      <div class="section-heading">
        <span>${copy("Time")}</span>
        <h2>${duration === null ? copy("Duration not set") : formatDuration(duration)}</h2>
      </div>
      <div class="split time-grid">
        <label>
          ${copy("Started")}
          <input data-testid="${testIds.sessionStartedAt}" type="datetime-local" value="${escapeHtml(formatDateTimeLocal(session.startedAt))}">
        </label>
        <label>
          ${copy("Ended")}
          <input data-testid="${testIds.sessionCompletedAt}" type="datetime-local" value="${escapeHtml(formatDateTimeLocal(session.completedAt))}">
        </label>
        <label>
          ${copy("Duration override")}
          <input data-testid="${testIds.sessionDurationOverride}" type="number" min="0" step="1" placeholder="${copy("Auto")}" value="${escapeHtml(session.durationMinutesOverride ?? "")}">
        </label>
      </div>
      <p class="subtle" data-testid="${testIds.sessionDuration}">${duration === null ? copy("Set an end time or duration.") : copy("Current duration: {duration}", { duration: formatDuration(duration) })}</p>
    </section>
  `;
}
