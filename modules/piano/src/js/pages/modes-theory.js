import { MODES, getModeNotes } from '../music/modes.js'

export default function render(container) {
  const items = MODES.map(m => {
    const exampleNotes = getModeNotes('C', m.name).join(' — ')
    return `
      <div class="theory-item">
        <div class="theory-item-title">${m.degree} &nbsp; ${m.name}</div>
        <div class="theory-item-subtitle">${m.feel}</div>
        <p class="text-muted">Formula: <code>${m.formula}</code></p>
        <p class="text-muted">C example: <strong>${exampleNotes}</strong></p>
        <p class="text-muted">Characteristic tone: ${m.characteristic}</p>
        <p class="text-muted">Parent key: ${m.parentKeyDesc}</p>
        <p class="text-muted">Jazz context: ${m.jazzContext}</p>
      </div>
    `
  }).join('')

  container.innerHTML = `
    <div class="page-header">
      <h1>Modes — Theory</h1>
      <div class="page-nav-links">
        <a href="#/modes/exercises">Exercises →</a>
        <a href="#/modal-characteristics/exercises">Characteristics Drill →</a>
      </div>
    </div>

    <div class="theory-content">
      <p class="text-muted mb-lg">The 7 modes are derived from the major scale by starting on each of its degrees. Each mode has a unique interval pattern and emotional character.</p>

      <div class="theory-list">${items}</div>

      <div class="theory-item mt-lg">
        <div class="theory-item-title">Parallel vs Relative modes</div>
        <p><strong>Relative:</strong> Same notes, different starting point. D Dorian and C Ionian share the same notes.</p>
        <p><strong>Parallel:</strong> Same root, different interval pattern. C Dorian and C Ionian start on C but have different notes.</p>
      </div>
    </div>
  `
}
