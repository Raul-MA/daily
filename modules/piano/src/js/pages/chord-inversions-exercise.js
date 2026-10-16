import { createExerciseShell, SCALE_NAMES_FOR_INVERSIONS } from './chord-inversions-exercise-shared.js';
import { next } from './chord-inversions-exercise-next.js';
import { update } from './chord-inversions-exercise-update.js';
export default function render(container) {
const ctx = { container };
ctx.next = next.bind(null, ctx);
ctx.update = update.bind(null, ctx);
ctx.state = { question: null, revealed: false, chordMode: 'both', showScale: false };
ctx.shell = createExerciseShell(ctx.container, {
    title: 'Chord Inversions',
    links: [],
    filterLabel: 'Scale',
    filterOptions: SCALE_NAMES_FOR_INVERSIONS.map(n => ({ label: n, value: n })),
    buttonLabel: 'Random inversion',
    onRandom: (filter) => ctx.next(filter),
  });
ctx.controls = ctx.container.querySelector('.exercise-controls');
ctx.modeGroup = document.createElement('div');
ctx.modeGroup.className = 'row'
ctx.modeGroup.style.gap = '6px'
ctx.modes = [
    { label: 'Both',       value: 'both'    },
    { label: 'Triads',     value: 'triad'   },
    { label: '7th chords', value: 'seventh' },
  ];
ctx.modes.forEach((m, idx) => {
    const btn = document.createElement('button')
    btn.className = `btn btn-sm ${idx === 0 ? 'btn-primary' : 'btn-ghost'}`
    btn.textContent = m.label
    btn.addEventListener('click', () => {
      ctx.state.chordMode = m.value
      ctx.modeGroup.querySelectorAll('button').forEach((b, i) => {
        b.className = `btn btn-sm ${i === idx ? 'btn-primary' : 'btn-ghost'}`
      })
      const scaleFilter = Array.from(
        ctx.container.querySelectorAll('.multi-select option:checked')
      ).map(o => o.value)
      ctx.next(scaleFilter)
    })
    ctx.modeGroup.appendChild(btn)
  })
ctx.controls.appendChild(ctx.modeGroup)
ctx.scaleCheckLabel = document.createElement('label');
ctx.scaleCheckLabel.className = 'row'
ctx.scaleCheckLabel.style.cssText = 'gap:6px;align-items:center;cursor:pointer;margin-top:var(--space-xs)'
ctx.scaleCheckbox = document.createElement('input');
ctx.scaleCheckbox.type = 'checkbox'
ctx.scaleCheckbox.checked = ctx.state.showScale
ctx.scaleCheckbox.addEventListener('change', () => {
    ctx.state.showScale = ctx.scaleCheckbox.checked
    ctx.update()
  })
ctx.scaleCheckLabel.appendChild(ctx.scaleCheckbox)
ctx.scaleCheckLabel.appendChild(document.createTextNode('Show scale notes in answer'))
ctx.controls.appendChild(ctx.scaleCheckLabel)
ctx.next([])
return () => ctx.shell.destroy()
}
