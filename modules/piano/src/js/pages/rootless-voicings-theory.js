import { copy } from '../../i18n.js';
import { mountMarkdown } from '../components/markdown.js'
import {
  ROOTLESS_CHORD_TYPE_KEYS,
  ROOTLESS_CHORD_TYPES,
  getRootlessVoicing,
} from '../music/rootless-voicings.js'

export const THEORY_MD = `
## Rootless Voicings (A & B)

**Rootless voicings** omit the root and keep the color tones that define function and movement.

- **A voicing** and **B voicing** are two fixed 4-note layouts used for major, dominant, minor, and half-diminished chords.
- They are commonly split as **LH = lower two notes** and **RH = upper two notes**.
- In a rhythm section, the bass covers the root, so piano can focus on guide tones and extensions.

### Why they matter

Rootless A/B voicings are central to jazz comping because they produce compact, reusable shapes and very smooth voice leading through functional progressions.

### When to use A vs B

- Use either as a stable comping shape for one chord quality.
- Alternate A and B to keep motion compact through progressions.
- A classic major-key line is **ii (A) → V (B) → I (A)**.
`

function buildQualityItems() {
  return ROOTLESS_CHORD_TYPE_KEYS.map(type => {
    const info = ROOTLESS_CHORD_TYPES[type]
    const aDegrees = info.voicings.A.degrees.join(' – ')
    const bDegrees = info.voicings.B.degrees.join(' – ')

    return `
      <div class="theory-item">
        <div class="theory-item-title">${copy(info.label)} ${copy("&nbsp;")}<code>${copy(info.symbol)}</code></div>
        <p class="text-muted">${copy(info.usage)}</p>
        <div style="margin-top:var(--space-xs)">
          <span class="chip chip-accent">${copy("A:")} ${copy(aDegrees)}</span>
          <span class="chip">${copy("B:")} ${copy(bDegrees)}</span>
        </div>
      </div>
    `
  }).join('')
}

function buildTwoFiveOneExample() {
  const ii = getRootlessVoicing('D', 'm7', 'A').map(t => t.note).join(' – ')
  const v = getRootlessVoicing('G', '7', 'B').map(t => t.note).join(' – ')
  const i = getRootlessVoicing('C', 'maj7', 'A').map(t => t.note).join(' – ')

  return `
    <div class="theory-item">
      <div class="theory-item-title">${copy("C major ii–V–I (A→B→A)")}</div>
      <table class="chord-tones-table mt-sm">
        <thead>
          <tr><th>${copy("Chord")}</th><th>${copy("Voicing")}</th><th>${copy("Notes")}</th></tr>
        </thead>
        <tbody>
          <tr><td>${copy("Dm7")}</td><td>${copy("A")}</td><td>${copy(ii)}</td></tr>
          <tr><td>${copy("G7")}</td><td>${copy("B")}</td><td>${copy(v)}</td></tr>
          <tr><td>${copy("Cmaj7")}</td><td>${copy("A")}</td><td>${copy(i)}</td></tr>
        </tbody>
      </table>
    </div>
  `
}

export default function render(container) {
  const content = document.createElement('div')
  content.className = 'theory-content'
  mountMarkdown(content, THEORY_MD)

  const list = document.createElement('div')
  list.className = 'theory-list'
  list.innerHTML = copy(buildQualityItems() + buildTwoFiveOneExample())
  content.appendChild(list)

  container.innerHTML = copy(`
    <div class="page-header">
      <h1>${copy("Rootless Voicings — Theory")}</h1>
      <div class="page-nav-links">
        <a href="#/rootless-voicings/exercises">${copy("Exercises →")}</a>
        <a href="#/shell-chords/theory">${copy("Shell Chords →")}</a>
      </div>
    </div>
  `)

  container.appendChild(content)
}
