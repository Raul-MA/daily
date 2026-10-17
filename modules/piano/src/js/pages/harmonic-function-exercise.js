import { exerciseState, resumeExercise, exerciseCleanup } from '../../exercise-state.js';
import { copy } from '../../i18n.js';
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
  let state = exerciseState({ question: null, revealed: false })

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
      <span class="label">${copy("Key")}</span>
      <span class="note-display">${copy(q.keyRoot)} ${copy(q.scaleName === 'Major' ? 'major' : 'minor')}</span>
      <span class="label">${copy("What is the harmonic function of")}</span>
      <span class="question">${copy(q.chordName)}</span>
    `

    const color = FUNCTION_COLORS[q.function] || 'var(--success)'
    const answerHTML = `
      <span class="answer-label">${copy(q.roman)} ${copy("in")} ${copy(q.keyRoot)} ${copy(q.scaleName === 'Major' ? 'major' : 'minor')}</span>
      <span class="answer-main" style="font-size:var(--text-xl);color:${color}">${copy(q.function)}</span>
      <span class="answer-sub">${copy(q.chordName)}</span>
      ${copy(tonesTable)}
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

  const view = { container, get state() { return state }, next, update };
  resumeExercise(view)
  return exerciseCleanup(view, () => shell.destroy())
}
