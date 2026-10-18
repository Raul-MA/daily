import { restoreProgression, progressionCleanup } from '../../exercise-state.js';
import { copy } from '../../i18n.js';
import { ALL_NOTES, PROGRESSION_SCALE_NAMES } from './chord-progressions-exercise-shared.js';
import { generate } from './chord-progressions-exercise-generate.js';
import { renderProgression } from './chord-progressions-exercise-renderProgression.js';
export default function render(container) {
const ctx = { container };
ctx.generate = generate.bind(null, ctx);
ctx.renderProgression = renderProgression.bind(null, ctx);
ctx.root = 'C';
ctx.scaleName = 'Major';
ctx.length = 4;
ctx.progression = [];
restoreProgression(ctx);
ctx.rootOptions = ALL_NOTES.map(n => `<option value="${n}"${n === ctx.root ? ' selected' : ''}>${copy(n)}</option>`).join('');
ctx.scaleOptions = PROGRESSION_SCALE_NAMES.map(s => `<option value="${s}"${s === ctx.scaleName ? ' selected' : ''}>${copy(s)}</option>`).join('');
ctx.lengthOptions = [2,3,4,5,6,7].map(n => `<option value="${n}"${n === ctx.length ? ' selected' : ''}>${copy(n)} ${copy("chords")}</option>`).join('');
ctx.container.innerHTML = copy(`
    <div class="page-header">
      <h1>${copy("Chord Progressions")}</h1>
    </div>

    <div class="exercise-controls mb-md">
      <div class="select-wrapper">
        <div class="select-label">${copy("Root")}</div>
        <select class="multi-select" id="root-select" size="1" aria-label="Root note">
          ${copy(ctx.rootOptions)}
        </select>
      </div>
      <div class="select-wrapper">
        <div class="select-label">${copy("Scale")}</div>
        <select class="multi-select" id="scale-select" size="1" aria-label="Scale type">
          ${copy(ctx.scaleOptions)}
        </select>
      </div>
      <div class="select-wrapper">
        <div class="select-label">${copy("Length")}</div>
        <select class="multi-select" id="length-select" size="1" aria-label="Chord count">
          ${copy(ctx.lengthOptions)}
        </select>
      </div>
    </div>

    <div style="margin-bottom:var(--space-lg)">
      <button class="btn btn-primary" id="generate-btn">${copy("Generate progression")}</button>
    </div>

    <div class="progression-area">
      <p class="text-muted">${copy('Press "Generate" to create a progression')}</p>
    </div>

    <div class="theory-item mt-lg">
      <div class="theory-item-title">${copy("About diatonic progressions")}</div>
      <p class="text-muted">${copy("All chords are built on degrees of the chosen scale, using diatonic 7th chord qualities. Each generation picks random degrees from the scale.")}</p>
    </div>
  `)
ctx.container.querySelector('#root-select').addEventListener('change', e => { ctx.root = e.target.value })
ctx.container.querySelector('#scale-select').addEventListener('change', e => { ctx.scaleName = e.target.value })
ctx.container.querySelector('#length-select').addEventListener('change', e => { ctx.length = parseInt(e.target.value, 10) })
ctx.container.querySelector('#generate-btn').addEventListener('click', ctx.generate)
if (ctx.progression.length) ctx.renderProgression();
else ctx.generate();
return progressionCleanup(ctx);
}
