import { getChordTones, getKeyboardVoicing, buildExerciseCardHTML, buildChordTonesTableHTML } from './tritone-sub-exercise-shared.js';
export function update(ctx) {
    const q = ctx.state.question
    if (!q) return

    const origTable = buildChordTonesTableHTML(
      q.notes.map((note, i) => ({ degree: ['1','3','5','♭7'][i], note }))
    )
    const subTable = buildChordTonesTableHTML(
      q.subNotes.map((note, i) => ({ degree: ['1','3','5','♭7'][i], note }))
    )

    const questionHTML = `
      <span class="label">Find the tritone substitute of</span>
      <span class="note-display">${q.chordName}</span>
    `

    let contextHTML = ''
    if (ctx.state.withContext && q.context) {
      const orig = q.context.original.map(c => c.chordName).join(' – ')
      const sub  = q.context.withSub.map(c => c.chordName).join(' – ')
      contextHTML = `
        <div style="margin-top:var(--space-md);text-align:left;width:100%">
          <div class="text-muted" style="font-size:var(--text-sm);margin-bottom:4px">Original ii-V-I in ${q.context.keyRoot}:</div>
          <div style="font-weight:600">${orig}</div>
          <div class="text-muted" style="font-size:var(--text-sm);margin:var(--space-sm) 0 4px">With tritone sub (chromatic bass ↓):</div>
          <div style="font-weight:600;color:var(--accent)">${sub}</div>
        </div>
      `
    }

    const answerHTML = `
      <span class="answer-label">Tritone sub of ${q.chordName}</span>
      <span class="answer-main" style="font-size:var(--text-xl)">${q.subChordName}</span>
      <div style="display:flex;gap:var(--space-lg);justify-content:center;flex-wrap:wrap;margin-top:var(--space-sm)">
        <div>
          <div class="text-muted" style="font-size:var(--text-sm);margin-bottom:4px">${q.chordName}</div>
          ${origTable}
        </div>
        <div>
          <div class="text-muted" style="font-size:var(--text-sm);margin-bottom:4px">${q.subChordName}</div>
          ${subTable}
        </div>
      </div>
      ${contextHTML}
    `

    const keyboards = [
      {
        ...getKeyboardVoicing(getChordTones(q.root, '7'), { root: q.root }),
        label: `Original — ${q.chordName}`,
      },
      {
        ...getKeyboardVoicing(getChordTones(q.subRoot, '7'), { root: q.subRoot }),
        label: `Substitute — ${q.subChordName}`,
      },
    ]

    ctx.shell.renderCard(buildExerciseCardHTML({ questionHTML, answerHTML, keyboards, revealed: ctx.state.revealed }))

    ctx.container.querySelector('.exercise-card').addEventListener('click', () => {
      ctx.state.revealed = !ctx.state.revealed
      ctx.update()
    })
  }
