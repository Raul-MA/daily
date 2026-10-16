import { CHORD_TYPES, AVAILABLE_TENSIONS, getAvailableTensionNotes } from "../music/chords.js";

export default function render(container) {
  const cards = Object.entries(CHORD_TYPES).map(([key, chord]) => {
    const tensions = AVAILABLE_TENSIONS[key] || []
    const tensionNotes = getAvailableTensionNotes('C', key)

    const tensionRows = tensions.map((t, i) => `
      <tr>
        <td><span class="chip chip-accent">${t.degree}</span></td>
        <td style="color:var(--success);font-weight:700">${tensionNotes[i]?.note ?? '—'}</td>
        <td class="text-muted">${t.description}</td>
      </tr>
    `).join('')

    return `
      <div class="card">
        <div class="card-title">${chord.fullName} &nbsp;<code>${chord.symbol}</code></div>
        <p class="text-muted mb-sm">Degrees: ${chord.degrees.join(' — ')}</p>
        ${tensions.length > 0
          ? `<table class="chord-tones-table">
              <thead><tr><th>Tension</th><th>C example</th><th>Character</th></tr></thead>
              <tbody>${tensionRows}</tbody>
            </table>`
          : '<p class="text-muted">No standard available tensions</p>'
        }
      </div>
    `
  }).join('')

  container.innerHTML = `
    <div class="page-header">
      <h1>Available Tensions — Cards</h1>
      <div class="page-nav-links">
        <a href="#/available-tensions/theory">Theory →</a>
        <a href="#/available-tensions/exercises">Exercises →</a>
      </div>
    </div>

    <div class="card-grid">${cards}</div>
  `
}
