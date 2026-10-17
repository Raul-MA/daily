import { exerciseState, resumeExercise, exerciseCleanup } from '../../exercise-state.js';
import { copy, presentAuthoredHTML } from '../../i18n.js';
import { createExerciseShell, buildExerciseCardHTML } from '../components/exercise-shell.js'
import { MODULATION_TYPES, MODULATION_QUESTIONS } from '../music/modulations.js'

const TYPE_LABELS = Object.fromEntries(MODULATION_TYPES.map(t => [t.id, t.name]))

const FILTER_OPTIONS = MODULATION_TYPES.map(t => ({
  label: t.name,
  value: t.id,
}))

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

export default function render(container) {
  let state = exerciseState({ question: null, revealed: false })

  function next(filter) {
    const pool = filter.length > 0
      ? MODULATION_QUESTIONS.filter(q => filter.includes(q.type))
      : MODULATION_QUESTIONS
    state = { question: pickRandom(pool), revealed: false }
    update()
  }

  function update() {
    const q = state.question
    if (!q) return

    const typeLabel = TYPE_LABELS[q.type] ?? q.type

    const questionHTML = presentAuthoredHTML(q.questionHTML)
    const answerHTML = `
      ${presentAuthoredHTML(q.answerHTML)}
      <span class="answer-sub text-muted" style="margin-top:var(--space-sm)">${copy("Category:")} ${copy(typeLabel)}</span>
    `

    shell.renderCard(buildExerciseCardHTML({
      questionHTML,
      answerHTML,
      revealed: state.revealed,
      keyboards: q.keyboards,
    }))

    container.querySelector('.exercise-card').addEventListener('click', () => {
      state.revealed = !state.revealed
      update()
    })
  }

  const shell = createExerciseShell(container, {
    title: 'Modulation Recognition',
    links: [{ label: 'Theory', path: '/modulations/theory' }],
    filterLabel: 'Type',
    filterOptions: FILTER_OPTIONS,
    buttonLabel: 'Random',
    onRandom: (filter) => next(filter),
  })

  const view = { container, get state() { return state }, next, update };
  resumeExercise(view)
  return exerciseCleanup(view, () => shell.destroy())
}
