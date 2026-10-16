import { content } from './melodic-minor-exercise-content.js';
import { getKeyboardVoicing, buildExerciseCardHTML, getMelodicMinorModeNotes } from './melodic-minor-exercise-shared.js';
export function update(ctx) {
    const q = ctx.state.question
    if (!q) return


    const { questionHTML, answerHTML } = content(ctx, q);

    ctx.shell.renderCard(buildExerciseCardHTML({
      questionHTML, answerHTML, revealed: ctx.state.revealed,
      keyboards: [{ ...getKeyboardVoicing((q.notes || getMelodicMinorModeNotes('C', q.mode.name)).map((note, index) => ({ note, degree: q.mode.formula.split(/\s+/)[index] }))), label: `${q.root || 'C'} ${q.mode.name}${ctx.state.mode === 'reverse' ? ' example' : ''}` }],
    }))

    ctx.container.querySelector('.exercise-card').addEventListener('click', () => {
      ctx.state.revealed = !ctx.state.revealed
      ctx.update()
    })

    
    ctx.container.querySelectorAll('.mm-mode-btn').forEach(btn => {
      btn.classList.toggle('btn-primary', btn.dataset.mode === ctx.state.mode)
      btn.classList.toggle('btn-ghost', btn.dataset.mode !== ctx.state.mode)
    })
  }
