import { getKeyboardVoicing, buildExerciseCardHTML, buildChordTonesTableHTML, EXTENDED_CHORD_TYPES, CHORD_TYPES } from './extended-chords-exercise-shared.js';
export function update(ctx) {
    const q = ctx.state.question
    if (!q) return

    const questionHTML = `
      <span class="label">Chord symbol</span>
      <span class="note-display">${q.name}</span>
      <span class="label">Spell all chord tones</span>
    `

    const extChord = EXTENDED_CHORD_TYPES[q.extType]
    const baseChord = CHORD_TYPES[extChord.baseChordType]

    
    const baseDegrees = new Set(baseChord.degrees)
    const extensions = q.tones.filter(t => !baseDegrees.has(t.degree))

    const extensionsHtml = extensions.map(t =>
      `<span class="chip chip-accent">${t.degree} = ${t.note}</span>`
    ).join(' ')

    const omitHtml = extChord.omitNote
      ? `<p class="text-muted" style="font-size:var(--text-sm);margin-top:var(--space-sm)">
           ⚠ ${extChord.omitNote}
         </p>`
      : ''

    const answerHTML = `
      <span class="answer-label">${extChord.fullName}</span>
      <p class="text-muted" style="font-size:var(--text-sm);margin-bottom:var(--space-xs)">
        Base: ${q.root}${baseChord.symbol} (${baseChord.fullName})
      </p>
      ${buildChordTonesTableHTML(q.tones)}
      <div style="margin-top:var(--space-sm)">
        <span class="label" style="font-size:var(--text-sm)">Extensions added</span>
        <div style="margin-top:var(--space-xs)">${extensionsHtml}</div>
      </div>
      ${omitHtml}
    `

    ctx.shell.renderCard(buildExerciseCardHTML({
      questionHTML, answerHTML, revealed: ctx.state.revealed,
      keyboards: [{ ...getKeyboardVoicing(q.tones, { root: q.root, startOctave: 4 }), label: `${q.name} chord tones and extensions` }],
    }))

    ctx.container.querySelector('.exercise-card').addEventListener('click', () => {
      ctx.state.revealed = !ctx.state.revealed
      ctx.update()
    })
  }
