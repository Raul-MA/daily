import { validateBackup } from './backend/core/validation.js';

function validSettings(settings) {
  return ['system', 'light', 'dark'].includes(settings.theme)
    && ['en', 'es'].includes(settings.language)
    && ['confirmBeforeFinishingSession', 'showArchived'].every(key => typeof settings[key] === 'boolean')
    && ['backupReminderDays', 'defaultRoundCount', 'defaultTargetScore', 'historyPageSize'].every(key => Number.isInteger(settings[key]) && settings[key] > 0);
}
export function validGames(data) {
  return validateBackup(data).length === 0 && data.schemaVersion === '1.0' && validSettings(data.settings);
}
