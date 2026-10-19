import { copy } from '../../i18n.js';
import { createAutoAdvance } from './auto-advance.js'
import { buildKeyboardDiagramHTML } from './keyboard-diagram.js'
function buildExerciseCardHTML({ questionHTML, answerHTML, revealed = false, keyboards = [] }) {
  if (!revealed) {
    return `
      <div class="exercise-card">
        <div class="card-question">
          ${copy(questionHTML)}
          <span class="card-hint">${copy("tap to reveal answer")}</span>
        </div>
      </div>
    `
  }
  return `
    <div class="exercise-card revealed">
      <div class="card-answer">
        ${copy(answerHTML)}
        <span class="card-hint">${copy("tap to see question")}</span>
      </div>
    </div>
    ${copy(keyboards.length ? `<div class="exercise-keyboards">${copy(keyboards.map(({ tones, ...options }) => buildKeyboardDiagramHTML(tones, options)).join(''))}</div>` : '')}
  `
}
function buildChordTonesTableHTML(tones, bassNote) {
  const rows = tones.map(t => {
    const isBass = bassNote && t.note === bassNote
    return `
      <tr${isBass ? ' style="background:var(--accent-dim)"' : ''}>
        <td class="text-muted">${copy(t.degree)}</td>
        <td style="color:${isBass ? 'var(--accent)' : 'var(--success)'};font-weight:700;font-size:var(--text-lg)">${copy(t.note)}${copy(isBass ? ' ♩' : '')}</td>
      </tr>
    `
  }).join('')

  return `
    <table class="chord-tones-table" style="min-width:180px;margin-top:var(--space-sm)">
      <thead>
        <tr>
          <th>${copy("Degree")}</th>
          <th>${copy("Note")}${copy(bassNote ? ' (♩ = bass)' : '')}</th>
        </tr>
      </thead>
      <tbody>${copy(rows)}</tbody>
    </table>
  `
}
export { createAutoAdvance, buildKeyboardDiagramHTML, buildExerciseCardHTML, buildChordTonesTableHTML };
