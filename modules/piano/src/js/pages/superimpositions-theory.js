import { copy } from '../../i18n.js';
import { mountMarkdown } from '../components/markdown.js'
import { SUPERIMPOSITIONS } from '../music/superimpositions.js'
import { transpose } from '../music/notes.js'


function exampleSlashChord(ust) {
  const triadRoot = transpose('C', ust.upperTriadSemitones, ust.flatDegree)
  const qual = ust.triadQuality === 'major' ? '' : 'm'
  return `${triadRoot}${qual}/C`
}

function buildUSTSection(ust) {
  const triadLabels = ['Root of triad', 'Major 3rd of triad', 'Perfect 5th of triad']
  const tensionRows = ust.tensions.map((t, i) => `| ${triadLabels[i]} | **${t}** |`).join('\n')

  return `
### ${ust.colorLabel} — ${ust.degreeLabel} ${ust.triadQuality} triad

**Example:** \`${exampleSlashChord(ust)}\`

| Triad tone | Interval above bass |
|------------|---------------------|
${tensionRows}

**Chord context:** \`${ust.chordContext}\`

${ust.description}

> See also: [${ust.scaleRef.name} mode](#${ust.scaleRef.path})

---
`
}

const INTRO_MD = `
## Upper-Structure Triads

An **upper-structure triad (UST)** is a simple major or minor triad played above a bass note (or 7th-chord shell) to highlight specific **colour tones** — the tensions that distinguish one chord-scale from another.

### Why it works

A 7th chord typically spells only four notes: root, 3rd, 5th, and 7th. The remaining scale degrees (9, 11, 13 and their alterations) are the **tensions** that give each mode its characteristic sound.

Superimposing a triad built on one of those tensions efficiently delivers two or three colour tones at once. The underlying chord supplies the guide tones; the upper triad supplies the colour.

### Key principle

> The upper triad does **not** always spell a complete mode by itself. It highlights the *characteristic* tensions while the rhythm-section harmony provides the remaining tones.

---
`

const QUICK_REF_MD = `
### Applying upper structures in practice

1. **Identify the target chord-scale** — e.g. Lydian over a IVΔ7 or IΔ7 chord.
2. **Choose the corresponding UST** — e.g. the major triad a 2nd above (II triad).
3. **Voice the triad in the right hand** while the bass or left hand states the chord root.
4. **Listen for the colour** — the triad's notes are the colour tones; the chord underneath anchors the harmony.

### Quick reference (root = C)

| Slash chord | Degree | Colour tones | Sound |
|-------------|--------|--------------|-------|
| D/C | II | 9, ♯11, 13 | Lydian |
| B♭/C | ♭VII | ♭7, 9, 11 | Mixolydian / sus |
| D♭/C | ♭II | ♭9, 11, ♭13 | Phrygian / pedal |
`

export const THEORY_MD =
  INTRO_MD +
  SUPERIMPOSITIONS.map(buildUSTSection).join('\n') +
  QUICK_REF_MD

export default function render(container) {
  const content = document.createElement('div')
  content.className = 'theory-content'

  container.innerHTML = copy(`
    <div class="page-header">
      <h1>${copy("Upper Structures — Theory")}</h1>
      <div class="page-nav-links">
        <a href="#/superimpositions/exercises">${copy("Exercises →")}</a>
        <a href="#/modes/theory">${copy("Modes →")}</a>
      </div>
    </div>
  `)
  mountMarkdown(content, THEORY_MD)
  container.appendChild(content)
}
