import { getKeyboardVoicing } from '../music/notes.js'
import { createExerciseShell, buildExerciseCardHTML, buildChordTonesTableHTML } from '../components/exercise-shell.js'
import { randomHarmonicFunctionQuestion, HARMONIC_FUNCTIONS } from "../music/functions.js";
import { CHORD_TYPES } from '../music/chords.js'

const FUNCTION_COLORS = {
  'Tonic':       'var(--success)',
  'Predominant': 'var(--accent)',
  'Dominant':    '#e07050',
}

export default function render(container) {
  let state = { question: null, revealed: false }

  function next(filter) {
    state = {
      question: randomHarmonicFunctionQuestion(filter.length > 0 ? filter : null),
      revealed: false,
    }
    update()
  }

  function update() {
    const q = state.question
    if (!q) return

    const degrees = CHORD_TYPES[q.chordType]?.degrees ?? q.notes.map((_, i) => String(i + 1))
    const tonesTable = buildChordTonesTableHTML(
      q.notes.map((note, i) => ({ degree: degrees[i] ?? String(i + 1), note }))
    )

    const questionHTML = `
      <span class="label">Key</span>
      <span class="note-display">${q.keyRoot} ${q.scaleName === 'Major' ? 'major' : 'minor'}</span>
      <span class="label">What is the harmonic function of</span>
      <span class="question">${q.chordName}</span>
    `

    const color = FUNCTION_COLORS[q.function] || 'var(--success)'
    const answerHTML = `
      <span class="answer-label">${q.roman} in ${q.keyRoot} ${q.scaleName === 'Major' ? 'major' : 'minor'}</span>
      <span class="answer-main" style="font-size:var(--text-xl);color:${color}">${q.function}</span>
      <span class="answer-sub">${q.chordName}</span>
      ${tonesTable}
    `

    shell.renderCard(buildExerciseCardHTML({
      questionHTML, answerHTML, revealed: state.revealed,
      keyboards: [{ ...getKeyboardVoicing(q.notes.map((note, index) => ({ note, degree: CHORD_TYPES[q.chordType]?.degrees[index] }))), label: `${q.chordName}: ${q.function}` }],
    }))

    container.querySelector('.exercise-card').addEventListener('click', () => {
      state.revealed = !state.revealed
      update()
    })
  }

  const filterOptions = HARMONIC_FUNCTIONS.map(f => ({ label: f, value: f }))

  const shell = createExerciseShell(container, {
    title: 'Harmonic Function',
    filterLabel: 'Function',
    filterOptions,
    buttonLabel: 'Random',
    onRandom: (filter) => next(filter),
  })

  next([])
  return () => shell.destroy()
}
