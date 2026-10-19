import { movePrompt } from './practice-clock.js';

export function practiceActions(service) {
  function change(transform, promptElapsedMs) {
    const data = service.read();
    const practice = service.snapshot();
    if (!practice) throw new Error('No active piano practice.');
    return service.save({ ...data, practice: transform({ ...practice, promptElapsedMs: promptElapsedMs ?? practice.promptElapsedMs }) }).practice;
  }
  function pause(promptElapsedMs) { return change(practice => ({ ...practice, status: 'paused', resumedAt: null }), promptElapsedMs); }
  function resume(promptElapsedMs) { return change(practice => ({ ...practice, status: 'running', resumedAt: service.clock() }), promptElapsedMs); }
  function setBlock(block) {
    if (!Number.isInteger(block) || block < 0 || block > 3) throw new Error('Invalid practice block.');
    return change(practice => ({ ...practice, block, revealed: false, promptElapsedMs: 0 }));
  }
  function configurePacing(input) {
    if (!Number.isInteger(input.pace) || input.pace < 1 || input.pace > 300 || typeof input.auto !== 'boolean') throw new Error('Invalid pace; choose 1–300 whole seconds.');
    return change(practice => ({ ...practice, auto: input.auto, pace: input.pace, promptElapsedMs: 0 }));
  }
  function finishSession() {
    const data = service.read();
    const practice = service.snapshot();
    if (!practice) return null;
    const { id, lessonId, minutes, piano, startedAt, elapsedMs, blockElapsedMs } = practice;
    const record = { id, lessonId, minutes, piano, startedAt, elapsedMs, blockElapsedMs, completedAt: service.clock() };
    service.save({ ...data, practice: null, history: [...data.history, record] });
    return record;
  }
  return { pause, resume, setBlock, configurePacing, finishSession, nextPrompt: () => change(movePrompt), reveal: promptElapsedMs => change(practice => ({ ...practice, revealed: true }), promptElapsedMs) };
}
