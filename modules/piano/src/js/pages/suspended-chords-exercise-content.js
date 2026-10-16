import { buildChordTonesTableHTML, SUSPENDED_CHORD_TYPES } from "./suspended-chords-exercise-shared.js";
export function content(ctx, q) {
if (ctx.state.promptMode === 'spell') return mode0(q);
if (ctx.state.promptMode === 'identify') return mode1(q);
return mode2(q);
}
function mode0(q) {

      const questionHTML = `
        <span class="label">Spell the suspended chord</span>
        <span class="note-display">${q.chordName}</span>
        <span class="label">Write all chord tones</span>
      `
      const answerHTML = `
        <span class="answer-label">${SUSPENDED_CHORD_TYPES[q.type].fullName}</span>
        ${buildChordTonesTableHTML(q.tones)}
      `
    
return { questionHTML, answerHTML };
}

function mode1(q) {

      const questionHTML = `
        <span class="label">Identify the suspended chord type</span>
        <span class="question" style="font-size:var(--text-2xl);font-weight:700">${q.shuffledNotes.join(' – ')}</span>
        <span class="label">Assume root: ${q.root}</span>
      `
      const answerHTML = `
        <span class="answer-label">${q.chordName}</span>
        <p class="text-muted" style="font-size:var(--text-sm);margin-top:var(--space-xs)">
          ${SUSPENDED_CHORD_TYPES[q.type].fullName}
        </p>
        ${buildChordTonesTableHTML(q.tones)}
      `
    
return { questionHTML, answerHTML };
}

function mode2(q) {

      const resolutionRows = q.resolutionMoves.map(move => `
        <tr>
          <td class="text-muted">${move.fromDegree}</td>
          <td style="color:var(--success);font-weight:700;font-size:var(--text-lg)">${move.fromNote}</td>
          <td class="text-muted" style="padding:0 var(--space-xs)">→</td>
          <td style="color:var(--accent);font-weight:700;font-size:var(--text-lg)">${move.toNote}</td>
          <td class="text-muted">${move.toDegree}</td>
          <td class="text-muted" style="font-size:var(--text-sm);padding-left:var(--space-sm)">${move.motion}</td>
        </tr>
      `).join('')

      const questionHTML = `
        <span class="label">Resolve sus → dominant</span>
        <span class="note-display">${q.chordName}</span>
        <span class="label">How does the suspended tone resolve?</span>
      `
      const answerHTML = `
        <span class="answer-label">${q.chordName} → ${q.resolutionTarget}</span>
        <table class="chord-tones-table" style="min-width:280px;margin-top:var(--space-sm)">
          <thead>
            <tr>
              <th>From</th>
              <th>Note</th>
              <th></th>
              <th>To</th>
              <th>Degree</th>
              <th>Motion</th>
            </tr>
          </thead>
          <tbody>${resolutionRows}</tbody>
        </table>
      `
    
return { questionHTML, answerHTML };
}
