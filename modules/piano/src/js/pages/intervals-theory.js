import { INTERVALS } from '../music/intervals.js'

export default function render(container) {
  const rows = INTERVALS.filter(i => i.semitones <= 12).map(i => `
    <tr>
      <td><strong>${i.name}</strong></td>
      <td>${i.semitones}</td>
      <td><code>${i.abbr}</code></td>
      ${i.tension ? `<td><span class="chip chip-accent">${i.tension}</span></td>` : '<td class="text-muted">—</td>'}
    </tr>
  `).join('')

  container.innerHTML = `
    <div class="page-header">
      <h1>Intervals — Theory</h1>
      <div class="page-nav-links">
        <a href="#/intervals/exercises">Exercises →</a>
      </div>
    </div>

    <div class="theory-content">
      <p class="text-muted">An interval is the distance between two notes, measured in semitones (half steps).</p>

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Semitones</th>
            <th>Abbreviation</th>
            <th>Tension name</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>

      <div class="theory-item mt-lg">
        <div class="theory-item-title">How to calculate an interval</div>
        <p>Count the semitones between the two notes. Each fret on a guitar or each key on a piano is one semitone.</p>
        <p>Example: <strong>C → G</strong> = 7 semitones = <em>Perfect 5th</em></p>
        <p>Example: <strong>C → Bb</strong> = 10 semitones = <em>Minor 7th</em></p>
      </div>

      <div class="theory-item mt-md">
        <div class="theory-item-title">Compound intervals (tensions)</div>
        <p>When an interval exceeds an octave, it becomes a <strong>compound interval</strong>. These are used as chord tensions:</p>
        <ul>
          <li><strong>9th</strong> = Major 2nd + octave (2 semitones above the octave)</li>
          <li><strong>11th</strong> = Perfect 4th + octave (5 semitones)</li>
          <li><strong>13th</strong> = Major 6th + octave (9 semitones)</li>
        </ul>
        <p>Altered tensions (♭9, ♯9, ♯11, ♭13) are chromatic variations of these compound intervals.</p>
      </div>
    </div>
  `
}
