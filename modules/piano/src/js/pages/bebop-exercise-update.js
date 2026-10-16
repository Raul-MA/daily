import { content } from './bebop-exercise-content.js';
import { buildExerciseCardHTML, getKeyboardVoicing } from './bebop-exercise-shared.js';
export function update(ctx) {
    const q = ctx.state.question
    if (!q) return

    const rows = q.notes.map((note, i) => {
      const isPassing = i === q.passingToneIndex
      const noteStyle = isPassing
        ? 'color:var(--warning);font-weight:700;font-size:var(--text-lg)'
        : 'color:var(--success);font-weight:700;font-size:var(--text-lg)'
      const passingMark = isPassing ? ' ★' : ''
      return `
        <tr${isPassing ? ' style="background:rgba(240,165,0,0.08)"' : ''}>
          <td class="text-muted">${i + 1}</td>
          <td style="${noteStyle}">${note}${passingMark}</td>
          <td class="text-muted" style="font-size:var(--text-sm)">${isPassing ? 'passing tone' : ''}</td>
        </tr>
      `
    }).join('')


    const { questionHTML, answerHTML } = content(ctx, q, rows);

    ctx.shell.renderCard(buildExerciseCardHTML({
      questionHTML, answerHTML, revealed: ctx.state.revealed,
      keyboards: [{ ...getKeyboardVoicing(q.notes.map((note, index) => ({ note, degree: index === q.passingToneIndex ? 'Passing tone' : undefined }))), label: `${q.root} ${q.scaleName}` }],
    }))

    ctx.container.querySelector('.exercise-card').addEventListener('click', () => {
      ctx.state.revealed = !ctx.state.revealed
      ctx.update()
    })

    
    ctx.container.querySelectorAll('.bebop-mode-btn').forEach(btn => {
      btn.classList.toggle('btn-primary', btn.dataset.mode === ctx.state.mode)
      btn.classList.toggle('btn-ghost', btn.dataset.mode !== ctx.state.mode)
    })
  }
