import { SCALES, getScaleNotes } from '../music/scales.js'

export default function render(container) {
  const items = Object.entries(SCALES).map(([name, { pattern, steps, note }]) => {
    const exampleNotes = getScaleNotes('C', name).join(' — ')
    const noteHTML = note ? `<p class="text-muted" style="font-style:italic">${note}</p>` : ''
    return `
      <div class="theory-item">
        <div class="theory-item-title">${name}</div>
        <div class="theory-item-subtitle">Steps: ${steps}</div>
        <p class="text-muted">C example: <strong>${exampleNotes}</strong></p>
        <p class="text-muted">${pattern.length} notes &nbsp;·&nbsp; Intervals: ${pattern.join(', ')}</p>
        ${noteHTML}
      </div>
    `
  }).join('')

  container.innerHTML = `
    <div class="page-header">
      <h1>Scales — Theory</h1>
      <div class="page-nav-links">
        <a href="#/scales/exercises">Exercises →</a>
      </div>
    </div>

    <div class="theory-content">
      <p class="text-muted mb-lg">A scale is a sequence of notes in ascending order defined by a fixed interval pattern from the root.</p>
      <p class="text-muted mb-lg"><strong>W</strong> = whole step (2 semitones) &nbsp; <strong>H</strong> = half step (1 semitone) &nbsp; <strong>WH</strong> = 3 semitones</p>

      <div class="theory-list">${items}</div>
    </div>
  `
}
