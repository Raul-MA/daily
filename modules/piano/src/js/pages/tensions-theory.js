import { copy } from '../../i18n.js';
import { CHORD_TYPES } from '../music/chords.js'

export default function render(container) {
  const items = Object.entries(CHORD_TYPES).map(([, chord]) => `
    <div class="theory-item">
      <div class="theory-item-title">${copy(chord.fullName)} ${copy("&nbsp;")}<code>${copy(chord.symbol)}</code></div>
      <table class="chord-tones-table mt-sm">
        <thead><tr><th>${copy("Degree")}</th><th>${copy("Interval")}</th></tr></thead>
        <tbody>
          ${copy(chord.degrees.map((deg, i) => `
            <tr>
              <td>${copy(deg)}</td>
              <td>${copy(chord.intervals[i])} ${copy("semitones")}</td>
            </tr>
          `).join(''))}
        </tbody>
      </table>
    </div>
  `).join('')

  container.innerHTML = copy(`
    <div class="page-header">
      <h1>${copy("Tensions — Theory")}</h1>
      <div class="page-nav-links">
        <a href="#/tensions/exercises">${copy("Exercises →")}</a>
        <a href="#/tensions/cards">${copy("Cards →")}</a>
      </div>
    </div>

    <div class="theory-content">
      <p class="text-muted mb-lg">
        ${copy("A 7th chord is built by stacking thirds above a root. The")} <strong>${copy("chord tones")}</strong> ${copy("are the root (1), third (3), fifth (5), and seventh (7) — with chromatic alterations depending on chord type.")}
        <strong>${copy("Tensions")}</strong> ${copy("(9ths, 11ths, 13ths) are extensions added above the 7th.")}
      </p>

      <div class="theory-item mb-md">
        <div class="theory-item-title">${copy("Guide tones")}</div>
        <p>${copy("The")} <strong>${copy("3rd and 7th")}</strong> ${copy("are the guide tones — they define the chord quality and voice-leading direction. The root and fifth are often omitted in jazz voicings.")}</p>
      </div>

      <div class="theory-list">${copy(items)}</div>
    </div>
  `)
}
