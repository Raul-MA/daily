import { createDailyState } from '../../packages/data/src/daily-state.js';
import { createActivities } from '../../packages/platform/src/activities.js';
import { connectCoffee } from '../../modules/coffee/src/service.js';
import { createBeanPreset } from '../../modules/coffee/src/backend/features/beans.js';
import { createEntry } from '../../modules/coffee/src/backend/features/entries.js';
import { connectGames } from '../../modules/games/src/service.js';
import { createPlayer } from '../../modules/games/src/backend/features/players.js';
import { createGame } from '../../modules/games/src/backend/features/games.js';
import { startSession } from '../../modules/games/src/backend/features/sessions.js';
import { connectTimeBudget } from '../../modules/time-budget/src/service.js';
import { connectPiano } from '../../modules/piano/src/service.js';
import { connectReading } from '../../modules/reading/src/service.js';
import { connectWhatsApp } from '../../modules/whatsapp/src/service.js';

export const NOW = 1792065600000;
export function memoryState() {
  const values = new Map();
  const writes = [];
  const storage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => { writes.push(key); values.set(key, value); }, removeItem: key => values.delete(key) };
  return { values, writes, storage, state: createDailyState(storage) };
}
function coffee(state) {
  const service = connectCoffee(state);
  try {
    const bean = createBeanPreset({ brand: 'Café ☕', blend: 'Casa', decaf: false });
    createEntry({ meta: { beanPresetId: bean.id }, brew: { yieldUnit: 'g', yieldValue: 36 }, grind: { doseG: 18 } });
  } finally { service.stop(); }
}
function games(state) {
  const service = connectGames(state);
  try {
    let data = createPlayer(service.read(), { name: 'Ada 🌱' }).data;
    data = createPlayer(data, { name: 'Grace' }).data;
    data = createGame(data, { name: 'Azul', scoringMode: 'highest_score_after_rounds', roundCount: 3 }).data;
    startSession(data, { gameId: data.games[0].id, playerIds: data.players.map(player => player.id) });
  } finally { service.stop(); }
}
function plants(state) {
  const plant = { id: 'plant-one', name: 'Monstera 🌿', dateAdded: '2026-01-01T12:00:00Z', schedule: { wateringIntervalDays: 7 }, careLog: [{ id: 'water-one', type: 'watering', date: '2026-01-02T12:00:00Z', note: '你好' }] };
  const data = { plants: [plant], things: { enabled: false, project: '' }, backup: { lastExportAt: null, changesSinceExport: 0, lastReminderAt: null }, storage: { persistenceRequested: false, persistent: false, checkedAt: null } };
  state.commit(root => ({ ...root, modules: { ...root.modules, plants: { version: 1, data } } }));
}
function timing(state) {
  const service = connectTimeBudget(state);
  service.save({ ...service.read(), templates: { Mañana: [{ name: 'Café', minutes: 5 }] }, session: {
    id: 'budget-one', goalTime: '13:00', startTime: NOW - 1500000, currentTaskIndex: 0,
    timerRunning: true, timerStartTime: NOW - 1200000, timerElapsed: 0,
    tasks: [{ id: 1, name: 'Focus 🌱', allocatedMinutes: 5, actualMinutes: null, status: 'active' }],
  } });
  connectPiano(state, () => NOW - 600000).startSession({ lessonId: 'interval-foundations', minutes: 3, piano: true });
  createActivities(state, () => NOW - 120000).start({ id: 'tea', kind: 'countdown', reference: 'tea', label: 'Té ☕', durationMs: 60000 });
}
async function reading(fixture) {
  const service = connectReading(fixture.state, { storage: fixture.storage, now: () => NOW, fetch: async () => ({ ok: true, status: 200, json: async () => ({ results: [{ id: 'read-one', title: 'A saved read', url: 'https://read.readwise.io/read/read-one', location: 'new', reading_time: '5 mins', reading_progress: 0 }], nextPageCursor: null }) }) });
  service.setToken('fixture-private-token');
  const data = service.read();
  service.save({ ...data, settings: { ...data.settings, rememberLastItem: true } });
  await service.pick();
  service.remember(service.read().picks.documents[0]);
  service.stop();
}
export async function filledState() {
  const fixture = memoryState();
  coffee(fixture.state);
  games(fixture.state);
  plants(fixture.state);
  timing(fixture.state);
  await reading(fixture);
  const whatsapp = connectWhatsApp(fixture.state);
  whatsapp.saveDraft({ recipient: 'Amigos 👋', date: '2020-01-01', time: '09:00', message: '你好\nCafé + 100%' }, whatsapp.read());
  fixture.state.updatePreferences({ language: 'es', widgets: ['reader', 'plants', 'activities'], quickActions: ['coffee'] });
  return { ...fixture, root: fixture.state.read().value };
}
