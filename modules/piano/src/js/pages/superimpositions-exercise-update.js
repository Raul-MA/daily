import { getKeyboardVoicing, buildExerciseCardHTML, buildChordTonesTableHTML } from './superimpositions-exercise-shared.js';
export function update(ctx) {
    const q = ctx.state.question
    if (!q) return

    const tonesTable = buildChordTonesTableHTML(
      q.notes.map((note, i) => ({ degree: q.ust.tensions[i], note })),
    )

    let questionHTML, answerHTML

    if (!q.inverse) {
      
      questionHTML = `
        <span class="label">Identify the colour of this upper structure</span>
        <span class="note-display" style="font-size:var(--text-xl)">${q.slashChord}</span>
        <span class="label" style="margin-top:var(--space-sm)">Bass note: ${q.bassRoot}</span>
      `
      answerHTML = `
        <span class="answer-label">${q.slashChord}</span>
        <span class="answer-main" style="font-size:var(--text-xl)">${q.bassRoot} ${q.ust.colorLabel}</span>
        <span class="answer-sub">Tensions: ${q.ust.tensions.join(', ')}</span>
        <span class="answer-sub text-muted">Context: ${q.bassRoot}${q.ust.chordContext}</span>
        <span class="answer-sub text-muted">${q.ust.description}</span>
        ${tonesTable}
        <span class="answer-sub" style="margin-top:var(--space-sm)">
          <a href="#${q.ust.scaleRef.path}">${q.ust.scaleRef.name} mode →</a>
        </span>
      `
    } else {
      
      questionHTML = `
        <span class="label">Find an upper-structure triad for this sound</span>
        <span class="note-display" style="font-size:var(--text-xl)">${q.bassRoot} ${q.ust.colorLabel}</span>
        <span class="label" style="margin-top:var(--space-sm)">Chord context: ${q.bassRoot}${q.ust.chordContext}</span>
      `
      answerHTML = `
        <span class="answer-label">${q.bassRoot} ${q.ust.colorLabel}</span>
        <span class="answer-main" style="font-size:var(--text-xl)">${q.slashChord}</span>
        <span class="answer-sub">Tensions supplied: ${q.ust.tensions.join(', ')}</span>
        <span class="answer-sub text-muted">${q.ust.description}</span>
        ${tonesTable}
        <span class="answer-sub" style="margin-top:var(--space-sm)">
          <a href="#${q.ust.scaleRef.path}">${q.ust.scaleRef.name} mode →</a>
        </span>
      `
    }

    const keyboards = [{
      ...getKeyboardVoicing([
        { note: q.bassRoot, degree: '1', role: 'bass' },
        ...q.notes.map((note, index) => ({ note, degree: q.ust.tensions[index], role: 'upper' })),
      ]),
      label: `${q.slashChord} — example voicing`,
    }]

    ctx.shell.renderCard(buildExerciseCardHTML({ questionHTML, answerHTML, keyboards, revealed: ctx.state.revealed }))

    ctx.container.querySelector('.exercise-card').addEventListener('click', () => {
      ctx.state.revealed = !ctx.state.revealed
      ctx.update()
    })
  }
