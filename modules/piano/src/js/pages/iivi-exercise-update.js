import { copy } from '../../i18n.js';
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
        <span class="label">${copy("Build the ii-V-I in")}</span>
        <span class="note-display">${copy(q.root)} ${copy(q.mode)}</span>
      `
      const chordsHTML = q.chords.map(c => `
        <div class="progression-chord">
          <div class="roman">${copy(c.roman)}</div>
          <div class="chord-name">${copy(c.chordName)}</div>
          <div style="font-size:var(--text-xs);color:var(--text-muted);margin-top:4px">${copy(c.notes.join(' '))}${copy(c.b9 ? ` · ♭9: ${c.b9}` : '')}</div>
        </div>
      `).join('')
      answerHTML = `
        <span class="answer-label">${copy(q.root)} ${copy(modeLabel)}</span>
        <div class="progression-display" style="justify-content:center;gap:var(--space-md)">${copy(chordsHTML)}</div>
      `
    } else {
      
      questionHTML = `
        <span class="label">${copy("Identify the key and Roman numerals")}</span>
        <span class="question" style="font-size:var(--text-lg)">${copy(chordsLine)}</span>
      `
      answerHTML = `
        <span class="answer-label">${copy("ii-V-I in")} ${copy(q.root)} ${copy(modeLabel)}</span>
        <span class="answer-main" style="font-size:var(--text-xl)">${copy(romansLine)}</span>
        <span class="answer-sub">${copy(chordsLine)}</span>
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
