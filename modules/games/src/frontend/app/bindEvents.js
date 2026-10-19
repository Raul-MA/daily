import { gameUI } from './context.js';
import { guard, listen } from './events.js';
import { navigate } from './router.js';
import { dismissToast } from './dismissToast.js';
import { bindPlay } from './bindPlay.js';
import { bindSession } from './bindSession.js';
import { bindHistory } from './bindHistory.js';
import { bindGameDetail } from './bindGameDetail.js';
import { bindPlayers } from './bindPlayers.js';
import { bindGames } from './bindGames.js';
import { bindStats } from './bindStats.js';
import { bindSettings } from './bindSettings.js';

export function bindEvents() {
  gameUI.app.querySelectorAll("[data-route]").forEach((button) => {
    button.addEventListener("click", guard(() => navigate(button.dataset.route)));
  });
  listen("[data-action='dismiss-toast']", "click", dismissToast);
  listen("[data-action='resume']", "click", () => navigate("session"));
  listen("[data-action='go-play']", "click", () => navigate("play"));

  bindPlay();
  bindSession();
  bindHistory();
  bindGameDetail();
  bindPlayers();
  bindGames();
  bindStats();
  bindSettings();
}
