import { getKeyboardVoicing, noteToIndex } from './js/music/notes.js';

function validOffset(value) { return Number.isSafeInteger(value) && Math.abs(value) <= 127; }
function validTone(tone) {
  if (!tone || typeof tone !== 'object' || noteToIndex(tone.note) === null) return false;
  if (tone.semitones !== undefined && !validOffset(tone.semitones)) return false;
  return tone.octave === undefined || Number.isInteger(tone.octave);
}
function validKeyboard(value) {
  if (!value || !Array.isArray(value.tones) || value.tones.length > 128) return false;
  if (!value.tones.every(validTone)) return false;
  if (value.root !== undefined && noteToIndex(value.root) === null) return false;
  try {
    getKeyboardVoicing(value.tones, value);
    return true;
  } catch {
    return false;
  }
}
export function validPrompt(value) {
  return Boolean(value && typeof value.question === 'string' && typeof value.answer === 'string' && validKeyboard(value.keyboard));
}
