import { copy } from '../../i18n.js';
import { mountMarkdown } from '../components/markdown.js'
import { CHORD_TYPES, EXTENDED_CHORD_TYPES } from '../music/chords.js'

export const THEORY_MD = `
## Extended Chords

An **extended chord** starts with a 7th chord and keeps stacking thirds above it. Once the stack goes past the octave, the new chord tones are named **9th**, **11th**, and **13th** instead of 2nd, 4th, and 6th.

- **9th chord** = 7th chord + 9th
- **11th chord** = 9th chord + 11th
- **13th chord** = 11th chord + 13th

In strict tertian theory, a higher extension implies the lower ones below it. In real voicings, players often omit tones that are less essential.

### What usually matters most

The **3rd and 7th** still define the chord quality and function. Those guide tones tell you whether the chord is major, dominant, or minor.

The **5th** is often optional, and the **11th** is commonly omitted on many 13th voicings because it can muddy the sound or clash with the 3rd.
`

function buildChordItem(extChord) {
  const baseChord = CHORD_TYPES[extChord.baseChordType]
  const baseDegrees = new Set(baseChord.degrees)
  const addedDegrees = extChord.degrees.filter(degree => !baseDegrees.has(degree))
  const addedLabel = addedDegrees.length > 0 ? addedDegrees.join(', ') : 'None'

  return `
    <div class="theory-item">
      <div class="theory-item-title">${copy(extChord.fullName)} ${copy("&nbsp;")}<code>${copy(extChord.symbol)}</code></div>
      <p class="text-muted">
        ${copy("Built from")} <strong>${copy(baseChord.fullName)}</strong> ${copy("by adding")} <strong>${copy(addedLabel)}</strong>.
      </p>
      <table class="chord-tones-table mt-sm">
        <thead><tr><th>${copy("Degree")}</th><th>${copy("Interval")}</th></tr></thead>
        <tbody>
          ${copy(extChord.degrees.map((degree, i) => `
            <tr>
              <td>${copy(degree)}</td>
              <td>${copy(extChord.intervals[i])} ${copy("semitones")}</td>
            </tr>
          `).join(''))}
        </tbody>
      </table>
      ${copy(extChord.omitNote ? `<p class="text-muted mt-sm"><strong>${copy("Voicing note:")}</strong> ${copy(extChord.omitNote)}.</p>` : '')}
    </div>
  `
}

export default function render(container) {
  const content = document.createElement('div')
  content.className = 'theory-content'
  mountMarkdown(content, THEORY_MD)

  const chordList = document.createElement('div')
  chordList.className = 'theory-list'
  chordList.innerHTML = copy(Object.values(EXTENDED_CHORD_TYPES).map(buildChordItem).join(''))
  content.appendChild(chordList)

  container.innerHTML = copy(`
    <div class="page-header">
      <h1>${copy("Extended Chords — Theory")}</h1>
      <div class="page-nav-links">
        <a href="#/extended-chords/exercises">${copy("Exercises →")}</a>
        <a href="#/available-tensions/theory">${copy("Available Tensions →")}</a>
      </div>
    </div>
  `)

  container.appendChild(content)
}
