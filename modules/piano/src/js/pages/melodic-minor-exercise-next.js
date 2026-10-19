import { randomMelodicMinorQuestion, randomReverseQuestion } from './melodic-minor-exercise-shared.js';
export function next(ctx, filter) {
    let question
    if (ctx.state.mode === 'reverse') {
      question = randomReverseQuestion(filter)
    } else {
      question = randomMelodicMinorQuestion(filter.length > 0 ? filter : null)
    }
    ctx.state = { ...ctx.state, question, revealed: false }
    ctx.update()
  }
