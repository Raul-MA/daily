import { content } from './suspended-chords-exercise-content.js';
import { getKeyboardVoicing, buildExerciseCardHTML } from "./suspended-chords-exercise-shared.js";
export function update(ctx) {
    const q = ctx.state.question
    if (!q) return



    const { questionHTML, answerHTML } = content(ctx, q);

    const keyboards = [{ ...getKeyboardVoicing(q.tones, { root: q.root }), label: q.chordName }]
    if (ctx.state.promptMode === 'resolve') {
      keyboards.push({ ...getKeyboardVoicing(q.resolvedTones, { root: q.root }), label: q.resolutionTarget })
    }

    ctx.shell.renderCard(buildExerciseCardHTML({ questionHTML, answerHTML, keyboards, revealed: ctx.state.revealed }))

    ctx.container.querySelector('.exercise-card').addEventListener('click', () => {
      ctx.state.revealed = !ctx.state.revealed
      ctx.update()
    })
  }
