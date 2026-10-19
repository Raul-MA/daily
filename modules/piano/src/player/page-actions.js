import { stored } from './library.js';
import { createPianoAudio } from './audio.js';
import { createPlayer } from './transport.js';
import { displayFrame } from './display.js';
import { renderPage } from './page-render.js';
import { inputValue, numberValue, readSettings, correctedExercise, setLoopInputs } from './forms.js';
import { defaults } from './settings.js';
import { download } from './html.js';
import { attachScore } from './score-view.js';
import { scoreFile, attachmentKey } from './attachments.js';

export function stopPlayer(ctx) {
  ctx.playRequest++; ctx.loading = false; ctx.pendingTick = 0;
  ctx.player?.dispose(); ctx.player = null;
  if (ctx.audio) { ctx.audio.dispose().catch(ctx.fail); ctx.audio = null; }
}
async function play(ctx) {
  if (ctx.player) { ctx.player.play(); return; }
  if (ctx.loading) return;
  const request = ++ctx.playRequest;
  const audio = createPianoAudio(); ctx.audio = audio; ctx.loading = true;
  try {
    await audio.prepare(ctx.variant.notes.map(note => note.pitch));
    if (ctx.disposed || request !== ctx.playRequest) return;
    launch(ctx, audio);
  } catch (error) {
    if (request === ctx.playRequest) { stopPlayer(ctx); throw error; }
  } finally { if (request === ctx.playRequest) ctx.loading = false; }
}
function launch(ctx, audio) {
  ctx.player = createPlayer({ audio, exercise: ctx.exercise, variant: ctx.variant, settings: ctx.settings, onError: error => { ctx.fail(error); displayFrame(ctx, ctx.player.snapshot()); }, onFrame: snapshot => displayFrame(ctx, snapshot) });
  if (ctx.pendingTick) ctx.player.seek(ctx.pendingTick);
  ctx.player.play();
}
function pause(ctx) {
  if (ctx.loading) { stopPlayer(ctx); return; }
  ctx.player?.pause();
  if (ctx.player) displayFrame(ctx, ctx.player.snapshot());
}
export function saveSettings(ctx) {
  const settings = readSettings(ctx);
  ctx.library.preferences(ctx.exercise.id, settings);
  ctx.settings = settings; ctx.player?.configure(settings);
  const label = ctx.container.querySelector('[data-player-loop]');
  label.textContent = `${settings.loop.startTick}–${settings.loop.endTick} ticks`;
  const highlight = ctx.container.querySelector('.player-loop');
  highlight.style.left = `${settings.loop.startTick / ctx.variant.lengthTicks * 100}%`;
  highlight.style.width = `${(settings.loop.endTick - settings.loop.startTick) / ctx.variant.lengthTicks * 100}%`;
}
async function deleteExercise(ctx) {
  const id = ctx.exercise.id;
  const attachments = stored(ctx.library.read().attachments, id, []);
  ctx.library.remove(id); stopPlayer(ctx); renderPage(ctx);
  await Promise.all(attachments.map(ref => scoreFile('delete', attachmentKey(id, ref.id))));
}
function measureLoop(ctx) {
  const measures = ctx.variant.measures;
  const startTick = measures.find(item => item.id === inputValue(ctx.container, 'measureStart').value).startTick;
  const endTick = measures.find(item => item.id === inputValue(ctx.container, 'measureEnd').value).endTick;
  setLoopInputs(ctx, { startTick, endTick }); saveSettings(ctx);
}
export function actionHandlers(ctx) {
  return {
    play: () => play(ctx), pause: () => pause(ctx),
    stop: () => { stopPlayer(ctx); ctx.pendingTick = 0; displayFrame(ctx, { tick: 0, phase: 'stopped', speed: ctx.settings.speed, repetition: 1 }); },
    seek: () => seek(ctx, numberValue(ctx.container, 'seek')),
    import: () => importText(ctx, inputValue(ctx.container, 'import-json').value),
    export: () => download(ctx.library.exportText(ctx.exercise.id), `${ctx.exercise.id}.json`),
    'export-settings': () => download(JSON.stringify({ exerciseId: ctx.exercise.id, practiceSettings: ctx.settings }, null, 2), `${ctx.exercise.id}-practice.json`),
    delete: () => deleteExercise(ctx),
    rename: () => { const exercise = { ...ctx.exercise, title: inputValue(ctx.container, 'exerciseTitle').value }; ctx.library.replace(exercise); clearDraft(ctx, 'player-title'); stopPlayer(ctx); renderPage(ctx); },
    correct: () => { ctx.library.replace(correctedExercise(ctx)); clearDraft(ctx, 'player-correction'); stopPlayer(ctx); renderPage(ctx); },
    'full-loop': () => { setLoopInputs(ctx, { startTick: 0, endTick: ctx.variant.lengthTicks }); saveSettings(ctx); },
    'measure-loop': () => measureLoop(ctx),
  };
}
export function seek(ctx, tick) {
  if (!Number.isFinite(tick) || tick < 0 || tick > ctx.variant.lengthTicks) throw new Error('Seek position outside exercise.');
  if (!ctx.player) { inputValue(ctx.container, 'seek').value = tick; ctx.pendingTick = tick; displayFrame(ctx, { tick, phase: 'stopped', speed: ctx.settings.speed, repetition: 1 }); return; }
  ctx.pendingTick = tick; ctx.player.seek(tick); displayFrame(ctx, ctx.player.snapshot());
}
export function importText(ctx, text) {
  if (ctx.disposed) return;
  ctx.importRequest = (ctx.importRequest ?? 0) + 1;
  ctx.library.importText(text); clearDraft(ctx, 'player-import'); stopPlayer(ctx); renderPage(ctx);
  const heading = ctx.container.querySelector('h1'); heading.tabIndex = -1; heading.focus({ preventScroll: true }); heading.scrollIntoView({ block: 'start' });
}
export async function changeField(ctx, target) {
  if (target.type === 'file') { await changeFile(ctx, target); return; }
  if (target.name === 'exerciseId') { ctx.library.select(target.value); stopPlayer(ctx); renderPage(ctx); return; }
  if (target.name === 'variantId') { const variant = ctx.exercise.variants.find(item => item.id === target.value); ctx.library.preferences(ctx.exercise.id, { ...ctx.settings, variantId: variant.id, loop: defaults(variant).loop }); stopPlayer(ctx); renderPage(ctx); return; }
  if (target.name === 'noteId') { ctx.noteId = target.value; ctx.container.querySelector('#player-correction').dataset.unsaved = 'false'; renderPage(ctx); inputValue(ctx.container, 'noteId').focus({ preventScroll: true }); return; }
  if (isSetting(target.name)) saveSettings(ctx);
}
async function changeFile(ctx, target) {
  const file = target.files[0];
  if (!file) return;
  if (target.name === 'import-file') await importFile(ctx, file);
  if (target.name === 'score-file') { await attachScore(ctx, file); renderPage(ctx); }
}
function isSetting(name) { return ['speed', 'accent', 'metronome', 'countIn', 'countBars', 'gap', 'accelerate', 'accStart', 'accIncrement', 'accEvery', 'accTarget', 'loopStart', 'loopEnd', 'loopEnabled'].includes(name) || name.startsWith('mute:') || name.startsWith('volume:'); }

function clearDraft(ctx, id) {
  const form = ctx.container.querySelector(`#${id}`);
  if (!form) return;
  form.dataset.unsaved = 'false';
  const disclosure = form.querySelector('details') ?? form.closest('details');
  if (disclosure) disclosure.open = false;
}
export async function importFile(ctx, file) {
  const request = ctx.importRequest = (ctx.importRequest ?? 0) + 1;
  const generation = ctx.generation;
  let text;
  try { text = await file.text(); }
  catch (error) { if (currentImport(ctx, request, generation)) throw error; return; }
  if (currentImport(ctx, request, generation)) importText(ctx, text);
}
function currentImport(ctx, request, generation) { return !ctx.disposed && request === ctx.importRequest && generation === ctx.generation; }
