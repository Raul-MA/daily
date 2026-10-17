import { copy } from '../../i18n.js';
import { MODES, getModeNotes } from '../music/modes.js'

export default function render(container) {
  const items = MODES.map(m => {
    const exampleNotes = getModeNotes('C', m.name).join(' — ')
    return `
      <div class="theory-item">
        <div class="theory-item-title">${copy(m.degree)} ${copy("&nbsp;")} ${copy(m.name)}</div>
        <div class="theory-item-subtitle">${copy(m.feel)}</div>
        <p class="text-muted">${copy("Formula:")} <code>${copy(m.formula)}</code></p>
        <p class="text-muted">${copy("C example:")} <strong>${copy(exampleNotes)}</strong></p>
        <p class="text-muted">${copy("Characteristic tone:")} ${copy(m.characteristic)}</p>
        <p class="text-muted">${copy("Parent key:")} ${copy(m.parentKeyDesc)}</p>
        <p class="text-muted">${copy("Jazz context:")} ${copy(m.jazzContext)}</p>
      </div>
    `
  }).join('')

  container.innerHTML = copy(`
    <div class="page-header">
      <h1>${copy("Modes — Theory")}</h1>
      <div class="page-nav-links">
        <a href="#/modes/exercises">${copy("Exercises →")}</a>
        <a href="#/modal-characteristics/exercises">${copy("Characteristics Drill →")}</a>
      </div>
    </div>

    <div class="theory-content">
      <p class="text-muted mb-lg">${copy("The 7 modes are derived from the major scale by starting on each of its degrees. Each mode has a unique interval pattern and emotional character.")}</p>

      <div class="theory-list">${copy(items)}</div>

      <div class="theory-item mt-lg">
        <div class="theory-item-title">${copy("Parallel vs Relative modes")}</div>
        <p><strong>${copy("Relative:")}</strong> ${copy("Same notes, different starting point. D Dorian and C Ionian share the same notes.")}</p>
        <p><strong>${copy("Parallel:")}</strong> ${copy("Same root, different interval pattern. C Dorian and C Ionian start on C but have different notes.")}</p>
      </div>
    </div>
  `)
}
