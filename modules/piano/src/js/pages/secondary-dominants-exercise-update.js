import { getKeyboardVoicing, buildExerciseCardHTML, buildChordTonesTableHTML, CHORD_TYPES, getChordTones } from './secondary-dominants-exercise-shared.js';
export function update(ctx) {
    const q = ctx.state.question
    if (!q) return

    let questionHTML, answerHTML

    if (!ctx.state.inverse) {
      
      questionHTML = `
        <span class="label">Key</span>
        <span class="note-display">${q.keyRoot} major</span>
        <span class="label">Find the secondary dominant of</span>
        <span class="question">${q.targetRoman} — ${q.targetChordName}</span>
      `
      const tonesTable = buildChordTonesTableHTML(
        q.secDomNotes.map((note, i) => ({ degree: ['1','3','5','♭7'][i], note }))
      )
      answerHTML = `
        <span class="answer-label">${q.symbol}</span>
        <span class="answer-main" style="font-size:var(--text-xl)">${q.secDomChordName}</span>
        ${tonesTable}
        <span class="answer-sub" style="margin-top:var(--space-sm)">Resolves to: ${q.targetChordName}</span>
      `
    } else {
      
      questionHTML = `
        <span class="label">Key</span>
        <span class="note-display">${q.keyRoot} major</span>
        <span class="label">This chord is a secondary dominant:</span>
        <span class="question">${q.secDomChordName}</span>
        <span class="card-hint" style="margin-top:var(--space-sm)">Which degree does it tonicise?</span>
      `
      const targetDegrees = CHORD_TYPES[q.targetChordType]?.degrees ?? q.targetNotes.map((_, i) => String(i + 1))
      const targetTable = buildChordTonesTableHTML(
        q.targetNotes.map((note, i) => ({
          degree: targetDegrees[i] ?? String(i + 1),
          note,
        }))
      )
      answerHTML = `
        <span class="answer-label">${q.secDomChordName} = ${q.symbol}</span>
        <span class="answer-main" style="font-size:var(--text-xl)">Tonicises ${q.targetRoman}</span>
        <span class="answer-sub">Target: ${q.targetChordName}</span>
        ${targetTable}
      `
    }

    const keyboards = [
      {
        ...getKeyboardVoicing(getChordTones(q.secDomRoot, '7'), { root: q.secDomRoot }),
        label: `${q.symbol} — ${q.secDomChordName}`,
      },
      {
        ...getKeyboardVoicing(getChordTones(q.targetNote, q.targetChordType), { root: q.targetNote }),
        label: `Target — ${q.targetChordName}`,
      },
    ]

    ctx.shell.renderCard(buildExerciseCardHTML({ questionHTML, answerHTML, keyboards, revealed: ctx.state.revealed }))

    ctx.container.querySelector('.exercise-card').addEventListener('click', () => {
      ctx.state.revealed = !ctx.state.revealed
      ctx.update()
    })
  }
