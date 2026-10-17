import { copy } from '../../i18n.js';
import { CHORD_TYPES, AVAILABLE_TENSIONS, getChordTones } from '../music/chords.js'

export default function render(container) {
  const cards = Object.entries(CHORD_TYPES).map(([key, chord]) => {
    const exampleTones = getChordTones('C', key)
    const tonesHtml = exampleTones.map(t =>
      `<tr><td class="text-muted">${copy(t.degree)}</td><td style="color:var(--success);font-weight:700">${copy(t.note)}</td></tr>`
    ).join('')

    const tensions = AVAILABLE_TENSIONS[key] || []
    const tensionsHtml = tensions.length > 0
      ? tensions.map(t => `<span class="chip chip-accent">${copy(t.degree)}</span>`).join(' ')
      : `<span class="text-muted">${copy("None standard")}</span>`

    return `
      <div class="card">
        <div class="card-title">${copy(chord.fullName)}</div>
        <p><code>${copy(chord.symbol)}</code> ${copy("&nbsp; Degrees:")} ${copy(chord.degrees.join(' — '))}</p>
        <table class="chord-tones-table mt-sm">
          <thead><tr><th>${copy("Degree")}</th><th>${copy("C example")}</th></tr></thead>
          <tbody>${copy(tonesHtml)}</tbody>
        </table>
        <p class="text-muted mt-sm" style="font-size:var(--text-xs);text-transform:uppercase;letter-spacing:.06em">${copy("Available tensions")}</p>
        <div style="margin-top:4px">${copy(tensionsHtml)}</div>
      </div>
    `
  }).join('')

  container.innerHTML = copy(`
    <div class="page-header">
      <h1>${copy("Tensions — Cards")}</h1>
      <div class="page-nav-links">
        <a href="#/tensions/theory">${copy("Theory →")}</a>
        <a href="#/tensions/exercises">${copy("Exercises →")}</a>
      </div>
    </div>

    <div class="card-grid">${copy(cards)}</div>
  `)
}
