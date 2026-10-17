import { copy } from '../../i18n.js';
import { buildChordTonesTableHTML, SUSPENDED_CHORD_TYPES } from "./suspended-chords-exercise-shared.js";
export function content(ctx, q) {
if (ctx.state.promptMode === 'spell') return mode0(q);
if (ctx.state.promptMode === 'identify') return mode1(q);
return mode2(q);
}
function mode0(q) {

      const questionHTML = `
        <span class="label">${copy("Spell the suspended chord")}</span>
        <span class="note-display">${copy(q.chordName)}</span>
        <span class="label">${copy("Write all chord tones")}</span>
      `
      const answerHTML = `
        <span class="answer-label">${copy(SUSPENDED_CHORD_TYPES[q.type].fullName)}</span>
        ${copy(buildChordTonesTableHTML(q.tones))}
      `
    
return { questionHTML, answerHTML };
}

function mode1(q) {

      const questionHTML = `
        <span class="label">${copy("Identify the suspended chord type")}</span>
        <span class="question" style="font-size:var(--text-2xl);font-weight:700">${copy(q.shuffledNotes.join(' – '))}</span>
        <span class="label">${copy("Assume root:")} ${copy(q.root)}</span>
      `
      const answerHTML = `
        <span class="answer-label">${copy(q.chordName)}</span>
        <p class="text-muted" style="font-size:var(--text-sm);margin-top:var(--space-xs)">
          ${copy(SUSPENDED_CHORD_TYPES[q.type].fullName)}
        </p>
        ${copy(buildChordTonesTableHTML(q.tones))}
      `
    
return { questionHTML, answerHTML };
}

function mode2(q) {

      const resolutionRows = q.resolutionMoves.map(move => `
        <tr>
          <td class="text-muted">${copy(move.fromDegree)}</td>
          <td style="color:var(--success);font-weight:700;font-size:var(--text-lg)">${copy(move.fromNote)}</td>
          <td class="text-muted" style="padding:0 var(--space-xs)">→</td>
          <td style="color:var(--accent);font-weight:700;font-size:var(--text-lg)">${copy(move.toNote)}</td>
          <td class="text-muted">${copy(move.toDegree)}</td>
          <td class="text-muted" style="font-size:var(--text-sm);padding-left:var(--space-sm)">${copy(move.motion)}</td>
        </tr>
      `).join('')

      const questionHTML = `
        <span class="label">${copy("Resolve sus → dominant")}</span>
        <span class="note-display">${copy(q.chordName)}</span>
        <span class="label">${copy("How does the suspended tone resolve?")}</span>
      `
      const answerHTML = `
        <span class="answer-label">${copy(q.chordName)} → ${copy(q.resolutionTarget)}</span>
        <table class="chord-tones-table" style="min-width:280px;margin-top:var(--space-sm)">
          <thead>
            <tr>
              <th>${copy("From")}</th>
              <th>${copy("Note")}</th>
              <th></th>
              <th>${copy("To")}</th>
              <th>${copy("Degree")}</th>
              <th>${copy("Motion")}</th>
            </tr>
          </thead>
          <tbody>${copy(resolutionRows)}</tbody>
        </table>
      `
    
return { questionHTML, answerHTML };
}
