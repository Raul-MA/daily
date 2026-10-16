import { buildExerciseCardHTML, getKeyboardMotion } from './guide-tone-exercise-shared.js';
export function update(ctx) {
    const q = ctx.state.question
    if (!q) return

    const questionHTML = `
      <span class="label">How do the guide tones resolve?</span>
      <span class="note-display">${q.fromChordName} → ${q.toChordName}</span>
      <span class="label" style="margin-top:var(--space-sm)">${q.label}</span>
    `

    const motionRows = q.motions.map(m => `
      <tr>
        <td class="text-muted">${m.fromDegree}</td>
        <td style="color:var(--success);font-weight:700;font-size:var(--text-lg)">${m.fromNote}</td>
        <td class="text-muted" style="padding:0 var(--space-xs)">→</td>
        <td style="color:var(--accent);font-weight:700;font-size:var(--text-lg)">${m.toNote}</td>
        <td class="text-muted">${m.toDegree}</td>
        <td class="text-muted" style="font-size:var(--text-sm);padding-left:var(--space-sm)">${m.motion}</td>
      </tr>
    `).join('')

    const answerHTML = `
      <span class="answer-label">${q.fromChordName} → ${q.toChordName}</span>
      <table class="chord-tones-table" style="min-width:280px;margin-top:var(--space-sm)">
        <thead>
          <tr>
            <th>Deg</th>
            <th>${q.fromChordName}</th>
            <th></th>
            <th>${q.toChordName}</th>
            <th>Deg</th>
            <th>Motion</th>
          </tr>
        </thead>
        <tbody>${motionRows}</tbody>
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
