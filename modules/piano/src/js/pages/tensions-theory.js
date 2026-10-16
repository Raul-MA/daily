import { CHORD_TYPES } from '../music/chords.js'

export default function render(container) {
  const items = Object.entries(CHORD_TYPES).map(([, chord]) => `
    <div class="theory-item">
      <div class="theory-item-title">${chord.fullName} &nbsp;<code>${chord.symbol}</code></div>
      <table class="chord-tones-table mt-sm">
        <thead><tr><th>Degree</th><th>Interval</th></tr></thead>
        <tbody>
          ${chord.degrees.map((deg, i) => `
            <tr>
              <td>${deg}</td>
              <td>${chord.intervals[i]} semitones</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `).join('')

  container.innerHTML = `
    <div class="page-header">
      <h1>Tensions — Theory</h1>
      <div class="page-nav-links">
        <a href="#/tensions/exercises">Exercises →</a>
        <a href="#/tensions/cards">Cards →</a>
      </div>
    </div>

    <div class="theory-content">
      <p class="text-muted mb-lg">
        A 7th chord is built by stacking thirds above a root. The <strong>chord tones</strong> are the root (1), third (3), fifth (5), and seventh (7) — with chromatic alterations depending on chord type.
        <strong>Tensions</strong> (9ths, 11ths, 13ths) are extensions added above the 7th.
      </p>

      <div class="theory-item mb-md">
        <div class="theory-item-title">Guide tones</div>
        <p>The <strong>3rd and 7th</strong> are the guide tones — they define the chord quality and voice-leading direction. The root and fifth are often omitted in jazz voicings.</p>
      </div>

      <div class="theory-list">${items}</div>
    </div>
  `
}
