import { mountMarkdown } from '../components/markdown.js'
import { MODULATION_TYPES } from '../music/modulations.js'

function buildTonicizationNote() {
  return `
> **Tonicization vs. Modulation**
> A brief emphasis of another key — such as a single ii–V leading to a chord — is **tonicization**, not full modulation.
> Full modulation requires the new tonal centre to be clearly *established* for the listener over several bars.
`
}

function buildTypeSection(t) {
  let exampleMd = ''

  if (t.id === 'diatonic') {
    const rows = t.example.table.map(r =>
      `| ${r.chord} | ${r.oldKey} | ${r.newKey} |`
    ).join('\n')
    exampleMd = `
**Example:** ${t.example.from} → ${t.example.to} via pivot **${t.example.pivot}**

| Chord | Role in ${t.example.from} | Role in ${t.example.to} |
|-------|--------------------------|------------------------|
${rows}

Progression: \`${t.example.progression}\`
`
  } else if (t.id === 'direct') {
    exampleMd = `
**Example:** \`${t.example.progression}\`

*${t.example.note}*
`
  } else if (t.id === 'enharmonic') {
    exampleMd = `
**Example:**

| Spelling | Function |
|----------|----------|
| ${t.example.original} | Original |
| ${t.example.respelling} | Respelled |

${t.example.target}

*${t.example.note}*
`
  } else if (t.id === 'sequential') {
    exampleMd = `
**Example:**

\`${t.example.progression}\`

*${t.example.note}*
`
  } else if (t.id === 'relative' || t.id === 'parallel') {
    exampleMd = `
**Example:** ${t.example.from} ↔ ${t.example.to}

*${t.example.note}*
`
  }

  return `
### ${t.label}. ${t.name}

${t.description}
${exampleMd}
---
`
}

const THEORY_MD =
  `## Modulation

**Modulation** is a change of key / tonal centre that is established clearly enough for the listener to perceive a new tonic.

` +
  buildTonicizationNote() +
  `
---

` +
  MODULATION_TYPES.map(buildTypeSection).join('\n')

export default function render(container) {
  const content = document.createElement('div')
  content.className = 'theory-content'

  container.innerHTML = `
    <div class="page-header">
      <h1>Modulation — Theory</h1>
      <div class="page-nav-links">
        <a href="#/modulations/exercises">Exercises →</a>
      </div>
    </div>
  `
  mountMarkdown(content, THEORY_MD)
  container.appendChild(content)
}
