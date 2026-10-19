import { filledState } from '../fixtures/backup-data.mjs';
import { widgetIds, quickIds } from '../../packages/data/src/daily-document.js';
import { connectTimeBudget } from '../../modules/time-budget/src/service.js';
import { connectGames } from '../../modules/games/src/service.js';
import { finishSession, startSession } from '../../modules/games/src/backend/features/sessions.js';

function gameHistory(state) {
  const games = connectGames(state);
  finishSession(games.read(), games.read().sessions[0].id);
  const data = games.read();
  startSession(data, { gameId: data.games[0].id, playerIds: data.players.map(player => player.id) });
  games.stop();
}

export async function widthFixture() {
  const fixture = await filledState();
  gameHistory(fixture.state);
  fixture.state.updatePreferences({ language: 'en', widgets: widgetIds, quickActions: quickIds });
  fixture.state.commit(root => ({ ...root, modules: { ...root.modules, coffee: {
    ...root.modules.coffee, data: { ...root.modules.coffee.data, settings: { ...root.modules.coffee.data.settings, toolsConfigured: true } },
  } } }));
  const active = fixture.state.read().value;
  const lesson = structuredClone(active);
  lesson.modules.piano.data.practice = null;
  const tools = structuredClone(active);
  tools.modules.coffee.data.settings.toolsConfigured = false;
  const time = connectTimeBudget(fixture.state);
  time.save({ ...time.read(), session: null });
  time.stop();
  return { active, lesson, setup: fixture.state.read().value, tools };
}
