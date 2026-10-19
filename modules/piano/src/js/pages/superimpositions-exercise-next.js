import { SUPERIMPOSITION_IDS, randomSuperimpositionQuestion } from './superimpositions-exercise-shared.js';
export function next(ctx, filter) {
    const filteredIds = filter.filter(f => SUPERIMPOSITION_IDS.includes(f))
    const inverse     = filter.includes('Reverse')
    ctx.state = {
      question: randomSuperimpositionQuestion(
        filteredIds.length > 0 ? filteredIds : null,
        inverse,
      ),
      revealed: false,
    }
    ctx.update()
  }
