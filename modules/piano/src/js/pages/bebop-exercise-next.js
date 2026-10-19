import { randomBebopQuestion } from './bebop-exercise-shared.js';
export function next(ctx, filter) {
    ctx.state = { ...ctx.state, question: randomBebopQuestion(filter), revealed: false }
    ctx.update()
  }
