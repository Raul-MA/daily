import { BORROWED_CHORD_NAMES, randomBorrowedChordQuestion } from './modal-interchange-exercise-shared.js';
export function next(ctx, filter) {
    const romanFilter = filter.filter(f => BORROWED_CHORD_NAMES.includes(f))
    const inverse     = filter.includes('Inverse')
    ctx.state = {
      question: randomBorrowedChordQuestion(romanFilter.length > 0 ? romanFilter : null),
      revealed: false,
      inverse,
    }
    ctx.update()
  }
