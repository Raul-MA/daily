import { content } from './rootless-voicings-exercise-content.js';
import { buildExerciseCardHTML, getRootlessKeyboards } from './rootless-voicings-exercise-shared.js';
export function update(ctx) {
    const q = ctx.state.question
    if (!q) return



    const { questionHTML, answerHTML } = content(ctx, q);

    const voicings = ctx.state.promptMode === 'progression' ? q.progression : [q]
    const keyboards = getRootlessKeyboards(voicings)

    ctx.shell.renderCard(buildExerciseCardHTML({ questionHTML, answerHTML, keyboards, revealed: ctx.state.revealed }))

    ctx.container.querySelector('.exercise-card').addEventListener('click', () => {
      ctx.state.revealed = !ctx.state.revealed
      ctx.update()
    })
  }
