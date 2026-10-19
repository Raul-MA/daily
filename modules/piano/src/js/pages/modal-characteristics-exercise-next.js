import { randomModeQuestion } from './modal-characteristics-exercise-shared.js';
export function next(ctx, filter) {
    ctx.state = { question: randomModeQuestion(filter.length > 0 ? filter : null), revealed: false }
    ctx.update()
  }
