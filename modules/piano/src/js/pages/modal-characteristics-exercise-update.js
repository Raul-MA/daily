import { getKeyboardVoicing, buildExerciseCardHTML } from './modal-characteristics-exercise-shared.js';
export function update(ctx) {
    const q = ctx.state.question
    if (!q) return
    const m = q.mode

    let questionHTML, answerHTML

    if (ctx.drillMode === 'forward') {
      questionHTML = `
        <span class="label">Identify the characteristics of</span>
        <span class="note-display">${m.name}</span>
        <span class="label" style="font-size:var(--text-sm)">(degree ${m.degree})</span>
      `
      answerHTML = `
        <span class="answer-label">${m.name} — ${m.feel}</span>
        <div style="text-align:left;width:100%;max-width:360px;margin-top:var(--space-sm)">
          <p style="margin:var(--space-xs) 0"><strong>Formula:</strong> <code>${m.formula}</code></p>
          <p style="margin:var(--space-xs) 0"><strong>Characteristic tone:</strong> ${m.characteristic}</p>
          <p style="margin:var(--space-xs) 0"><strong>Parent key:</strong> ${m.parentKeyDesc}</p>
          <p style="margin:var(--space-xs) 0"><strong>Jazz context:</strong> ${m.jazzContext}</p>
        </div>
      `
    } else {
      
      questionHTML = `
        <span class="label">Which mode fits this description?</span>
        <span class="question" style="font-size:var(--text-base);text-align:left;max-width:340px">${m.jazzContext}</span>
        <span class="label" style="margin-top:var(--space-sm)">Feel: <em>${m.feel}</em></span>
      `
      answerHTML = `
        <span class="answer-label">${m.degree} — ${m.name}</span>
        <div style="text-align:left;width:100%;max-width:360px;margin-top:var(--space-sm)">
          <p style="margin:var(--space-xs) 0"><strong>Formula:</strong> <code>${m.formula}</code></p>
          <p style="margin:var(--space-xs) 0"><strong>Characteristic tone:</strong> ${m.characteristic}</p>
          <p style="margin:var(--space-xs) 0"><strong>Parent key:</strong> ${m.parentKeyDesc}</p>
        </div>
      `
    }

    ctx.shell.renderCard(buildExerciseCardHTML({
      questionHTML, answerHTML, revealed: ctx.state.revealed,
      keyboards: [{ ...getKeyboardVoicing(q.notes.map((note, index) => ({ note, degree: m.formula.split(/\s+/)[index] }))), label: `${q.root} ${m.name} example` }],
    }))

    ctx.container.querySelector('.exercise-card').addEventListener('click', () => {
      ctx.state.revealed = !ctx.state.revealed
      ctx.update()
    })
  }
