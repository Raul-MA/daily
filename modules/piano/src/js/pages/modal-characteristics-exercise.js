import { createExerciseShell, MODES } from './modal-characteristics-exercise-shared.js';
import { next } from './modal-characteristics-exercise-next.js';
import { update } from './modal-characteristics-exercise-update.js';
export default function render(container) {
const ctx = { container };
ctx.next = next.bind(null, ctx);
ctx.update = update.bind(null, ctx);
ctx.drillMode = 'forward';
ctx.state = { question: null, revealed: false };
ctx.shell = createExerciseShell(ctx.container, {
    title: 'Modal Characteristics',
    links: [{ label: 'Theory', path: '/modes/theory' }],
    filterLabel: 'Mode',
    filterOptions: MODES.map(m => ({ label: `${m.degree} ${m.name}`, value: m.name })),
    buttonLabel: 'Random mode',
    onRandom: (filter) => ctx.next(filter),
  });
ctx.controls = ctx.container.querySelector('.exercise-controls');
if (ctx.controls) {
    ctx.controls.innerHTML = `
      <div style="display:flex;gap:var(--space-sm);justify-content:center;flex-wrap:wrap;padding:var(--space-sm) 0">
        <button id="drill-forward" class="btn btn-sm btn-primary">Name → Characteristics</button>
        <button id="drill-reverse" class="btn btn-sm btn-ghost">Context → Name</button>
      </div>
    `
    ctx.container.querySelector('#drill-forward').addEventListener('click', () => {
      ctx.drillMode = 'forward'
      ctx.container.querySelector('#drill-forward').classList.remove('btn-ghost')
      ctx.container.querySelector('#drill-forward').classList.add('btn-primary')
      ctx.container.querySelector('#drill-reverse').classList.remove('btn-primary')
      ctx.container.querySelector('#drill-reverse').classList.add('btn-ghost')
      ctx.state.revealed = false
      ctx.update()
    })
    ctx.container.querySelector('#drill-reverse').addEventListener('click', () => {
      ctx.drillMode = 'reverse'
      ctx.container.querySelector('#drill-reverse').classList.remove('btn-ghost')
      ctx.container.querySelector('#drill-reverse').classList.add('btn-primary')
      ctx.container.querySelector('#drill-forward').classList.remove('btn-primary')
      ctx.container.querySelector('#drill-forward').classList.add('btn-ghost')
      ctx.state.revealed = false
      ctx.update()
    })
  }
ctx.next([])
return () => ctx.shell.destroy()
}
