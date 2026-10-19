import { copy } from '../../i18n.js';
import { getMelodicMinorModeNotes } from "./melodic-minor-exercise-shared.js";
export function content(ctx, q) {
if (ctx.state.mode === 'spell') return mode0(q);
if (ctx.state.mode === 'chord') return mode1(q);
return mode2(q);
}
function mode0(q) {

      
      const noteList = q.notes.join(' — ')
      const questionHTML = `
        <span class="label">${copy("Root note")}</span>
        <span class="note-display">${copy(q.root)}</span>
        <span class="label">${copy("Mode:")}</span>
        <span class="question">${copy(q.mode.name)}</span>
        <span class="label" style="margin-top:var(--space-xs);font-size:var(--text-sm);color:var(--text-muted)">${copy("Spell all 7 notes")}</span>
      `
      const answerHTML = `
        <span class="answer-label">${copy(q.root)} ${copy(q.mode.name)}</span>
        <span class="answer-main" style="font-size:var(--text-xl)">${copy(noteList)}</span>
        <span class="answer-sub">${copy("Formula:")} ${copy(q.mode.formula)}</span>
        <span class="answer-sub" style="font-size:var(--text-sm)">${copy(q.mode.altNames)}</span>
      `
    
return { questionHTML, answerHTML };
}

function mode1(q) {

      
      const noteList = q.notes.join(' — ')
      const questionHTML = `
        <span class="label">${copy("Root note")}</span>
        <span class="note-display">${copy(q.root)}</span>
        <span class="label">${copy("Chord type:")}</span>
        <span class="question">${copy(q.mode.chordFit)}</span>
        <span class="label" style="margin-top:var(--space-xs);font-size:var(--text-sm);color:var(--text-muted)">${copy("Which melodic minor mode fits this chord?")}</span>
      `
      const answerHTML = `
        <span class="answer-label">${copy(q.mode.name)}</span>
        <span class="answer-sub" style="margin-top:0">${copy(q.mode.altNames)}</span>
        <span class="answer-main" style="font-size:var(--text-xl);margin-top:var(--space-sm)">${copy(noteList)}</span>
        <span class="answer-sub">${copy("Formula:")} ${copy(q.mode.formula)} ${copy("&nbsp;·&nbsp;")} <code>${copy(q.mode.chordSymbol)}</code></span>
        <span class="answer-sub" style="font-size:var(--text-sm)">${copy(q.mode.jazzContext)}</span>
      `
    
return { questionHTML, answerHTML };
}

function mode2(q) {

      
      const { mode } = q
      const questionHTML = `
        <span class="label">${copy("Formula:")}</span>
        <span class="question" style="font-size:var(--text-xl)">${copy(mode.formula)}</span>
        <span class="label" style="margin-top:var(--space-xs)">${copy("Steps:")} <code>${copy(mode.steps)}</code></span>
        <span class="label" style="margin-top:var(--space-xs);font-size:var(--text-sm);color:var(--text-muted)">${copy("Name this melodic minor mode")}</span>
      `
      const exampleRoot = 'C'
      const exampleNotes = getMelodicMinorModeNotes(exampleRoot, mode.name).join(' — ')
      const answerHTML = `
        <span class="answer-label">${copy(mode.name)}</span>
        <span class="answer-sub" style="margin-top:0">${copy(mode.altNames)}</span>
        <span class="answer-main" style="font-size:var(--text-xl);margin-top:var(--space-sm)">${copy(exampleNotes)}</span>
        <span class="answer-sub">${copy("C example &nbsp;·&nbsp; Best over:")} <strong>${copy(mode.chordFit)}</strong></span>
        <span class="answer-sub" style="font-size:var(--text-sm)">${copy(mode.jazzContext)}</span>
      `
    
return { questionHTML, answerHTML };
}
