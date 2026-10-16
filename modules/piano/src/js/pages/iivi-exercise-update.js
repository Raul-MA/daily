import { getChordTones, getKeyboardVoicing, buildExerciseCardHTML } from './iivi-exercise-shared.js';
export function update(ctx) {
    const q = ctx.state.question
    if (!q) return

    const chordsLine = q.chords.map(c => c.chordName).join(' – ')
    const romansLine = q.chords.map(c => c.roman).join(' – ')
    const modeLabel  = q.mode === 'major' ? 'major' : 'minor (harmonic)'

    let questionHTML, answerHTML

    if (!ctx.state.inverse) {
      
      questionHTML = `
        <span class="label">Build the ii-V-I in</span>
        <span class="note-display">${q.root} ${q.mode}</span>
      `
      const chordsHTML = q.chords.map(c => `
        <div class="progression-chord">
          <div class="roman">${c.roman}</div>
          <div class="chord-name">${c.chordName}</div>
          <div style="font-size:var(--text-xs);color:var(--text-muted);margin-top:4px">${c.notes.join(' ')}${c.b9 ? ` · ♭9: ${c.b9}` : ''}</div>
        </div>
      `).join('')
      answerHTML = `
        <span class="answer-label">${q.root} ${modeLabel}</span>
        <div class="progression-display" style="justify-content:center;gap:var(--space-md)">${chordsHTML}</div>
      `
    } else {
      
      questionHTML = `
        <span class="label">Identify the key and Roman numerals</span>
        <span class="question" style="font-size:var(--text-lg)">${chordsLine}</span>
      `
      answerHTML = `
        <span class="answer-label">ii-V-I in ${q.root} ${modeLabel}</span>
        <span class="answer-main" style="font-size:var(--text-xl)">${romansLine}</span>
        <span class="answer-sub">${chordsLine}</span>
      `
    }

    const keyboards = q.chords.map(chord => ({
      ...getKeyboardVoicing([
        ...getChordTones(chord.root, chord.chordType),
        ...(chord.b9 ? [{ note: chord.b9, degree: '♭9', semitones: 13 }] : []),
      ], { root: chord.root }),
      label: `${chord.roman} — ${chord.chordName}`,
    }))

    ctx.shell.renderCard(buildExerciseCardHTML({ questionHTML, answerHTML, keyboards, revealed: ctx.state.revealed }))

    ctx.container.querySelector('.exercise-card').addEventListener('click', () => {
      ctx.state.revealed = !ctx.state.revealed
      ctx.update()
    })
  }
