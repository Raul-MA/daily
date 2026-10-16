import { randomIIVIQuestion } from './iivi-exercise-shared.js';
export function next(ctx, filter) {
    const modes = filter.filter(f => f === 'major' || f === 'minor')
    const inverse = filter.includes('Inverse')
    ctx.state = {
      question: randomIIVIQuestion(modes.length > 0 ? modes : null),
      revealed: false,
      inverse,
    }
    ctx.update()
  }
