import { buildKeyboardDiagramHTML } from './keyboard-diagram.js';
export function buildExerciseCardHTML({ questionHTML, answerHTML, revealed = false, keyboards = [] }) {
  if (!revealed) {
    return `
      <div class="exercise-card">
        <div class="card-question">
          ${questionHTML}
          <span class="card-hint">tap to reveal answer</span>
        </div>
      </div>
    `
  }
  return `
    <div class="exercise-card revealed">
      <div class="card-answer">
        ${answerHTML}
        <span class="card-hint">tap to see question</span>
      </div>
    </div>
    ${keyboards.length ? `<div class="exercise-keyboards">${keyboards.map(({ tones, ...options }) => buildKeyboardDiagramHTML(tones, options)).join('')}</div>` : ''}
  `
}
export function buildChordTonesTableHTML(tones, bassNote) {
  const rows = tones.map(t => {
    const isBass = bassNote && t.note === bassNote
    return `
      <tr${isBass ? ' style="background:var(--accent-dim)"' : ''}>
        <td class="text-muted">${t.degree}</td>
        <td style="color:${isBass ? 'var(--accent)' : 'var(--success)'};font-weight:700;font-size:var(--text-lg)">${t.note}${isBass ? ' ♩' : ''}</td>
      </tr>
    `
  }).join('')

  return `
    <table class="chord-tones-table" style="min-width:180px;margin-top:var(--space-sm)">
      <thead>
        <tr>
          <th>Degree</th>
          <th>Note${bassNote ? ' (♩ = bass)' : ''}</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `
}