import { copy } from '../../i18n.js';
import { CHORD_TYPES, AVAILABLE_TENSIONS, getAvailableTensionNotes } from "../music/chords.js";

export default function render(container) {
  const cards = Object.entries(CHORD_TYPES).map(([key, chord]) => {
    const tensions = AVAILABLE_TENSIONS[key] || []
    const tensionNotes = getAvailableTensionNotes('C', key)

    const tensionRows = tensions.map((t, i) => `
      <tr>
        <td><span class="chip chip-accent">${copy(t.degree)}</span></td>
        <td style="color:var(--success);font-weight:700">${copy(tensionNotes[i]?.note ?? '—')}</td>
        <td class="text-muted">${copy(t.description)}</td>
      </tr>
    `).join('')

    return `
      <div class="card">
        <div class="card-title">${copy(chord.fullName)} ${copy("&nbsp;")}<code>${copy(chord.symbol)}</code></div>
        <p class="text-muted mb-sm">${copy("Degrees:")} ${copy(chord.degrees.join(' — '))}</p>
        ${copy(tensions.length > 0
          ? `<table class="chord-tones-table">
              <thead><tr><th>${copy("Tension")}</th><th>${copy("C example")}</th><th>${copy("Character")}</th></tr></thead>
              <tbody>${copy(tensionRows)}</tbody>
            </table>`
          : `<p class="text-muted">${copy("No standard available tensions")}</p>`)
        }
      </div>
    `
  }).join('')

  container.innerHTML = copy(`
    <div class="page-header">
      <h1>${copy("Available Tensions — Cards")}</h1>
      <div class="page-nav-links">
        <a href="#/available-tensions/theory">${copy("Theory →")}</a>
        <a href="#/available-tensions/exercises">${copy("Exercises →")}</a>
      </div>
    </div>

    <div class="card-grid">${copy(cards)}</div>
  `)
}
