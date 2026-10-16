import { createExerciseShell, SHELL_CHORD_TYPE_KEYS, SHELL_CHORD_TYPES } from './shell-chords-exercise-shared.js';
import { next } from './shell-chords-exercise-next.js';
import { update } from './shell-chords-exercise-update.js';
export default function render(container) {
const ctx = { container };
ctx.next = next.bind(null, ctx);
ctx.update = update.bind(null, ctx);
ctx.state = { question: null, revealed: false, mode: 'both', promptMode: 'build' };
ctx.shell = createExerciseShell(ctx.container, {
    title: 'Shell Chords',
    links: [{ label: 'Theory', path: '/shell-chords/theory' }],
    filterLabel: 'Chord type',
    filterOptions: SHELL_CHORD_TYPE_KEYS.map(key => ({
      label: `${SHELL_CHORD_TYPES[key].label} (${SHELL_CHORD_TYPES[key].symbol})`,
      value: key,
    })),
    buttonLabel: 'Random shell',
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
  ];
ctx.modes.forEach((m, idx) => {
    const btn = document.createElement('button')
    btn.className = `btn btn-sm ${idx === 0 ? 'btn-primary' : 'btn-ghost'}`
    btn.textContent = m.label
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
ctx.next([])
return () => ctx.shell.destroy()
}
