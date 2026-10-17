import { exerciseState, resumeExercise, exerciseCleanup } from '../../exercise-state.js';
import { copy } from '../../i18n.js';
import { getKeyboardVoicing } from '../music/notes.js'
import { createExerciseShell, buildExerciseCardHTML } from '../components/exercise-shell.js'
import { randomModeQuestion, MODE_NAMES } from '../music/modes.js'

export default function render(container) {
  let state = exerciseState({ question: null, revealed: false })

  function next(filter) {
    state = { question: randomModeQuestion(filter.length > 0 ? filter : null), revealed: false }
    update()
  }

  function update() {
    const q = state.question
    if (!q) return

    const questionHTML = `
      <span class="label">${copy("Root note")}</span>
      <span class="note-display">${copy(q.root)}</span>
      <span class="label">${copy("Mode:")}</span>
      <span class="question">${copy(q.mode.name)}</span>
    `

    const answerHTML = `
      <span class="answer-label">${copy("Notes")}</span>
      <span class="answer-main" style="font-size:var(--text-xl)">${copy(q.notes.join(' — '))}</span>
      <span class="answer-sub">${copy("Degree:")} ${copy(q.mode.degree)} ${copy("&nbsp;·&nbsp;")} ${copy(q.mode.feel)}</span>
      <span class="answer-sub" style="font-size:var(--text-sm)">${copy(q.mode.formula)}</span>
    `

    shell.renderCard(buildExerciseCardHTML({
      questionHTML, answerHTML, revealed: state.revealed,
      keyboards: [{ ...getKeyboardVoicing(q.notes.map((note, index) => ({ note, degree: q.mode.formula.split(/\s+/)[index] }))), label: `${q.root} ${q.mode.name}` }],
    }))

    container.querySelector('.exercise-card').addEventListener('click', () => {
      state.revealed = !state.revealed
      update()
    })
  }

  const shell = createExerciseShell(container, {
    title: 'Modes',
    links: [{ label: 'Theory', path: '/modes/theory' }],
    filterLabel: 'Mode',
    filterOptions: MODE_NAMES.map(n => ({ label: n, value: n })),
    buttonLabel: 'Random mode',
    onRandom: (filter) => next(filter),
  })

  const view = { container, get state() { return state }, next, update };
  resumeExercise(view)
  return exerciseCleanup(view, () => shell.destroy())
}
