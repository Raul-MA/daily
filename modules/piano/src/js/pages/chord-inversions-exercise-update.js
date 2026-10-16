import { getKeyboardVoicing, buildExerciseCardHTML, buildChordTonesTableHTML, getInvertedChordTones, getScaleNotes } from './chord-inversions-exercise-shared.js';
export function update(ctx) {
    const q = ctx.state.question
    if (!q) return

    const questionHTML = `
      <div style="display:flex;gap:var(--space-xl);justify-content:center;margin-bottom:var(--space-sm)">
        <div>
          <div class="label">Key</div>
          <div class="note-display" style="font-size:var(--text-3xl)">${q.key}</div>
          <div class="label" style="margin-top:4px;font-size:var(--text-xs)">${q.scaleName}</div>
        </div>
        <div>
          <div class="label">Chord</div>
          <div class="note-display" style="font-size:var(--text-3xl)">${q.roman}</div>
          <div class="label" style="margin-top:4px;font-size:var(--text-xs)">${q.chordMode === 'triad' ? 'Triad' : '7th chord'}</div>
        </div>
      </div>
      <div class="label">Inversion</div>
      <span class="chip chip-accent" style="font-size:var(--text-base);padding:6px 18px">${q.inversionName}</span>
    `

    
    const originalTones = getInvertedChordTones(q)

    let scaleHTML = ''
    if (ctx.state.showScale) {
      const scaleNotes = getScaleNotes(q.key, q.scaleName)
      scaleHTML = `
        <div style="margin-top:var(--space-md)">
          <div class="label" style="margin-bottom:var(--space-xs)">${q.key} ${q.scaleName}</div>
          <div style="display:flex;gap:var(--space-xs);flex-wrap:wrap;justify-content:center">
            ${scaleNotes.map(n => `<span class="chip">${n}</span>`).join('')}
          </div>
        </div>
      `
    }

    const answerHTML = `
      <span class="answer-label" style="font-size:var(--text-2xl)">${q.chordName} — ${q.inversionName} inversion</span>
      ${buildChordTonesTableHTML(originalTones, q.bassNote)}
      ${scaleHTML}
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
