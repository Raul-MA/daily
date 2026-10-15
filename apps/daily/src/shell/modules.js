import { connectPlants } from '../../../../modules/plants/src/service.js';
import { connectCoffee } from '../../../../modules/coffee/src/service.js';
import { connectGames } from '../../../../modules/games/src/service.js';

export function connectModules(state) {
  return { plants: connectPlants(state), coffee: connectCoffee(state), games: connectGames(state) };
}
export function stopModules(context) {
  for (const name of ['plants', 'coffee', 'games']) context[name].stop();
}
