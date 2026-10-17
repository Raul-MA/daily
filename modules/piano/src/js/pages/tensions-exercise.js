import { exerciseState, resumeExercise, exerciseCleanup } from '../../exercise-state.js';
import { copy } from '../../i18n.js';
import { getKeyboardVoicing } from '../music/notes.js'
import { createExerciseShell, buildExerciseCardHTML, buildChordTonesTableHTML } from '../components/exercise-shell.js'
import { randomChordQuestion, CHORD_TYPE_NAMES, CHORD_TYPES } from '../music/chords.js'

export default function render(container) {
  let state = exerciseState({ question: null, revealed: false })

  function next(filter) {
    state = { question: randomChordQuestion(filter), revealed: false }
    update()
  }

  function update() {
    const q = state.question
    if (!q) return

    const questionHTML = `
      <span class="label">${copy("Chord")}</span>
      <span class="note-display">${copy(q.name)}</span>
      <span class="label">${copy("What are the chord tones?")}</span>
    `

    const answerHTML = `
      <span class="answer-label">${copy(CHORD_TYPES[q.chordType].fullName)}</span>
      ${copy(buildChordTonesTableHTML(q.tones))}
    `

    shell.renderCard(buildExerciseCardHTML({
      questionHTML, answerHTML, revealed: state.revealed,
      keyboards: [{ ...getKeyboardVoicing(q.tones, { root: q.root, startOctave: 4 }), label: `${q.name} chord tones` }],
    }))

    container.querySelector('.exercise-card').addEventListener('click', () => {
      state.revealed = !state.revealed
      update()
    })
  }

  const shell = createExerciseShell(container, {
    title: 'Tensions',
    links: [
      { label: 'Theory', path: '/tensions/theory' },
      { label: 'Cards', path: '/tensions/cards' },
    ],
    filterLabel: 'Chord type',
    filterOptions: CHORD_TYPE_NAMES.map(k => ({
      label: `${CHORD_TYPES[k].fullName} (${k})`,
      value: k,
    })),
    buttonLabel: 'Random chord',
    onRandom: (filter) => next(filter),
  })

  const view = { container, get state() { return state }, next, update };
  resumeExercise(view)
  return exerciseCleanup(view, () => shell.destroy())
}
