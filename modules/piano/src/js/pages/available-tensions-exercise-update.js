import { copy } from '../../i18n.js';
import { getKeyboardVoicing, buildExerciseCardHTML, buildChordTonesTableHTML, CHORD_TYPES } from './available-tensions-exercise-shared.js';
export function update(ctx) {
    const q = ctx.state.question
    if (!q) return

    const tonesHtml = ctx.state.showTones
      ? `<div style="margin-top:var(--space-sm)">${copy(buildChordTonesTableHTML(q.tones))}</div>`
      : ''

    const questionHTML = `
      <span class="label">${copy("Chord")}</span>
      <span class="note-display">${copy(q.name)}</span>
      <span class="label">${copy("Available tensions?")}</span>
      ${copy(tonesHtml)}
    `

    const tensionRows = q.tensions.map(t => `
      <tr>
        <td><span class="chip chip-accent">${copy(t.degree)}</span></td>
        <td style="color:var(--success);font-weight:700;font-size:var(--text-lg)">${copy(t.note)}</td>
        <td class="text-muted" style="font-size:var(--text-sm)">${copy(t.description)}</td>
      </tr>
    `).join('')

    const answerHTML = q.tensions.length === 0
      ? `
        <span class="answer-label">${copy(CHORD_TYPES[q.chordType].fullName)}</span>
        <span class="answer-main" style="font-size:var(--text-xl)">${copy("No standard tensions")}</span>
      `
      : `
        <span class="answer-label">${copy(CHORD_TYPES[q.chordType].fullName)}</span>
        <table class="chord-tones-table" style="min-width:260px;margin-top:var(--space-sm)">
          <thead><tr><th>${copy("Tension")}</th><th>${copy("Note")}</th><th>${copy("Character")}</th></tr></thead>
          <tbody>${copy(tensionRows)}</tbody>
        </table>
      `

    ctx.shell.renderCard(buildExerciseCardHTML({
      questionHTML, answerHTML, revealed: ctx.state.revealed,
      keyboards: [{ ...getKeyboardVoicing([...q.tones, ...q.tensions.map(tone => ({ ...tone, semitones: tone.semitones + 12 }))], { root: q.root, startOctave: 4 }), label: `${q.name}: chord tones${q.tensions.length ? ' and available tensions' : ' (no standard tensions)'}` }],
    }))

    ctx.container.querySelector('.exercise-card').addEventListener('click', () => {
      ctx.state.revealed = !ctx.state.revealed
      ctx.update()
    })
  }
