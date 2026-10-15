import { validateBackupSessions } from './backup-sessions.js';
import { onlyUnique, isPlainObject, nonEmptyString } from './common.js';
import { validatePlayer, validateGame } from './entities.js';
import { APP_ID, APP_SLUG, parseVersion, SCHEMA_VERSION } from '../schema.js';

export function validateBackup(backup) {
 const errors = backupRootErrors(backup);
 if (errors.length) return [...new Set(errors)];
 return [...validateBackupPlayers(backup.players), ...validateBackupGames(backup.games), ...validateBackupSessions(backup)].filter(onlyUnique);
}

export function validateBackupPlayers(players) {
  const errors = [];
  const seenIds = new Set();
  players.forEach((player, index) => {
    if (!isPlainObject(player)) {
      errors.push(`Backup player ${index + 1} must be an object.`);
      return;
    }
    if (!nonEmptyString(player.id)) errors.push(`Backup player ${index + 1} is missing id.`);
    if (nonEmptyString(player.id) && seenIds.has(player.id)) errors.push("Backup player IDs must be unique.");
    seenIds.add(player.id);
    errors.push(...validatePlayer(player, players).map((message) => `Backup player ${index + 1}: ${message}`));
  });
  return errors;
}

export function validateBackupGames(games) {
  const errors = [];
  const seenIds = new Set();
  games.forEach((game, index) => {
    if (!isPlainObject(game)) {
      errors.push(`Backup game ${index + 1} must be an object.`);
      return;
    }
    if (!nonEmptyString(game.id)) errors.push(`Backup game ${index + 1} is missing id.`);
    if (nonEmptyString(game.id) && seenIds.has(game.id)) errors.push("Backup game IDs must be unique.");
    seenIds.add(game.id);
    errors.push(...validateGame(game).map((message) => `Backup game ${index + 1}: ${message}`));
  });
  return errors;
}

export function backupRootErrors(backup) {
 const data = backup ?? {};
 const errors = [];
 if (!backup || typeof backup !== 'object') errors.push('Backup must be a JSON object.');
 if (data.appId !== APP_ID && data.appSlug !== APP_SLUG) errors.push('Backup belongs to a different app.');
 if (!data.schemaVersion) errors.push('Backup is missing schemaVersion.');
 if (missingSettings(data.settings)) errors.push('Backup is missing settings.');
 return [...errors, ...backupCollectionErrors(data)];
}

function missingSettings(value) { return !value || typeof value !== 'object'; }

export function backupCollectionErrors(backup) {
 const errors = [];
 for (const field of ['players', 'games', 'sessions']) {
  if (!Array.isArray(backup[field])) errors.push('Backup ' + field + ' must be an array.');
 }
 if (parseVersion(backup.schemaVersion).major > parseVersion(SCHEMA_VERSION).major) errors.push('Backup uses an unsupported future major version.');
 return errors;
}
