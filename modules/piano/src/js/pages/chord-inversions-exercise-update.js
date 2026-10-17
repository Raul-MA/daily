import { copy } from '../../i18n.js';
import { getKeyboardVoicing, buildExerciseCardHTML, buildChordTonesTableHTML, getInvertedChordTones, getScaleNotes } from './chord-inversions-exercise-shared.js';
export function update(ctx) {
    const q = ctx.state.question
    if (!q) return

    const questionHTML = `
      <div style="display:flex;gap:var(--space-xl);justify-content:center;margin-bottom:var(--space-sm)">
        <div>
          <div class="label">${copy("Key")}</div>
          <div class="note-display" style="font-size:var(--text-3xl)">${copy(q.key)}</div>
          <div class="label" style="margin-top:4px;font-size:var(--text-xs)">${copy(q.scaleName)}</div>
        </div>
        <div>
          <div class="label">${copy("Chord")}</div>
          <div class="note-display" style="font-size:var(--text-3xl)">${copy(q.roman)}</div>
          <div class="label" style="margin-top:4px;font-size:var(--text-xs)">${copy(q.chordMode === 'triad' ? 'Triad' : '7th chord')}</div>
        </div>
      </div>
      <div class="label">${copy("Inversion")}</div>
      <span class="chip chip-accent" style="font-size:var(--text-base);padding:6px 18px">${copy(q.inversionName)}</span>
    `

    
    const originalTones = getInvertedChordTones(q)

    let scaleHTML = ''
    if (ctx.state.showScale) {
      const scaleNotes = getScaleNotes(q.key, q.scaleName)
      scaleHTML = `
        <div style="margin-top:var(--space-md)">
          <div class="label" style="margin-bottom:var(--space-xs)">${copy(q.key)} ${copy(q.scaleName)}</div>
          <div style="display:flex;gap:var(--space-xs);flex-wrap:wrap;justify-content:center">
            ${copy(scaleNotes.map(n => `<span class="chip">${copy(n)}</span>`).join(''))}
          </div>
        </div>
      `
    }

    const answerHTML = `
      <span class="answer-label" style="font-size:var(--text-2xl)">${copy(q.chordName)} ${copy("—")} ${copy(q.inversionName)} ${copy("inversion")}</span>
      ${copy(buildChordTonesTableHTML(originalTones, q.bassNote))}
      ${copy(scaleHTML)}
    `

    const keyboards = [{
      ...getKeyboardVoicing(originalTones),
      label: `${q.chordName} — ${q.inversionName}, bass ${q.bassNote}`,
    }]

    ctx.shell.renderCard(buildExerciseCardHTML({ questionHTML, answerHTML, keyboards, revealed: ctx.state.revealed }))

    ctx.container.querySelector('.exercise-card').addEventListener('click', () => {
      ctx.state.revealed = !ctx.state.revealed
      ctx.update()
    })
  }
