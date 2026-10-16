import { SEC_DOM_TARGET_NAMES, createExerciseShell } from './secondary-dominants-exercise-shared.js';
import { next } from './secondary-dominants-exercise-next.js';
import { update } from './secondary-dominants-exercise-update.js';
export default function render(container) {
const ctx = { container };
ctx.next = next.bind(null, ctx);
ctx.update = update.bind(null, ctx);
ctx.state = { question: null, revealed: false, inverse: false };
ctx.filterOptions = [
    ...SEC_DOM_TARGET_NAMES.map(n => ({ label: `V7/${n}`, value: n })),
    { label: 'Inverse mode', value: 'Inverse' },
  ];
ctx.shell = createExerciseShell(ctx.container, {
    title: 'Secondary Dominants',
    filterLabel: 'Target / Mode',
    filterOptions: ctx.filterOptions,
    buttonLabel: 'Random',
    onRandom: (filter) => ctx.next(filter),
  });
ctx.next([])
return () => ctx.shell.destroy()
}
