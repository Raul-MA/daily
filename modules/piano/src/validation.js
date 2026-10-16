import { LESSONS } from './js/music/learning-path.js';
import { DESTINATIONS } from './js/components/navigation-data.js';
import { allocateSessionSeconds } from './js/components/practice-allocation.js';

function nonnegative(value) { return Number.isFinite(value) && value >= 0; }
function id(value) { return typeof value === 'string' && value.trim().length > 0 && value.length <= 400; }
export function validLesson(value) { return LESSONS.some(item => item.id === value); }
export function validExercise(value) { return DESTINATIONS.some(item => item.id === value && item.activity === 'practice'); }
export function validMinutes(value) { return Number.isInteger(value) && value >= 3 && value <= 120; }
function validBlocks(value) { return Array.isArray(value) && value.length === 4 && value.every(nonnegative); }
function validBasics(value) {
  return Boolean(value && id(value.id) && validLesson(value.lessonId) && validMinutes(value.minutes) && typeof value.piano === 'boolean' && nonnegative(value.startedAt));
}
function validPrompt(value) { return Boolean(value && typeof value.question === 'string' && typeof value.answer === 'string' && value.keyboard && Array.isArray(value.keyboard.tones)); }
function validPacing(value) {
  return typeof value.auto === 'boolean' && typeof value.revealed === 'boolean'
    && Number.isInteger(value.pace) && value.pace >= 1 && value.pace <= 300 && nonnegative(value.promptElapsedMs);
}
function validIndices(value) { return [value.block, value.promptIndex, value.applicationIndex].every(index => Number.isSafeInteger(index) && index >= 0) && value.block <= 3; }
export function validPractice(value) {
  if (value === null) return true;
  if (!validPracticeBasics(value)) return false;
  if (!validIndices(value) || !validPacing(value) || !validPrompt(value.prompt)) return false;
  if (JSON.stringify(value.budgets) !== JSON.stringify(allocateSessionSeconds(value.minutes))) return false;
  return validStatus(value);
}
function validPracticeBasics(value) { return validBasics(value) && nonnegative(value.elapsedMs) && validBlocks(value.blockElapsedMs); }
function validStatus(value) {
  if (value.status === 'paused') return value.resumedAt === null;
  return value.status === 'running' && nonnegative(value.resumedAt);
}
function validHistory(value) { return validBasics(value) && nonnegative(value.completedAt) && nonnegative(value.elapsedMs) && validBlocks(value.blockElapsedMs); }
export function initialPiano() { return { lastExerciseId: null, practice: null, history: [], settings: { minutes: 10, piano: true } }; }
function validSettings(value) { return Boolean(value && validMinutes(value.minutes) && typeof value.piano === 'boolean'); }
export function validPiano(value) {
  if (!value || !validPractice(value.practice) || !validSettings(value.settings)) return false;
  return validIdentity(value);
}
function validIdentity(value) {
  if (value.lastExerciseId !== null && !validExercise(value.lastExerciseId)) return false;
  if (!Array.isArray(value.history) || !value.history.every(validHistory)) return false;
  const ids = value.history.map(item => item.id);
  if (value.practice) ids.push(value.practice.id);
  return new Set(ids).size === ids.length;
}
