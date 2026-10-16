import { getKeyboardVoicing } from '../music/notes.js'
import { createExerciseShell, buildExerciseCardHTML, buildChordTonesTableHTML } from '../components/exercise-shell.js'
import { randomChordQuestion, CHORD_TYPE_NAMES, CHORD_TYPES } from '../music/chords.js'

export default function render(container) {
  let state = { question: null, revealed: false }

  function next(filter) {
    state = { question: randomChordQuestion(filter), revealed: false }
    update()
  }

  function update() {
    const q = state.question
    if (!q) return

    const questionHTML = `
      <span class="label">Chord</span>
      <span class="note-display">${q.name}</span>
      <span class="label">What are the chord tones?</span>
    `

    const answerHTML = `
      <span class="answer-label">${CHORD_TYPES[q.chordType].fullName}</span>
      ${buildChordTonesTableHTML(q.tones)}
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

  next([])
  return () => shell.destroy()
}
