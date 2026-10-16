import { getMelodicMinorModeNotes } from "./melodic-minor-exercise-shared.js";
export function content(ctx, q) {
if (ctx.state.mode === 'spell') return mode0(q);
if (ctx.state.mode === 'chord') return mode1(q);
return mode2(q);
}
function mode0(q) {

      
      const noteList = q.notes.join(' — ')
      const questionHTML = `
        <span class="label">Root note</span>
        <span class="note-display">${q.root}</span>
        <span class="label">Mode:</span>
        <span class="question">${q.mode.name}</span>
        <span class="label" style="margin-top:var(--space-xs);font-size:var(--text-sm);color:var(--text-muted)">Spell all 7 notes</span>
      `
      const answerHTML = `
        <span class="answer-label">${q.root} ${q.mode.name}</span>
        <span class="answer-main" style="font-size:var(--text-xl)">${noteList}</span>
        <span class="answer-sub">Formula: ${q.mode.formula}</span>
        <span class="answer-sub" style="font-size:var(--text-sm)">${q.mode.altNames}</span>
      `
    
return { questionHTML, answerHTML };
}

function mode1(q) {

      
      const noteList = q.notes.join(' — ')
      const questionHTML = `
        <span class="label">Root note</span>
        <span class="note-display">${q.root}</span>
        <span class="label">Chord type:</span>
        <span class="question">${q.mode.chordFit}</span>
        <span class="label" style="margin-top:var(--space-xs);font-size:var(--text-sm);color:var(--text-muted)">Which melodic minor mode fits this chord?</span>
      `
      const answerHTML = `
        <span class="answer-label">${q.mode.name}</span>
        <span class="answer-sub" style="margin-top:0">${q.mode.altNames}</span>
        <span class="answer-main" style="font-size:var(--text-xl);margin-top:var(--space-sm)">${noteList}</span>
        <span class="answer-sub">Formula: ${q.mode.formula} &nbsp;·&nbsp; <code>${q.mode.chordSymbol}</code></span>
        <span class="answer-sub" style="font-size:var(--text-sm)">${q.mode.jazzContext}</span>
      `
    
return { questionHTML, answerHTML };
}

function mode2(q) {

      
      const { mode } = q
      const questionHTML = `
        <span class="label">Formula:</span>
        <span class="question" style="font-size:var(--text-xl)">${mode.formula}</span>
        <span class="label" style="margin-top:var(--space-xs)">Steps: <code>${mode.steps}</code></span>
        <span class="label" style="margin-top:var(--space-xs);font-size:var(--text-sm);color:var(--text-muted)">Name this melodic minor mode</span>
      `
      const exampleRoot = 'C'
      const exampleNotes = getMelodicMinorModeNotes(exampleRoot, mode.name).join(' — ')
      const answerHTML = `
        <span class="answer-label">${mode.name}</span>
        <span class="answer-sub" style="margin-top:0">${mode.altNames}</span>
        <span class="answer-main" style="font-size:var(--text-xl);margin-top:var(--space-sm)">${exampleNotes}</span>
        <span class="answer-sub">C example &nbsp;·&nbsp; Best over: <strong>${mode.chordFit}</strong></span>
        <span class="answer-sub" style="font-size:var(--text-sm)">${mode.jazzContext}</span>
      `
    
return { questionHTML, answerHTML };
}
