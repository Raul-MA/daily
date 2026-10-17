import { copy } from '../../i18n.js';
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
        <span class="label">${copy("Build the shell voicing")}</span>
        <span class="note-display">${copy(q.chordName)}</span>
        <span class="label">${copy("Key")}</span>
        <span class="question">${copy(q.key)}</span>
        <span class="label">${copy("Position")}</span>
        <span class="chip chip-accent">${copy(q.position)}</span>
      `

      answerHTML = `
        <span class="answer-label">${copy(q.chordLabel)} ${copy("shell (")}${copy(q.position)})</span>
        <span class="answer-main" style="font-size:var(--text-2xl)">${copy(shellNotes)}</span>
        <div style="margin-top:var(--space-xs)">
          <span class="chip">${copy(shellDegrees)}</span>
        </div>
      `
    } else {
      questionHTML = `
        <span class="label">${copy("Identify the shell position")}</span>
        <span class="note-display">${copy(q.chordName)}</span>
        <span class="label">${copy("Shell notes")}</span>
        <span class="question" style="font-size:var(--text-xl)">${copy(shellNotes)}</span>
      `

      answerHTML = `
        <span class="answer-label">${copy(q.chordLabel)}</span>
        <span class="answer-main">${copy(q.position)}</span>
        <span class="answer-sub">${copy(shellDegrees)}</span>
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
