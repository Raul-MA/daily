import { copy } from './copy.js';
import { listen } from './events.js';
import { navigate } from './router.js';
import { applyResult } from './applyResult.js';
import { reopenSession } from '../../backend/features/sessions.js';
import { getState } from './state.js';

export function bindGameDetail() {
  listen("[data-action='back-history']", "click", () => navigate("history"));
  listen(".game-detail [data-action='edit-session']", "click", (event) => {
    if (!window.confirm(copy("Edit this completed session? Stats will change."))) return;
    applyResult(reopenSession(getState(), event.currentTarget.dataset.id), "Session reopened.");
    navigate("session");
  });
}
