import { getKeyboardVoicing, buildExerciseCardHTML, buildChordTonesTableHTML, CHORD_TYPES } from './modal-interchange-exercise-shared.js';
export function update(ctx) {
    const q = ctx.state.question
    if (!q) return

    const degrees = CHORD_TYPES[q.chordType]?.degrees ?? q.notes.map((_, i) => String(i + 1))
    const tonesTable = buildChordTonesTableHTML(
      q.notes.map((note, i) => ({ degree: degrees[i] ?? String(i + 1), note }))
    )

    let questionHTML, answerHTML

    if (!ctx.state.inverse) {
      
      questionHTML = `
        <span class="label">Key</span>
        <span class="note-display">${q.keyRoot} major</span>
        <span class="label">Find the borrowed chord</span>
        <span class="question">${q.romanBorrowed}</span>
      `
      answerHTML = `
        <span class="answer-label">${q.romanBorrowed} in ${q.keyRoot} major</span>
        <span class="answer-main" style="font-size:var(--text-xl)">${q.chordName}</span>
        <span class="answer-sub">Source: parallel ${q.source}</span>
        <span class="answer-sub text-muted">${q.description}</span>
        ${tonesTable}
      `
    } else {
      
      questionHTML = `
        <span class="label">Key</span>
        <span class="note-display">${q.keyRoot} major</span>
        <span class="label">Identify this borrowed chord:</span>
        <span class="question">${q.chordName}</span>
      `
      answerHTML = `
        <span class="answer-label">${q.chordName} in ${q.keyRoot} major</span>
        <span class="answer-main" style="font-size:var(--text-xl)">${q.romanBorrowed}</span>
        <span class="answer-sub">Source: parallel ${q.source}</span>
        <span class="answer-sub text-muted">${q.description}</span>
        ${tonesTable}
      `
    }

    ctx.shell.renderCard(buildExerciseCardHTML({
      questionHTML, answerHTML, revealed: ctx.state.revealed,
      keyboards: [{ ...getKeyboardVoicing(q.notes.map((note, index) => ({ note, degree: CHORD_TYPES[q.chordType]?.degrees[index] }))), label: `${q.chordName} from parallel ${q.source}` }],
    }))

    ctx.container.querySelector('.exercise-card').addEventListener('click', () => {
      ctx.state.revealed = !ctx.state.revealed
      ctx.update()
    })
  }
