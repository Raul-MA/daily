import { validateDailyDocument } from '../../../../packages/data/src/daily-document.js';
import { validateActivities } from '../../../../packages/platform/src/activity-types.js';
import { validPlantsData } from '../../../../modules/plants/src/service.js';
import { validateCoffee } from '../../../../modules/coffee/src/validation.js';
import { validGames } from '../../../../modules/games/src/validation.js';
import { validBudget } from '../../../../modules/time-budget/src/validation.js';
import { validPiano } from '../../../../modules/piano/src/validation.js';
import { validReadingData } from '../../../../modules/reading/src/validation.js';
import { validWhatsApp } from '../../../../modules/whatsapp/src/validation.js';
import { assertActivityReferences } from './references.js';

const validators = { plants: validPlantsData, coffee: validateCoffee, games: validGames, 'time-budget': validBudget, piano: validPiano, reading: validReadingData, whatsapp: validWhatsApp, activities: validateActivities };
function validModule(id, payload) { try { return validators[id](payload.data); } catch { return false; } }
export function assertRestoreDocument(value) {
  if (value?.version !== 1) throw new Error('Unsupported Daily document version.');
  if (!validateDailyDocument(value)) throw new Error('Invalid Daily document.');
  for (const [id, payload] of Object.entries(value.modules)) {
    if (!Object.hasOwn(validators, id)) throw new Error(`Unsupported module: ${id}.`);
    if (payload.version !== 1) throw new Error(`Unsupported ${id} module version.`);
    if (!validModule(id, payload)) throw new Error(`Invalid ${id} module data or references.`);
  }
  assertActivityReferences(value);
}
function coffeeCounts(modules) { return { coffeeEntries: modules.coffee?.data.entries.length ?? 0, beans: modules.coffee?.data.beanPresets.length ?? 0 }; }
function gameCounts(modules) {
  return { players: modules.games?.data.players.length ?? 0, games: modules.games?.data.games.length ?? 0, gameSessions: modules.games?.data.sessions.length ?? 0 };
}
function timeCounts(modules) {
  return { budgetTemplates: Object.keys(modules['time-budget']?.data.templates ?? {}).length, budgetSessions: modules['time-budget']?.data.session ? 1 : 0 };
}
function pianoCounts(modules) { return { pianoPractices: modules.piano?.data.practice ? 1 : 0, pianoHistory: modules.piano?.data.history.length ?? 0 }; }
function readingCounts(modules) { return { readerPicks: modules.reading?.data.picks?.documents.length ?? 0, readerLastItem: modules.reading?.data.lastItem ? 1 : 0 }; }
export function backupCounts(value) {
  const modules = value.modules;
  return {
    plants: modules.plants?.data.plants.length ?? 0, whatsappDrafts: modules.whatsapp?.data.draft ? 1 : 0, activities: modules.activities?.data.length ?? 0,
    ...coffeeCounts(modules), ...gameCounts(modules), ...timeCounts(modules), ...pianoCounts(modules), ...readingCounts(modules),
  };
}
