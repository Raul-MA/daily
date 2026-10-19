import { rememberUI, restoreUI } from '../ui-drafts.js';
import { stored } from './library.js';
import { defaults } from './settings.js';
import { importer, primaryControls, loopControls, secondaryControls, correctionControls } from './controls.js';
import { timeline, displayFrame } from './display.js';
import { button, select, escape, text } from './html.js';
import { showScores } from './score-view.js';

export function releaseScores(ctx) { ctx.scoreUrls.forEach(url => URL.revokeObjectURL(url)); ctx.scoreUrls = []; }
export function renderPage(ctx) {
  const previous = { exercise: ctx.exercise?.id, variant: ctx.variant?.id };
  const ui = {}; rememberUI(ctx.container, ui);
  ctx.generation++; releaseScores(ctx);
  const library = ctx.library.read();
  ctx.exercise = library.exercises.find(item => item.id === library.selectedId);
  const heading = `<header class="page-header"><h1>${text('Exercise player')}</h1><p>${text('Import your music. Practice one passage at a time.')}</p></header><p role="alert" data-player-error></p>`;
  if (!ctx.exercise) { ctx.container.innerHTML = `<div class="player-page">${heading}${importer(true)}</div>`; return; }
  const exercise = ctx.exercise;
  ctx.settings = stored(library.preferences, exercise.id, defaults(exercise.variants.find(item => item.id === exercise.defaultVariantId)));
  ctx.variant = exercise.variants.find(item => item.id === ctx.settings.variantId);
  scopeDrafts(ui, previous, ctx);
  ctx.container.innerHTML = `<div class="player-page">${heading}<details data-disclosure="player-management" class="card player-management"><summary>${escape(exercise.title)} · ${text('Manage exercise')}</summary><div class="player-row">${select('exerciseId', 'Exercise', library.exercises.map(item => [item.id, item.title]), exercise.id)}<form id="player-title"><label>${text('Exercise name')}<input name="exerciseTitle" value="${escape(exercise.title)}"></label>${button('rename', 'Rename')}</form>${button('export', 'Export exercise')}${button('delete', 'Delete exercise')}</div><p>${escape(exercise.instructions)}</p></details>${primaryControls(exercise, ctx.settings)}${loopControls(ctx.variant, ctx.settings, exercise.ticksPerQuarter ?? 960)}${timeline(exercise, ctx.variant, ctx.settings)}${secondaryControls(ctx.settings)}${correctionControls(exercise, ctx.variant, ctx.noteId)}<details class="card"><summary>${text('Original score')}</summary><p>${text('Attach a reference image or PDF. Files are stored separately and are not included in JSON or Daily backups.')}</p><label>${text('Attachment ID')}<input name="attachmentId" value="${escape(ctx.variant.scoreReferences?.[0]?.attachmentId ?? '')}"></label><label>${text('Score image or PDF')}<input type="file" name="score-file" accept="image/png,image/jpeg,image/webp,application/pdf"></label><div data-player-score></div></details>${importer(false)}</div>`;
  restoreUI(ctx.container, ui);
  ctx.keySignature = null;
  displayFrame(ctx, { tick: 0, phase: 'stopped', speed: ctx.settings.speed, repetition: 1 });
  showScores(ctx).catch(ctx.fail);
}

function scopeDrafts(ui, previous, ctx) {
  if (previous.exercise !== ctx.exercise.id) ui.drafts = ui.drafts.filter(draft => draft.id === 'player-import');
  if (previous.variant !== ctx.variant.id) ui.drafts = ui.drafts.filter(draft => draft.id !== 'player-correction');
}
