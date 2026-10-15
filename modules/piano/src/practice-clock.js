import { persistentPrompt, lessonFor } from './persistent-prompt.js';

export function hasPrompts(practice) {
  return practice.block === 1 || (practice.block === 2 && Boolean(lessonFor(practice.lessonId).application.sequence?.length));
}
export function practiceSnapshot(practice, now) {
  if (!practice) return null;
  const delta = practice.status === 'running' ? Math.max(0, now - practice.resumedAt) : 0;
  const snapshot = {
    ...structuredClone(practice), elapsedMs: practice.elapsedMs + delta,
    resumedAt: practice.status === 'running' ? now : null,
    blockElapsedMs: practice.blockElapsedMs.map((elapsed, index) => elapsed + (index === practice.block ? delta : 0)),
  };
  if (snapshot.auto && hasPrompts(snapshot)) advancePacing(snapshot, delta);
  return snapshot;
}
function advancePacing(snapshot, delta) {
  const elapsed = snapshot.promptElapsedMs + delta;
  const steps = Math.floor(elapsed / (snapshot.pace * 1000));
  snapshot.promptElapsedMs = elapsed % (snapshot.pace * 1000);
  if (!steps) return;
  snapshot.revealed = false;
  if (snapshot.block === 1) {
    snapshot.promptIndex += steps;
    snapshot.prompt = persistentPrompt(snapshot);
  } else snapshot.applicationIndex += steps;
}
export function movePrompt(practice) {
  if (!hasPrompts(practice)) throw new Error('No prompts in this practice block.');
  const snapshot = { ...practice, revealed: false, promptElapsedMs: 0 };
  if (snapshot.block === 1) {
    snapshot.promptIndex++;
    snapshot.prompt = persistentPrompt(snapshot);
  } else snapshot.applicationIndex++;
  return snapshot;
}
