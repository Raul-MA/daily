import { BORROWED_CHORD_NAMES, createExerciseShell } from './modal-interchange-exercise-shared.js';
import { next } from './modal-interchange-exercise-next.js';
import { update } from './modal-interchange-exercise-update.js';
export default function render(container) {
const ctx = { container };
ctx.next = next.bind(null, ctx);
ctx.update = update.bind(null, ctx);
ctx.state = { question: null, revealed: false, inverse: false };
ctx.filterOptions = [
    ...BORROWED_CHORD_NAMES.map(n => ({ label: n, value: n })),
    { label: 'Identify mode', value: 'Inverse' },
  ];
ctx.shell = createExerciseShell(ctx.container, {
    title: 'Modal Interchange',
    filterLabel: 'Chord / Mode',
    filterOptions: ctx.filterOptions,
    buttonLabel: 'Random',
    onRandom: (filter) => ctx.next(filter),
  });
ctx.next([])
return () => ctx.shell.destroy()
}
