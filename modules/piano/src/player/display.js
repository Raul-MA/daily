import { drawKeyboard } from '../js/components/keyboard-diagram.js';
import { getChromaticNotes } from '../js/music/notes.js';
import { soundingEvents, positionLabel, tempoAt } from './timing.js';
import { escape, text } from './html.js';

function toneFor(note, exercise) {
  const track = exercise.tracks.find(item => item.id === note.trackId);
  const finger = note.fingering ? ` · ${text('Fingering')} ${escape(note.fingering)}` : '';
  return { note: getChromaticNotes()[note.pitch % 12], octave: Math.floor(note.pitch / 12) - 1, role: exercise.tracks[0].id === note.trackId ? 'source' : 'target', label: `${track.name}${note.accent ? ' · ' + text('Accent') : ''}${finger}` };
}
function keyboardRange(variant) {
  const pitches = variant.notes.map(note => note.pitch);
  const min = Math.min(60, ...pitches); const max = Math.max(72, ...pitches);
  const names = getChromaticNotes();
  let start = min; let end = max;
  while (names[start % 12].includes('#')) start--;
  while (names[end % 12].includes('#')) end++;
  return { start: { note: names[start % 12], octave: Math.floor(start / 12) - 1 }, end: { note: names[end % 12], octave: Math.floor(end / 12) - 1 } };
}
export function displayFrame(ctx, snapshot) {
  const { container, exercise, variant, settings } = ctx;
  const tpq = exercise.ticksPerQuarter ?? 960;
  const position = positionLabel(variant, snapshot.tick, tpq);
  const status = container.querySelector('[data-player-status]');
  const tempo = tempoAt(variant, snapshot.tick) * snapshot.speed;
  const summary = `${phaseLabel(snapshot)} · ${text('Repetition')} ${snapshot.repetition} · ${Math.round(snapshot.speed * 100)}% · ♩ = ${tempo.toFixed(1)} ${text('quarter notes/min')}`;
  if (status.textContent !== summary) status.textContent = summary;
  container.querySelector('[data-player-position]').textContent = `${text('Measure')} ${position.measure.label} · ${text('Beat')} ${position.beat} ${position.subdivision} · ${Math.floor(snapshot.tick)} ${text('ticks')}`;
  const active = snapshot.phase === 'playing' ? soundingEvents(variant, 0, variant.lengthTicks).filter(note => note.startTick <= snapshot.tick && note.endTick > snapshot.tick && !settings.tracks[note.trackId]?.mute && (settings.tracks[note.trackId]?.volume ?? 1) > 0) : [];
  updateKeyboard(ctx, active);
  const cursor = container.querySelector('[data-player-cursor]');
  if (cursor) cursor.style.left = `${snapshot.tick / variant.lengthTicks * 100}%`;
}
function phaseLabel(snapshot) { return snapshot.phase === 'count-in' ? `${text('Count-in')} ${snapshot.countBeat}` : text(snapshot.phase); }
function updateKeyboard(ctx, notes) {
  const signature = notes.map(note => note.id).join(',');
  if (signature === ctx.keySignature) return;
  ctx.keySignature = signature;
  replaceKeyboard(ctx, notes);
  ctx.container.querySelector('[data-player-notes]').textContent = notes.map(note => `${ctx.exercise.tracks.find(track => track.id === note.trackId).name}: ${getChromaticNotes()[note.pitch % 12]}${Math.floor(note.pitch / 12) - 1}${note.accent ? ' · ' + text('Accent') : ''}${note.fingering ? ' · ' + text('Fingering') + ' ' + note.fingering : ''}`).join(' | ');
}
function replaceKeyboard(ctx, notes) {
  const host = ctx.container.querySelector('[data-player-keyboard]');
  const previous = host.querySelector('.keyboard-scroll');
  const left = previous?.scrollLeft ?? 0;
  const focused = previous === document.activeElement;
  host.innerHTML = drawKeyboard({ notes: notes.map(note => toneFor(note, ctx.exercise)), range: keyboardRange(ctx.variant), label: 'Sounding notes' });
  const scroll = host.querySelector('.keyboard-scroll'); scroll.scrollLeft = left;
  if (focused) scroll.focus({ preventScroll: true });
}
export function timeline(exercise, variant, settings) {
  const loop = settings.loop;
  return `<section class="card"><h2>${text('Event timeline')}</h2><p>${text('Select an event to seek. Score attachments are references; no note-level score tracking is implied.')}</p><p>${exercise.tracks.map((track, index) => `${index + 1}: ${escape(track.name)}`).join(' · ')} · &gt; ${text('Accent')}</p><div class="player-timeline" role="group" aria-label="${text('Event timeline')}"><span class="player-loop" style="left:${loop.startTick / variant.lengthTicks * 100}%;width:${(loop.endTick - loop.startTick) / variant.lengthTicks * 100}%"></span>${variant.notes.map(note => timelineNote(exercise, variant, note)).join('')}<span data-player-cursor></span></div><div data-player-keyboard></div><p data-player-notes></p><p>${(variant.subdivisionRegions ?? []).map(region => `${region.startTick}–${region.endTick}: ${escape(region.labels.join('-'))} (${region.stepTicks} ${text('ticks')})`).join(' · ')}</p></section>`;
}
function timelineNote(exercise, variant, note) {
  const track = exercise.tracks.findIndex(item => item.id === note.trackId);
  return `<button type="button" data-seek-tick="${note.startTick}" class="player-event player-track-${track % 2}" style="left:${note.startTick / variant.lengthTicks * 100}%;width:${Math.max(.5, note.durationTicks / variant.lengthTicks * 100)}%;top:${track * 36 + 8}px" title="${escape(exercise.tracks[track].name)}: MIDI ${note.pitch}, ${note.startTick}–${note.startTick + note.durationTicks}${note.accent ? ', Accent' : ''}" aria-label="${escape(exercise.tracks[track].name)} ${escape(note.id)}, MIDI ${note.pitch}, ${note.startTick} ticks${note.accent ? ', Accent' : ''}">${track + 1}${note.accent ? ' >' : ''}</button>`;
}
