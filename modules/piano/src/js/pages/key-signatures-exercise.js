import { pianoAsset } from '../router.js';
import { getKeyboardVoicing } from '../music/notes.js'
import { getScaleNotes } from '../music/scales.js'
import { createExerciseShell, buildExerciseCardHTML } from '../components/exercise-shell.js'
import { randomKeySignatureQuestion } from '../music/key-signatures.js'

export default function render(container) {
  let state = { question: null, revealed: false }

  function next() {
    state = { question: randomKeySignatureQuestion(), revealed: false }
    update()
  }

  function update() {
    const q = state.question
    if (!q) return

    const questionHTML = `
      <span class="label">Key</span>
      <span class="note-display">${q.key}</span>
      <span class="label">What is the key signature?</span>
    `

    const answerHTML = `
      <span class="answer-label">Key Signature</span>
      <span class="answer-main">${q.key} Major</span>
      <span class="answer-sub">${q.description}</span>
      <span class="answer-sub text-muted">Relative minor: ${q.relativeMinor}m</span>
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

  next()
  return () => shell.destroy()
}
