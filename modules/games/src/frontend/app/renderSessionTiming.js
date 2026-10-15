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
        <span>Time</span>
        <h2>${duration === null ? "Duration not set" : formatDuration(duration)}</h2>
      </div>
      <div class="split time-grid">
        <label>
          Started
          <input data-testid="${testIds.sessionStartedAt}" type="datetime-local" value="${escapeHtml(formatDateTimeLocal(session.startedAt))}">
        </label>
        <label>
          Ended
          <input data-testid="${testIds.sessionCompletedAt}" type="datetime-local" value="${escapeHtml(formatDateTimeLocal(session.completedAt))}">
        </label>
        <label>
          Duration override
          <input data-testid="${testIds.sessionDurationOverride}" type="number" min="0" step="1" placeholder="Auto" value="${escapeHtml(session.durationMinutesOverride ?? "")}">
        </label>
      </div>
      <p class="subtle" data-testid="${testIds.sessionDuration}">${duration === null ? "Set an end time or duration." : `Current duration: ${formatDuration(duration)}`}</p>
    </section>
  `;
}
