import { getKeyboardVoicing, buildExerciseCardHTML } from './shell-chords-exercise-shared.js';
export function update(ctx) {
    const q = ctx.state.question
    if (!q) return

    const shellNotes = q.shellTones.map(t => t.note).join(' – ')
    const shellDegrees = q.shellTones.map(t => t.degree).join(' – ')
    let questionHTML = ''
    let answerHTML = ''

    if (ctx.state.promptMode === 'build') {
      questionHTML = `
        <span class="label">Build the shell voicing</span>
        <span class="note-display">${q.chordName}</span>
        <span class="label">Key</span>
        <span class="question">${q.key}</span>
        <span class="label">Position</span>
        <span class="chip chip-accent">${q.position}</span>
      `

      answerHTML = `
        <span class="answer-label">${q.chordLabel} shell (${q.position})</span>
        <span class="answer-main" style="font-size:var(--text-2xl)">${shellNotes}</span>
        <div style="margin-top:var(--space-xs)">
          <span class="chip">${shellDegrees}</span>
        </div>
      `
    } else {
      questionHTML = `
        <span class="label">Identify the shell position</span>
        <span class="note-display">${q.chordName}</span>
        <span class="label">Shell notes</span>
        <span class="question" style="font-size:var(--text-xl)">${shellNotes}</span>
      `

      answerHTML = `
        <span class="answer-label">${q.chordLabel}</span>
        <span class="answer-main">${q.position}</span>
        <span class="answer-sub">${shellDegrees}</span>
      `
    }

    const keyboards = [{
      ...getKeyboardVoicing(q.shellTones.map(({ note, degree }) => ({ note, degree }))),
      label: `${q.chordName} — ${q.position} shell`,
    }]

    ctx.shell.renderCard(buildExerciseCardHTML({ questionHTML, answerHTML, keyboards, revealed: ctx.state.revealed }))

    ctx.container.querySelector('.exercise-card').addEventListener('click', () => {
      ctx.state.revealed = !ctx.state.revealed
      ctx.update()
    })
  }
