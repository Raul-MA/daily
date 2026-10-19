import { copy } from '../../i18n.js';
import { MELODIC_MINOR_MODES, getMelodicMinorModeNotes } from '../music/melodic-minor.js'

export default function render(container) {
  
  const tableRows = buildTableRows();

  
  const cards = buildCards();

  container.innerHTML = copy(`
    <div class="page-header">
      <h1>${copy("Melodic Minor Modes — Theory")}</h1>
      <div class="page-nav-links">
        <a href="#/melodic-minor/exercises">${copy("Exercises →")}</a>
        <a href="#/modes/theory">${copy("Major Modes →")}</a>
      </div>
    </div>

    <div class="theory-content">
      <p class="text-muted mb-lg">${copy("Jazz uses all 7 modes of the melodic minor scale as distinct chord-scales. Unlike classical usage (ascending only), jazz treats melodic minor as a fixed scale — giving rise to some of its most characteristic sounds: the Lydian Dominant, the Altered Scale, and more.")}</p>

      <div class="theory-item">
        <div class="theory-item-title">${copy("Quick reference")}</div>
        <div style="overflow-x:auto">
          <table class="chord-tones-table" style="width:100%;min-width:520px">
            <thead>
              <tr>
                <th style="width:3rem">°</th>
                <th>${copy("Mode (jazz name)")}</th>
                <th>${copy("Formula")}</th>
                <th>${copy("Best over")}</th>
              </tr>
            </thead>
            <tbody>${copy(tableRows)}</tbody>
          </table>
        </div>
      </div>

      <div class="theory-item">
        <div class="theory-item-title">${copy("Why melodic minor matters in jazz")}</div>
        <p>${copy("The melodic minor scale differs from natural minor by only two notes — the raised 6th and 7th. This small change produces seven modes with dramatically different colours, from the lush")} <strong>${copy("Lydian Augmented")}</strong> ${copy("(∆7♯5 chords) to the tension-packed")} <strong>${copy("Altered Scale")}</strong> ${copy("(7alt chords).")}</p>
        <p class="text-muted">${copy("Key relationship: Mode VII of melodic minor (Altered Scale) is built a half-step above the dominant root. So for G7alt, use Ab melodic minor starting on G.")}</p>
      </div>

      <div class="theory-list">${copy(cards)}</div>

      <div class="theory-item mt-lg">
        <div class="theory-item-title">${copy("Altered Scale — note on spelling")}</div>
        <p>${copy("The Altered Scale contains both a ♭3 (= ♯9 tension) and a ♮3 (chord tone). The formula")} <code>1 ♭2 ♭3 ♮3 ♭5 ♭6 ♭7</code> ${copy("lists them as separate degrees. In jazz notation these appear as:")} <strong>${copy("root, ♭9, ♯9, 3, ♯11/♭5, ♭13, ♭7")}</strong>.</p>
        <p class="text-muted">${copy("Tip: Think of the Altered Scale as the 7th mode of the melodic minor scale a half-step above the dominant root.")}</p>
      </div>
    </div>
  `)
}

function buildCards() { return MELODIC_MINOR_MODES.map(m => {
    const notes = getMelodicMinorModeNotes('C', m.name).join(' — ')
    return `
      <div class="theory-item">
        <div class="theory-item-title">${copy(m.degree)} ${copy("&nbsp;")} ${copy(m.name)}</div>
        <div class="theory-item-subtitle">${copy(m.altNames)} ${copy("&nbsp;·&nbsp;")} ${copy(m.feel)}</div>
        <p class="text-muted">${copy("Formula:")} <code>${copy(m.formula)}</code> ${copy("&nbsp;·&nbsp; Steps:")} <code>${copy(m.steps)}</code></p>
        <p class="text-muted">${copy("C example:")} <strong>${copy(notes)}</strong></p>
        <p class="text-muted">${copy("Characteristic:")} ${copy(m.characteristic)}</p>
        <p class="text-muted">${copy("Best over:")} <strong>${copy(m.chordFit)}</strong> ${copy("&nbsp;(")}<code>${copy(m.chordSymbol)}</code>)</p>
        <p class="text-muted">${copy("Jazz context:")} ${copy(m.jazzContext)}</p>
      </div>
    `
  }).join(''); }
function buildTableRows() { return MELODIC_MINOR_MODES.map(m => `
    <tr>
      <td class="text-muted">${copy(m.degree)}</td>
      <td><strong>${copy(m.name)}</strong><br><span style="font-size:var(--text-xs);color:var(--text-muted)">${copy(m.altNames)}</span></td>
      <td><code>${copy(m.formula)}</code></td>
      <td><strong>${copy(m.chordFit)}</strong></td>
    </tr>
  `).join(''); }
