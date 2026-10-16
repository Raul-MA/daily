import { validateBackup } from './backend/core/validation.js';

function validSettings(settings) {
  return ['system', 'light', 'dark'].includes(settings.theme)
    && ['en', 'es'].includes(settings.language)
    && ['confirmBeforeFinishingSession', 'showArchived'].every(key => typeof settings[key] === 'boolean')
    && ['backupReminderDays', 'defaultRoundCount', 'defaultTargetScore', 'historyPageSize'].every(key => Number.isInteger(settings[key]) && settings[key] > 0);
}
export function validGames(data) {
  return validateBackup(data).length === 0 && data.schemaVersion === '1.0' && validSettings(data.settings) && data.sessions.every(validCollections);
}

function unique(values) { return new Set(values).size === values.length; }
function validCollections(session) {
  return unique(session.rounds.map(round => round.id)) && unique(session.rounds.map(round => Number(round.roundNumber)))
    && unique(session.results.map(result => result.playerId)) && unique(session.winnerPlayerIds);
}
