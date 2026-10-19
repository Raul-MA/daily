import { connectDailyBackups } from '../backup/service.js';
import { connectWhatsApp } from '../../../../modules/whatsapp/src/service.js';
import { connectReading } from '../../../../modules/reading/src/service.js';
import { connectPiano } from '../../../../modules/piano/src/service.js';
import { connectTimeBudget } from '../../../../modules/time-budget/src/service.js';
import { connectPlants } from '../../../../modules/plants/src/service.js';
import { connectCoffee } from '../../../../modules/coffee/src/service.js';
import { connectGames } from '../../../../modules/games/src/service.js';

export function connectModules(state) {
  const services = { whatsapp: connectWhatsApp(state), reading: connectReading(state, { installed: window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true }), piano: connectPiano(state), timeBudget: connectTimeBudget(state), plants: connectPlants(state), coffee: connectCoffee(state), games: connectGames(state) };
  return { ...services, backups: connectDailyBackups(state, { afterRestore: services.reading.releaseCredentials }) };
}
export function stopModules(context) {
  for (const name of ['plants', 'coffee', 'games', 'timeBudget', 'piano', 'reading', 'whatsapp']) context[name].stop();
}
