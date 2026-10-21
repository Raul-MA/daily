import { allocateSessionSeconds } from '../practice-allocation.js';
import { copy } from '../../../i18n.js';
import { createDailyState } from '../../../../../../packages/data/src/daily-state.js';
import { connectPiano } from '../../../service.js';
import { practiceSnapshot } from '../../../practice-clock.js';
import { LESSONS } from '../../music/learning-path.js';
import { pianoContext } from '../../context.js';

function ephemeralService() {
  const values = new Map();
  return connectPiano(createDailyState({ getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) }));
}
function documentKey(context) { return JSON.stringify(context.service.read()); }
export function synchronize(context) {
  const practice = practiceSnapshot(context.persisted, Date.now());
  if (!practice) return;
  Object.assign(context, {
    minutes: practice.minutes, piano: practice.piano, budgets: practice.budgets, block: practice.block,
    elapsed: practice.elapsedMs / 1000, blockElapsed: practice.blockElapsedMs.map(value => value / 1000),
    paused: practice.status === 'paused', auto: practice.auto, pace: practice.pace, revealed: practice.revealed,
    promptElapsed: (practice.promptElapsedMs + context.pacingDelta) / 1000, prompt: practice.prompt, promptIndex: practice.promptIndex,
    applicationIndex: practice.applicationIndex, lessonIndex: LESSONS.findIndex(item => item.id === practice.lessonId),
  });
}
function assertFresh(context) {
  const expected = documentKey(context);
  if (expected !== context.expected) throw new Error('Data changed in another view. Your draft has been kept.');
  for (const form of context.container.querySelectorAll('form[data-unsaved="true"]')) {
    if (form.dataset.expected !== expected) throw new Error('Data changed in another view. Your draft has been kept.');
  }
}
export function stamp(context) {
  const setup = context.container.querySelector('.practice-setup');
  if (setup) setup.id = 'piano-setup';
  for (const form of context.container.querySelectorAll('form')) form.dataset.expected = context.expected;
  document.dispatchEvent(new Event('daily:form-state'));
}
export function commitPractice(context, action, input) {
  assertFresh(context);
  const presentation = context.promptElapsed * 1000;
  const result = context.service[action](input ?? presentation);
  context.pacingDelta = 0;
  context.lastTime = Date.now();
  context.expected = documentKey(context);
  context.persisted = context.service.read().practice;
  synchronize(context);
  stamp(context);
  return result;
}
export function showError(context, error) {
  let alert = context.container.querySelector('[data-piano-error]');
  if (!alert) {
    alert = document.createElement('p');
    alert.dataset.pianoError = '';
    alert.setAttribute('role', 'alert');
    context.container.append(alert);
  }
  alert.textContent = copy(error.message);
}
function offerExisting(context, practice) {
  if (!practice || practice.lessonId === context.lesson().id) return false;
  context.container.innerHTML = copy(`<h1>${copy("Practice already in progress")}</h1><p data-piano-existing>${copy("Your current practice has been kept.")}</p><a class="btn btn-primary" data-piano-resume>${copy("Resume practice")}</a>`);
  context.container.querySelector('a').href = `${pianoContext.base}#/piano/learn?lesson=${encodeURIComponent(practice.lessonId)}`;
  return true;
}
export function preparePersistence(context) {
  const mounted = context.container.closest('[data-module="piano"]');
  context.service = mounted && pianoContext.service ? pianoContext.service : ephemeralService();
  context.expected = documentKey(context);
  const data = context.service.read();
  context.persisted = data.practice;
  context.minutes = data.settings.minutes;
  context.piano = data.settings.piano;
  context.budgets = allocateSessionSeconds(data.settings.minutes);
  context.commitPractice = (action, input) => commitPractice(context, action, input);
  if (offerExisting(context, context.persisted)) return false;
  if (context.persisted) {
    context.phase = 'session';
    synchronize(context);
    context.interval = setInterval(context.tick, 200);
  }
  return true;
}
