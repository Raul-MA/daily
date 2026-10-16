import { createModuleStore } from '../../../packages/data/src/module-store.js';
import { DataConflictError } from '../../../packages/data/src/errors.js';
import { validateActivities } from '../../../packages/platform/src/activity-types.js';
import { allocateSessionSeconds } from './js/components/practice-allocation.js';
import { DESTINATIONS } from './js/components/navigation-data.js';
import { initialPiano, validPiano, validExercise } from './validation.js';
import { lessonFor, persistentPrompt } from './persistent-prompt.js';
import { practiceSnapshot } from './practice-clock.js';
import { synchronizePianoActivities } from './activity-sync.js';
import { practiceActions } from './service-actions.js';

const revision = Symbol('piano document revision');
function fingerprint(root) { return JSON.stringify(root.modules.piano ?? null); }
function newPractice(input, now) {
  lessonFor(input.lessonId);
  const budgets = allocateSessionSeconds(input.minutes);
  const record = {
    id: crypto.randomUUID(), lessonId: input.lessonId, minutes: input.minutes, piano: input.piano,
    budgets, startedAt: now, status: 'running', resumedAt: now, elapsedMs: 0, blockElapsedMs: [0, 0, 0, 0],
    block: 0, promptIndex: 0, applicationIndex: 0, promptElapsedMs: 0, auto: false, pace: 30, revealed: false,
  };
  return { ...record, prompt: persistentPrompt(record) };
}
export function connectPiano(state, clock = () => Date.now()) {
  const store = createModuleStore(state, { id: 'piano', version: 1, initial: initialPiano, validate: validPiano });
  const activities = createModuleStore(state, { id: 'activities', version: 1, initial: () => [], validate: validateActivities });
  function read() { return { ...store.read(), [revision]: fingerprint(state.read().value) }; }
  function save(data) {
    const normalized = JSON.parse(JSON.stringify(data));
    if (!validPiano(normalized)) throw new Error('Invalid piano data.');
    state.commit(current => {
      store.read();
      if (data[revision] !== fingerprint(current)) throw new DataConflictError();
      const running = synchronizePianoActivities(activities.read(), normalized, clock());
      return { ...current, modules: { ...current.modules, piano: { version: 1, data: normalized }, activities: { version: 1, data: running } } };
    });
    return read();
  }
  function snapshot() { return practiceSnapshot(read().practice, clock()); }
  function startSession(input) {
    const data = read();
    if (data.practice) return snapshot();
    const practice = newPractice(input, clock());
    save({ ...data, practice, settings: { minutes: input.minutes, piano: input.piano } });
    return practice;
  }
  function openExercise(id) {
    if (!validExercise(id)) throw new Error('Unknown piano exercise.');
    const data = read();
    if (data.lastExerciseId !== id) save({ ...data, lastExerciseId: id });
  }
  function pickExercise(random = Math.random) {
    const pool = DESTINATIONS.filter(item => item.activity === 'practice');
    const index = Math.floor(random() * pool.length);
    if (!pool[index]) throw new Error('Invalid random piano exercise selection.');
    return pool[index].id;
  }
  return { read, save, snapshot, startSession, openExercise, pickExercise, stop: () => undefined, ...practiceActions({ read, save, snapshot, clock }) };
}
