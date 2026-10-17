import { copy } from '../../i18n.js';
import { INTERVALS } from '../music/intervals.js'

export default function render(container) {
  const rows = INTERVALS.filter(i => i.semitones <= 12).map(i => `
    <tr>
      <td><strong>${copy(i.name)}</strong></td>
      <td>${copy(i.semitones)}</td>
      <td><code>${copy(i.abbr)}</code></td>
      ${copy(i.tension ? `<td><span class="chip chip-accent">${copy(i.tension)}</span></td>` : `<td class="text-muted">${copy("—")}</td>`)}
    </tr>
  `).join('')

  container.innerHTML = copy(`
    <div class="page-header">
      <h1>${copy("Intervals — Theory")}</h1>
      <div class="page-nav-links">
        <a href="#/intervals/exercises">${copy("Exercises →")}</a>
      </div>
    </div>

    <div class="theory-content">
      <p class="text-muted">${copy("An interval is the distance between two notes, measured in semitones (half steps).")}</p>

      <table>
        <thead>
          <tr>
            <th>${copy("Name")}</th>
            <th>${copy("Semitones")}</th>
            <th>${copy("Abbreviation")}</th>
            <th>${copy("Tension name")}</th>
          </tr>
        </thead>
        <tbody>${copy(rows)}</tbody>
      </table>

      <div class="theory-item mt-lg">
        <div class="theory-item-title">${copy("How to calculate an interval")}</div>
        <p>${copy("Count the semitones between the two notes. Each fret on a guitar or each key on a piano is one semitone.")}</p>
        <p>${copy("Example:")} <strong>${copy("C → G")}</strong> ${copy("= 7 semitones =")} <em>${copy("Perfect 5th")}</em></p>
        <p>${copy("Example:")} <strong>${copy("C → Bb")}</strong> ${copy("= 10 semitones =")} <em>${copy("Minor 7th")}</em></p>
      </div>

      <div class="theory-item mt-md">
        <div class="theory-item-title">${copy("Compound intervals (tensions)")}</div>
        <p>${copy("When an interval exceeds an octave, it becomes a")} <strong>${copy("compound interval")}</strong>${copy(". These are used as chord tensions:")}</p>
        <ul>
          <li><strong>${copy("9th")}</strong> ${copy("= Major 2nd + octave (2 semitones above the octave)")}</li>
          <li><strong>${copy("11th")}</strong> ${copy("= Perfect 4th + octave (5 semitones)")}</li>
          <li><strong>${copy("13th")}</strong> ${copy("= Major 6th + octave (9 semitones)")}</li>
        </ul>
        <p>${copy("Altered tensions (♭9, ♯9, ♯11, ♭13) are chromatic variations of these compound intervals.")}</p>
      </div>
    </div>
  `)
}
