import { exerciseState, resumeExercise, exerciseCleanup } from '../../exercise-state.js';
import { copy } from '../../i18n.js';
import { pianoAsset } from '../router.js';
import { getKeyboardVoicing } from '../music/notes.js'
import { getScaleNotes } from '../music/scales.js'
import { createExerciseShell, buildExerciseCardHTML } from '../components/exercise-shell.js'
import { randomKeySignatureQuestion } from '../music/key-signatures.js'

export default function render(container) {
  let state = exerciseState({ question: null, revealed: false })

  function next() {
    state = { question: randomKeySignatureQuestion(), revealed: false }
    update()
  }

  function update() {
    const q = state.question
    if (!q) return

    const questionHTML = `
      <span class="label">${copy("Key")}</span>
      <span class="note-display">${copy(q.key)}</span>
      <span class="label">${copy("What is the key signature?")}</span>
    `

    const answerHTML = `
      <span class="answer-label">${copy("Key Signature")}</span>
      <span class="answer-main">${copy(q.key)} ${copy("Major")}</span>
      <span class="answer-sub">${copy(q.description)}</span>
      <span class="answer-sub text-muted">${copy("Relative minor:")} ${copy(q.relativeMinor)}${copy("m")}</span>
      <img class="key-sig-img" src="${pianoAsset(q.img)}" alt="${q.key} major key signature"
           onerror="this.style.display='none'" style="margin-top:var(--space-sm)" />
    `

    shell.renderCard(buildExerciseCardHTML({
      questionHTML, answerHTML, revealed: state.revealed,
      keyboards: [{ ...getKeyboardVoicing(getScaleNotes(q.key, 'Major').map(note => ({ note }))), label: `${q.key} major scale` }],
    }))

    container.querySelector('.exercise-card').addEventListener('click', () => {
      state.revealed = !state.revealed
      update()
    })
  }

  const shell = createExerciseShell(container, {
    title: 'Key Signatures',
    links: [{ label: 'Cards', path: '/key-signatures/cards' }],
    filterOptions: [],
    buttonLabel: 'Random key',
    onRandom: () => next(),
  })

  const view = { container, get state() { return state }, next, update };
  resumeExercise(view)
  return exerciseCleanup(view, () => shell.destroy())
}
