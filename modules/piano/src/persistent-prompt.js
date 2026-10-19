import { LESSONS, createRecallPrompt } from './js/music/learning-path.js';

function seededRandom(text) {
  let value = 2166136261;
  for (const character of text) value = Math.imul(value ^ character.charCodeAt(0), 16777619);
  return () => {
    value = Math.imul(value ^ (value >>> 16), 2246822507);
    value = Math.imul(value ^ (value >>> 13), 3266489909);
    return ((value ^ (value >>> 16)) >>> 0) / 4294967296;
  };
}
function one(pool, random) { return [pool[Math.floor(random() * pool.length)]]; }
export function lessonFor(id) {
  const lesson = LESSONS.find(item => item.id === id);
  if (!lesson) throw new Error('Unknown piano lesson.');
  return lesson;
}
export function persistentPrompt(practice, index = practice.promptIndex) {
  const lesson = lessonFor(practice.lessonId);
  const kind = lesson.recall.kind;
  if (!['interval', 'chord', 'ninth'].includes(kind)) return createRecallPrompt(lesson, index);
  const random = seededRandom(`${practice.id}:${index}`);
  const recall = { ...lesson.recall };
  for (const key of ['semitones', 'chordTypes', 'degrees']) {
    if (Array.isArray(recall[key])) recall[key] = one(recall[key], random);
  }
  return createRecallPrompt({ ...lesson, roots: one(lesson.roots, random), recall }, index);
}
