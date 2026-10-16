import { mountMarkdown } from '../components/markdown.js'
import { SUSPENDED_CHORD_TYPES } from '../music/suspended-chords.js'

const THEORY_MD = `
## Suspended Chords (sus2 / sus4)

A **suspended chord** replaces the 3rd with either a **2nd** or **4th**.

- **sus2**: 1–2–5
- **sus4**: 1–4–5

Because the 3rd is missing, suspended chords delay the clear major/minor quality.

## Dominant sus sound

In jazz and fusion, the most common suspended color is **7sus4** (and extensions like **9sus4**):

- **7sus4** = 1–4–5–♭7
- **9sus4** = 1–4–5–♭7–9

This sound often resolves to a regular dominant by moving **4 → 3** while keeping the rest of the harmony stable.

## Slash-chord relationship

Suspended dominants are frequently voiced as slash chords.

Example: **C7sus4(9)** can be heard as **B♭/C** (B♭ major triad over C bass).

This links sus harmony to modal colors, especially Phrygian and Mixolydian contexts where the suspended 4th is central.
`

function buildTypeItems() {
  return Object.values(SUSPENDED_CHORD_TYPES).map(chord => `
    <div class="theory-item">
      <div class="theory-item-title">${chord.fullName} &nbsp;<code>${chord.symbol}</code></div>
      <p class="text-muted">Degrees: <strong>${chord.degrees.join(' – ')}</strong></p>
      <p class="text-muted">Intervals: ${chord.intervals.map(i => `${i} st`).join(', ')}</p>
    </div>
  `).join('')
}

export default function render(container) {
  const content = document.createElement('div')
  content.className = 'theory-content'
  mountMarkdown(content, THEORY_MD)

  const list = document.createElement('div')
  list.className = 'theory-list'
  list.innerHTML = buildTypeItems()
  content.appendChild(list)

  container.innerHTML = `
    <div class="page-header">
      <h1>Suspended Chords — Theory</h1>
      <div class="page-nav-links">
        <a href="#/suspended-chords/exercises">Exercises →</a>
        <a href="#/extended-chords/theory">Extended Chords →</a>
      </div>
    </div>
  `

  container.appendChild(content)
}
