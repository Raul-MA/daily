import { getKeyboardVoicing } from '../music/notes.js'
import { createExerciseShell, buildExerciseCardHTML } from '../components/exercise-shell.js'
import { randomScaleQuestion, SCALE_NAMES } from '../music/scales.js'

export default function render(container) {
  let state = { question: null, revealed: false }

  function next(filter) {
    state = { question: randomScaleQuestion(filter.length > 0 ? filter : null), revealed: false }
    update()
  }

  function update() {
    const q = state.question
    if (!q) return

    const questionHTML = `
      <span class="label">Root note</span>
      <span class="note-display">${q.root}</span>
      <span class="label">Scale type:</span>
      <span class="question">${q.scaleName}</span>
    `

    const rows = q.notes.map((note, i) => `
      <tr>
        <td class="text-muted">${i + 1}</td>
        <td style="color:var(--success);font-weight:700;font-size:var(--text-lg)">${note}</td>
      </tr>
    `).join('')

    const answerHTML = `
      <span class="answer-label">${q.root} ${q.scaleName}</span>
      <table class="chord-tones-table" style="min-width:180px;margin-top:var(--space-sm)">
        <thead>
          <tr><th>Degree</th><th>Note</th></tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <span class="answer-sub" style="margin-top:var(--space-sm)">Steps: ${q.pattern}</span>
    `

    shell.renderCard(buildExerciseCardHTML({
      questionHTML, answerHTML, revealed: state.revealed,
      keyboards: [{ ...getKeyboardVoicing(q.notes.map(note => ({ note }))), label: `${q.root} ${q.scaleName}` }],
    }))

    container.querySelector('.exercise-card').addEventListener('click', () => {
      state.revealed = !state.revealed
      update()
    })
  }

  const shell = createExerciseShell(container, {
    title: 'Scales',
    links: [{ label: 'Theory', path: '/scales/theory' }],
    filterLabel: 'Scale type',
    filterOptions: SCALE_NAMES.map(n => ({ label: n, value: n })),
    buttonLabel: 'Random scale',
    onRandom: (filter) => next(filter),
  })

  next([])
  return () => shell.destroy()
}
