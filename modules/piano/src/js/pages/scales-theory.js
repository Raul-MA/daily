import { copy } from '../../i18n.js';
import { SCALES, getScaleNotes } from '../music/scales.js'

export default function render(container) {
  const items = Object.entries(SCALES).map(([name, { pattern, steps, note }]) => {
    const exampleNotes = getScaleNotes('C', name).join(' — ')
    const noteHTML = note ? `<p class="text-muted" style="font-style:italic">${copy(note)}</p>` : ''
    return `
      <div class="theory-item">
        <div class="theory-item-title">${copy(name)}</div>
        <div class="theory-item-subtitle">${copy("Steps:")} ${copy(steps)}</div>
        <p class="text-muted">${copy("C example:")} <strong>${copy(exampleNotes)}</strong></p>
        <p class="text-muted">${copy(pattern.length)} ${copy("notes &nbsp;·&nbsp; Intervals:")} ${copy(pattern.join(', '))}</p>
        ${copy(noteHTML)}
      </div>
    `
  }).join('')

  container.innerHTML = copy(`
    <div class="page-header">
      <h1>${copy("Scales — Theory")}</h1>
      <div class="page-nav-links">
        <a href="#/scales/exercises">${copy("Exercises →")}</a>
      </div>
    </div>

    <div class="theory-content">
      <p class="text-muted mb-lg">${copy("A scale is a sequence of notes in ascending order defined by a fixed interval pattern from the root.")}</p>
      <p class="text-muted mb-lg"><strong>${copy("W")}</strong> ${copy("= whole step (2 semitones) &nbsp;")} <strong>${copy("H")}</strong> ${copy("= half step (1 semitone) &nbsp;")} <strong>${copy("WH")}</strong> ${copy("= 3 semitones")}</p>

      <div class="theory-list">${copy(items)}</div>
    </div>
  `)
}
