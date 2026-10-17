import { exerciseState, resumeExercise, exerciseCleanup } from '../../exercise-state.js';
import { copy } from '../../i18n.js';
import { createExerciseShell, ROOTLESS_CHORD_TYPE_KEYS, ROOTLESS_CHORD_TYPES } from './rootless-voicings-exercise-shared.js';
import { next } from './rootless-voicings-exercise-next.js';
import { update } from './rootless-voicings-exercise-update.js';
export default function render(container) {
const ctx = { container };
ctx.next = next.bind(null, ctx);
ctx.update = update.bind(null, ctx);
ctx.state = exerciseState({
    question: null,
    revealed: false,
    mode: 'both',
    promptMode: 'build',
  });
ctx.shell = createExerciseShell(ctx.container, {
    title: 'Rootless Voicings',
    links: [
      { label: 'Theory', path: '/rootless-voicings/theory' },
      { label: 'Shell Chords', path: '/shell-chords/theory' },
    ],
    filterLabel: 'Chord type',
    filterOptions: ROOTLESS_CHORD_TYPE_KEYS.map(key => ({
      label: `${ROOTLESS_CHORD_TYPES[key].label} (${ROOTLESS_CHORD_TYPES[key].symbol})`,
      value: key,
    })),
    buttonLabel: 'Random rootless',
    onRandom: (filter) => ctx.next(filter),
  });
ctx.controls = ctx.container.querySelector('.exercise-controls');
ctx.modeGroup = document.createElement('div');
ctx.modeGroup.className = 'row'
ctx.modeGroup.style.gap = '6px'
ctx.modes = [
    { label: 'Both', value: 'both' },
    { label: 'Build', value: 'build' },
    { label: 'Identify', value: 'identify' },
    { label: 'ii-V-I A→B→A', value: 'progression' },
  ];
ctx.modes.forEach((m, idx) => {
    const btn = document.createElement('button')
    btn.className = `btn btn-sm ${m.value === ctx.state.mode ? 'btn-primary' : 'btn-ghost'}`
    btn.textContent = copy(m.label)
    btn.addEventListener('click', () => {
      ctx.state.mode = m.value
      ctx.modeGroup.querySelectorAll('button').forEach((b, i) => {
        b.className = `btn btn-sm ${i === idx ? 'btn-primary' : 'btn-ghost'}`
      })
      const filter = Array.from(ctx.container.querySelectorAll('.multi-select option:checked')).map(o => o.value)
      ctx.next(filter)
    })
    ctx.modeGroup.appendChild(btn)
  })
ctx.controls.appendChild(ctx.modeGroup)
resumeExercise(ctx)
return exerciseCleanup(ctx, () => ctx.shell.destroy())
}
