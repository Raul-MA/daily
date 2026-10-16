import { getKeyboardVoicing } from '../music/notes.js'
import { createExerciseShell, buildExerciseCardHTML } from '../components/exercise-shell.js'
import { randomIntervalQuestion, INTERVAL_NAMES } from '../music/intervals.js'

export default function render(container) {
  let state = { question: null, revealed: false }

  function next(filter) {
    state = { question: randomIntervalQuestion(filter), revealed: false }
    update()
  }

  function update() {
    const q = state.question
    if (!q) return

    const questionHTML = `
      <span class="label">Starting note</span>
      <span class="note-display">${q.root}</span>
      <span class="label">Find:</span>
      <span class="question">${q.interval.name}</span>
    `

    const answerHTML = `
      <span class="answer-label">Result</span>
      <span class="answer-main">${q.result}</span>
      <span class="answer-sub">${q.interval.semitones} semitones &nbsp;·&nbsp; ${q.interval.abbr}</span>
    `

    shell.renderCard(buildExerciseCardHTML({
      questionHTML, answerHTML, revealed: state.revealed,
      keyboards: [{ ...getKeyboardVoicing([{ note: q.root, degree: 'Root', semitones: 0 }, { note: q.result, degree: q.interval.abbr, semitones: q.interval.semitones }], { root: q.root, startOctave: 4 }), label: `${q.interval.name} from ${q.root}` }],
    }))

    container.querySelector('.exercise-card').addEventListener('click', () => {
      state.revealed = !state.revealed
      update()
    })
  }

  const shell = createExerciseShell(container, {
    title: 'Intervals',
    links: [{ label: 'Theory', path: '/intervals/theory' }],
    filterLabel: 'Semitones',
    filterOptions: INTERVAL_NAMES,
    buttonLabel: 'Random interval',
    onRandom: (filter) => next(filter),
  })

  next([])
  return () => shell.destroy()
}
