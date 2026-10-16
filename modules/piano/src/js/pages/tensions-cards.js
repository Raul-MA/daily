import { CHORD_TYPES, AVAILABLE_TENSIONS, getChordTones } from '../music/chords.js'

export default function render(container) {
  const cards = Object.entries(CHORD_TYPES).map(([key, chord]) => {
    const exampleTones = getChordTones('C', key)
    const tonesHtml = exampleTones.map(t =>
      `<tr><td class="text-muted">${t.degree}</td><td style="color:var(--success);font-weight:700">${t.note}</td></tr>`
    ).join('')

    const tensions = AVAILABLE_TENSIONS[key] || []
    const tensionsHtml = tensions.length > 0
      ? tensions.map(t => `<span class="chip chip-accent">${t.degree}</span>`).join(' ')
      : '<span class="text-muted">None standard</span>'

    return `
      <div class="card">
        <div class="card-title">${chord.fullName}</div>
        <p><code>${chord.symbol}</code> &nbsp; Degrees: ${chord.degrees.join(' — ')}</p>
        <table class="chord-tones-table mt-sm">
          <thead><tr><th>Degree</th><th>C example</th></tr></thead>
          <tbody>${tonesHtml}</tbody>
        </table>
        <p class="text-muted mt-sm" style="font-size:var(--text-xs);text-transform:uppercase;letter-spacing:.06em">Available tensions</p>
        <div style="margin-top:4px">${tensionsHtml}</div>
      </div>
    `
  }).join('')

  container.innerHTML = `
    <div class="page-header">
      <h1>Tensions — Cards</h1>
      <div class="page-nav-links">
        <a href="#/tensions/theory">Theory →</a>
        <a href="#/tensions/exercises">Exercises →</a>
      </div>
    </div>

    <div class="card-grid">${cards}</div>
  `
}
