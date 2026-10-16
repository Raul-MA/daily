import { getKeyboardVoicing } from '../music/notes.js'
import { createExerciseShell, buildExerciseCardHTML } from '../components/exercise-shell.js'
import { randomModeQuestion, MODE_NAMES } from '../music/modes.js'

export default function render(container) {
  let state = { question: null, revealed: false }

  function next(filter) {
    state = { question: randomModeQuestion(filter.length > 0 ? filter : null), revealed: false }
    update()
  }

  function update() {
    const q = state.question
    if (!q) return

    const questionHTML = `
      <span class="label">Root note</span>
      <span class="note-display">${q.root}</span>
      <span class="label">Mode:</span>
      <span class="question">${q.mode.name}</span>
    `

    const answerHTML = `
      <span class="answer-label">Notes</span>
      <span class="answer-main" style="font-size:var(--text-xl)">${q.notes.join(' — ')}</span>
      <span class="answer-sub">Degree: ${q.mode.degree} &nbsp;·&nbsp; ${q.mode.feel}</span>
      <span class="answer-sub" style="font-size:var(--text-sm)">${q.mode.formula}</span>
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

  next([])
  return () => shell.destroy()
}
