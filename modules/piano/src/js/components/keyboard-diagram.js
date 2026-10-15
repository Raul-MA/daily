import { getChromaticNotes, noteToIndex, noteToMidi } from '../music/notes.js';

const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
const chromatic = getChromaticNotes();
function optionsWithDefaults(options = {}) {
  const { notes = [], startOctave = 4, octaves = 1, range, keyLabels = 'highlighted', showLegend = true, label = 'Piano keyboard' } = options;
  return { notes, startOctave, octaves, range, keyLabels, showLegend, label };
}
function validDefaultRange(options) {
  return Number.isInteger(options.startOctave) && Number.isInteger(options.octaves) && options.octaves >= 1 && options.octaves <= 8 && options.startOctave >= -1 && options.startOctave + options.octaves <= 9;
}
function spanFor(options) {
  if (options.range) return { first: noteToMidi(options.range.start?.note, options.range.start?.octave), end: noteToMidi(options.range.end?.note, options.range.end?.octave) + 1 };
  const first = (options.startOctave + 1) * 12;
  return { first, end: first + options.octaves * 12 };
}
function validateSpan(span) {
  if (span.first < 0 || span.end > 128 || span.end <= span.first || chromatic[span.first % 12].includes('#') || chromatic[(span.end - 1) % 12].includes('#')) throw new RangeError('Keyboard range must run from a white key to a later white key within MIDI 0–127');
}
function normalizedTone(value, span) {
  const tone = typeof value === 'string' ? { note: value } : value;
  if (!tone || noteToIndex(tone.note) === null) throw new TypeError('Keyboard contains an invalid note');
  const midi = tone.octave === undefined ? null : noteToMidi(tone.note, tone.octave);
  if (midi !== null && (midi < span.first || midi >= span.end)) throw new RangeError('Keyboard note is outside the displayed range');
  return { ...tone, pitch: noteToIndex(tone.note), midi };
}
function showKeyLabel(mode, selected) { return mode === 'all' || (mode === 'highlighted' && selected.length > 0); }
function keyText(selected, note, octave) {
  if (!selected.length) return `${note}${octave}`;
  return [...new Set(selected.map(tone => `${tone.note}${tone.octave ?? ''}`))].join('/');
}
function keyMarkup(key) {
  const { midi, note, octave, selected, black, position } = key;
  const role = selected[0]?.role || 'tone';
  const text = keyText(selected, note, octave);
  return `<span class="keyboard-key${black ? ' is-black' : ''}${selected.length ? ' is-selected' : ''}" data-midi="${midi}" data-note="${note}" data-octave="${octave}"${selected.length ? ` data-role="${escapeHTML(role)}"` : ''}${position}>${selected.length ? '<span class="keyboard-marker">●</span>' : ''}${key.showLabel ? `<span class="keyboard-key-label">${escapeHTML(text)}</span>` : ''}</span>`;
}
function renderKeys(span, tones, options) {
  const pitches = Array.from({ length: span.end - span.first }, (_, index) => span.first + index);
  const whiteCount = pitches.filter(midi => !chromatic[midi % 12].includes('#')).length;
  const blackWidth = 0.56 / whiteCount * 100;
  let whiteKeys = 0;
  const keys = pitches.map(midi => {
    const pitch = midi % 12;
    const note = chromatic[pitch];
    const octave = Math.floor(midi / 12) - 1;
    const selected = tones.filter(tone => tone.midi === null ? tone.pitch === pitch : tone.midi === midi);
    const black = note.includes('#');
    const position = black ? ` style="left:${whiteKeys / whiteCount * 100 - blackWidth / 2}%;width:${blackWidth}%"` : '';
    if (!black) whiteKeys++;
    return keyMarkup({ midi, note, octave, selected, black, position, showLabel: showKeyLabel(options.keyLabels, selected) });
  });
  return { html: keys.join(''), whiteCount };
}
function legendHTML(tones) {
  return tones.map(tone => {
    const description = tone.label ?? tone.degree;
    const note = `${tone.note}${tone.octave ?? ''}`;
    return `<span${tone.role ? ` data-role="${escapeHTML(tone.role)}"` : ''}>${description ? `${escapeHTML(description)}: ` : ''}${escapeHTML(note)}</span>`;
  }).join(' ');
}
function rangeDescription(options, span, tones) {
  const exact = tones.some(tone => tone.octave !== undefined);
  if (exact || options.range) return `Keyboard range ${chromatic[span.first % 12]}${Math.floor(span.first / 12) - 1}–${chromatic[(span.end - 1) % 12]}${Math.floor((span.end - 1) / 12) - 1}. Octave numbers mark exact keys; notes without them repeat.`;
  const octaves = options.octaves === 1 ? 'one octave (C–B)' : `${options.octaves} octaves`;
  return `Keyboard positions in ${octaves}; notes without octave numbers repeat in each octave.`;
}
export function drawKeyboard(input = {}) {
  const options = optionsWithDefaults(input);
  if (!Array.isArray(options.notes)) throw new TypeError('Keyboard notes must be an array');
  if (!options.range && !validDefaultRange(options)) throw new RangeError('Keyboard range must contain 1–8 complete octaves between C−1 and B8');
  if (!['none', 'highlighted', 'all'].includes(options.keyLabels)) throw new TypeError('Unknown keyboard label mode');
  const span = spanFor(options);
  validateSpan(span);
  const tones = options.notes.map(value => normalizedTone(value, span));
  const keys = renderKeys(span, tones, options);
  return `<figure class="keyboard-diagram" aria-label="${escapeHTML(options.label)}" data-octaves="${Math.ceil((span.end - span.first) / 12)}" style="--keyboard-white-count:${keys.whiteCount};--keyboard-min-width:${Math.max(160, keys.whiteCount * 32)}px">
    <div class="keyboard-scroll" tabindex="0" role="region" aria-label="${escapeHTML(options.label)} — scroll to explore the keys">
      <div class="keyboard-keys" aria-hidden="true">${keys.html}</div>
    </div>
    <figcaption class="keyboard-legend${options.showLegend ? '' : ' sr-only'}"><strong class="keyboard-caption">${escapeHTML(options.label)}</strong>${legendHTML(tones)}<small>${rangeDescription(options, span, tones)}</small></figcaption>
  </figure>`;
}
export function buildKeyboardDiagramHTML(tones = [], options = {}) { return drawKeyboard({ ...options, notes: tones }); }
