import { exerciseState, resumeExercise, exerciseCleanup } from '../../exercise-state.js';
import { copy } from '../../i18n.js';
import { createExerciseShell, SUSPENDED_CHORD_TYPE_KEYS, SUSPENDED_CHORD_TYPES } from './suspended-chords-exercise-shared.js';
import { next } from './suspended-chords-exercise-next.js';
import { update } from './suspended-chords-exercise-update.js';
export default function render(container) {
const ctx = { container };
ctx.next = next.bind(null, ctx);
ctx.update = update.bind(null, ctx);
ctx.state = exerciseState({ question: null, revealed: false, mode: 'mixed', promptMode: 'spell', filter: [] });
ctx.shell = createExerciseShell(ctx.container, {
    title: 'Suspended Chords',
    links: [{ label: 'Theory', path: '/suspended-chords/theory' }],
    filterLabel: 'Chord type',
    filterOptions: SUSPENDED_CHORD_TYPE_KEYS.map(key => ({
      label: `${SUSPENDED_CHORD_TYPES[key].fullName} (${key})`,
      value: key,
    })),
    buttonLabel: 'Random suspended chord',
    onRandom: (filter) => ctx.next(filter),
  });
ctx.controls = ctx.container.querySelector('.exercise-controls');
ctx.modeGroup = document.createElement('div');
ctx.modeGroup.className = 'row'
ctx.modeGroup.style.gap = '6px'
ctx.modes = [
    { label: 'Mixed', value: 'mixed' },
    { label: 'Spell', value: 'spell' },
    { label: 'Identify', value: 'identify' },
    { label: 'Resolve', value: 'resolve' },
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
      ctx.next(ctx.state.filter)
    })
    ctx.modeGroup.appendChild(btn)
  })
ctx.controls.appendChild(ctx.modeGroup)
resumeExercise(ctx)
return exerciseCleanup(ctx, () => ctx.shell.destroy())
}
