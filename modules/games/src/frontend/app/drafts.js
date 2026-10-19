import { copy } from './copy.js';
import { gameUI } from './context.js';
import { getRoute } from './router.js';
import { getState } from './state.js';
import { updateScorePreview } from './updateScorePreview.js';
import { DataConflictError } from '../../../../../packages/data/src/errors.js';

function wrap(selector, id) {
  const node = gameUI.host.querySelector(selector);
  if (!node) return;
  const form = document.createElement('form');
  form.id = id;
  node.before(form);
  form.append(node);
}
function recordStamp(form, data) {
  const identities = { 'player-form': ['players', gameUI.ui.editingPlayerId], 'game-form': ['games', gameUI.ui.editingGameId] };
  const identity = identities[form.id];
  if (!identity?.[1]) return;
  form.dataset.recordCollection = identity[0];
  form.dataset.recordId = identity[1];
  form.dataset.expectedRecord = JSON.stringify(data[identity[0]].find(record => record.id === identity[1]) ?? null);
}
export function prepareForms() {
  if (getRoute() === 'play') wrap('.workspace > .ledger-block', 'games-setup');
  if (getRoute() === 'session') wrap('.workspace > .session-view', 'games-session');
  const data = getState();
  for (const form of gameUI.host.querySelectorAll('form')) {
    form.id ||= form.dataset.testid;
    recordStamp(form, data);
    if (form.id === 'games-session') form.dataset.expectedSession = JSON.stringify(data.sessions.find(session => session.status === 'active'));
    form.addEventListener('submit', event => event.preventDefault());
  }
  gameUI.host.querySelector('h1')?.setAttribute('tabindex', '-1');
}
export function clearDrafts() {
  for (const form of gameUI.host.querySelectorAll('form')) form.dataset.unsaved = 'false';
}
export function checkDraft(event) {
  const form = event.target.closest('form');
  if (!form) return;
  const data = getState();
  if (event.type === 'submit') checkRecord(form, data);
  if (form.id !== 'games-session' || !mutatesSession(event)) return;
  const active = data.sessions.find(session => session.status === 'active');
  if (JSON.stringify(active) !== form.dataset.expectedSession) throw new DataConflictError();
}
function checkRecord(form, data) {
  if (!form.dataset.recordId) return;
  const current = data[form.dataset.recordCollection].find(record => record.id === form.dataset.recordId) ?? null;
  if (JSON.stringify(current) !== form.dataset.expectedRecord) throw new DataConflictError();
}
function mutatesSession(event) {
  if (['change', 'blur'].includes(event.type)) return true;
  if (event.type === 'keydown') return event.key === 'Enter';
  return event.type === 'click' && Boolean(event.target.closest('button'));
}
export function restored() {
  for (const input of gameUI.host.querySelectorAll('[data-testid=score-input]')) updateScorePreview(input);
}
export function conflict() {
  gameUI.host.querySelector('[data-game-conflict]')?.remove();
  const alert = document.createElement('p');
  alert.dataset.gameConflict = '';
  alert.setAttribute('role', 'alert');
  alert.textContent = gameUI.host.lang === 'es' ? 'Los datos han cambiado. Conserva tu borrador y vuelve a abrir la vista.' : copy("Data changed. Keep your draft and reopen this view.");
  gameUI.host.append(alert);
}
