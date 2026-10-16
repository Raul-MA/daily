import { mountMarkdown } from '../components/markdown.js'
import {
  ROOTLESS_CHORD_TYPE_KEYS,
  ROOTLESS_CHORD_TYPES,
  getRootlessVoicing,
} from '../music/rootless-voicings.js'

const THEORY_MD = `
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
        <div class="theory-item-title">${info.label} &nbsp;<code>${info.symbol}</code></div>
        <p class="text-muted">${info.usage}</p>
        <div style="margin-top:var(--space-xs)">
          <span class="chip chip-accent">A: ${aDegrees}</span>
          <span class="chip">B: ${bDegrees}</span>
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
      <div class="theory-item-title">C major ii–V–I (A→B→A)</div>
      <table class="chord-tones-table mt-sm">
        <thead>
          <tr><th>Chord</th><th>Voicing</th><th>Notes</th></tr>
        </thead>
        <tbody>
          <tr><td>Dm7</td><td>A</td><td>${ii}</td></tr>
          <tr><td>G7</td><td>B</td><td>${v}</td></tr>
          <tr><td>Cmaj7</td><td>A</td><td>${i}</td></tr>
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
  list.innerHTML = buildQualityItems() + buildTwoFiveOneExample()
  content.appendChild(list)

  container.innerHTML = `
    <div class="page-header">
      <h1>Rootless Voicings — Theory</h1>
      <div class="page-nav-links">
        <a href="#/rootless-voicings/exercises">Exercises →</a>
        <a href="#/shell-chords/theory">Shell Chords →</a>
      </div>
    </div>
  `

  container.appendChild(content)
}
