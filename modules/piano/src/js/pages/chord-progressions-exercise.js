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
ctx.rootOptions = ALL_NOTES.map(n => `<option value="${n}"${n === ctx.root ? ' selected' : ''}>${n}</option>`).join('');
ctx.scaleOptions = PROGRESSION_SCALE_NAMES.map(s => `<option value="${s}"${s === ctx.scaleName ? ' selected' : ''}>${s}</option>`).join('');
ctx.lengthOptions = [2,3,4,5,6,7].map(n => `<option value="${n}"${n === ctx.length ? ' selected' : ''}>${n} chords</option>`).join('');
ctx.container.innerHTML = `
    <div class="page-header">
      <h1>Chord Progressions</h1>
    </div>

    <div class="exercise-controls mb-md">
      <div class="select-wrapper">
        <div class="select-label">Root</div>
        <select class="multi-select" id="root-select" size="1" aria-label="Root note">
          ${ctx.rootOptions}
        </select>
      </div>
      <div class="select-wrapper">
        <div class="select-label">Scale</div>
        <select class="multi-select" id="scale-select" size="1" aria-label="Scale type">
          ${ctx.scaleOptions}
        </select>
      </div>
      <div class="select-wrapper">
        <div class="select-label">Length</div>
        <select class="multi-select" id="length-select" size="1" aria-label="Chord count">
          ${ctx.lengthOptions}
        </select>
      </div>
    </div>

    <div style="margin-bottom:var(--space-lg)">
      <button class="btn btn-primary" id="generate-btn">Generate progression</button>
    </div>

    <div class="progression-area">
      <p class="text-muted">Press "Generate" to create a progression</p>
    </div>

    <div class="theory-item mt-lg" style="max-width:600px">
      <div class="theory-item-title">About diatonic progressions</div>
      <p class="text-muted">All chords are built on degrees of the chosen scale, using diatonic 7th chord qualities. Each generation picks random degrees from the scale.</p>
    </div>
  `
ctx.container.querySelector('#root-select').addEventListener('change', e => { ctx.root = e.target.value })
ctx.container.querySelector('#scale-select').addEventListener('change', e => { ctx.scaleName = e.target.value })
ctx.container.querySelector('#length-select').addEventListener('change', e => { ctx.length = parseInt(e.target.value, 10) })
ctx.container.querySelector('#generate-btn').addEventListener('click', ctx.generate)
ctx.generate()
}
