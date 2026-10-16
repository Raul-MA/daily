import { mountMarkdown } from '../components/markdown.js'
import { SHELL_CHORD_TYPE_KEYS, SHELL_CHORD_TYPES } from '../music/shell-chords.js'

const THEORY_MD = `
## Shell Chords (Voicings)

A **shell voicing** keeps only the **3rd and 7th** of a 7th chord.

- **3rd** tells you if the chord is major or minor
- **7th** tells you if the sound is major-7, dominant-7, minor-7, half-diminished, or diminished
- Root and 5th can be implied by bass and context

### Two basic shell positions

- **3–7**: 3rd on the bottom, 7th on top
- **7–3**: 7th on the bottom, 3rd on top

Pianists practice both positions in all 12 keys before moving to fuller rootless voicings.

### Why shells are central in jazz

On a **ii–V–I**, shell tones move with very small intervals (often common tone or half-step), which creates smooth voice leading.

In C major:

- **Dm7 (F–C)** → **G7 (F–B)** → **Cmaj7 (E–B)**
- Only one note changes at a time in each step.
`

function buildTypeItems() {
  return SHELL_CHORD_TYPE_KEYS.map(type => {
    const item = SHELL_CHORD_TYPES[type]
    return `
      <div class="theory-item">
        <div class="theory-item-title">${item.label} &nbsp;<code>${item.symbol}</code></div>
        <p class="text-muted">Shell = <strong>3rd + 7th</strong> (or 7th + 3rd) for this chord quality.</p>
      </div>
    `
  }).join('')
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
      <h1>Shell Chords — Theory</h1>
      <div class="page-nav-links">
        <a href="#/shell-chords/exercises">Exercises →</a>
        <a href="#/voice-leading/exercises">Guide Tones →</a>
      </div>
    </div>
  `
  container.appendChild(content)
}
