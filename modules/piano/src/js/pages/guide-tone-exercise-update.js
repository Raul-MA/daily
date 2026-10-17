import { copy } from '../../i18n.js';
import { buildExerciseCardHTML, getKeyboardMotion } from './guide-tone-exercise-shared.js';
export function update(ctx) {
    const q = ctx.state.question
    if (!q) return

    const questionHTML = `
      <span class="label">${copy("How do the guide tones resolve?")}</span>
      <span class="note-display">${copy(q.fromChordName)} → ${copy(q.toChordName)}</span>
      <span class="label" style="margin-top:var(--space-sm)">${copy(q.label)}</span>
    `

    const motionRows = q.motions.map(m => `
      <tr>
        <td class="text-muted">${copy(m.fromDegree)}</td>
        <td style="color:var(--success);font-weight:700;font-size:var(--text-lg)">${copy(m.fromNote)}</td>
        <td class="text-muted" style="padding:0 var(--space-xs)">→</td>
        <td style="color:var(--accent);font-weight:700;font-size:var(--text-lg)">${copy(m.toNote)}</td>
        <td class="text-muted">${copy(m.toDegree)}</td>
        <td class="text-muted" style="font-size:var(--text-sm);padding-left:var(--space-sm)">${copy(m.motion)}</td>
      </tr>
    `).join('')

    const answerHTML = `
      <span class="answer-label">${copy(q.fromChordName)} → ${copy(q.toChordName)}</span>
      <table class="chord-tones-table" style="min-width:280px;margin-top:var(--space-sm)">
        <thead>
          <tr>
            <th>${copy("Deg")}</th>
            <th>${copy(q.fromChordName)}</th>
            <th></th>
            <th>${copy(q.toChordName)}</th>
            <th>${copy("Deg")}</th>
            <th>${copy("Motion")}</th>
          </tr>
        </thead>
        <tbody>${copy(motionRows)}</tbody>
      </table>
    `

    const keyboards = getKeyboardMotion(q.motions).map((keyboard, index) => ({
      ...keyboard, label: index === 0 ? q.fromChordName : q.toChordName,
    }))
    ctx.shell.renderCard(buildExerciseCardHTML({ questionHTML, answerHTML, keyboards, revealed: ctx.state.revealed }))

    ctx.container.querySelector('.exercise-card').addEventListener('click', () => {
      ctx.state.revealed = !ctx.state.revealed
      ctx.update()
    })
  }
