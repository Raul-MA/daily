import { MELODIC_MINOR_MODES, getMelodicMinorModeNotes } from '../music/melodic-minor.js'

export default function render(container) {
  
  const tableRows = buildTableRows();

  
  const cards = buildCards();

  container.innerHTML = `
    <div class="page-header">
      <h1>Melodic Minor Modes — Theory</h1>
      <div class="page-nav-links">
        <a href="#/melodic-minor/exercises">Exercises →</a>
        <a href="#/modes/theory">Major Modes →</a>
      </div>
    </div>

    <div class="theory-content">
      <p class="text-muted mb-lg">Jazz uses all 7 modes of the melodic minor scale as distinct chord-scales. Unlike classical usage (ascending only), jazz treats melodic minor as a fixed scale — giving rise to some of its most characteristic sounds: the Lydian Dominant, the Altered Scale, and more.</p>

      <div class="theory-item">
        <div class="theory-item-title">Quick reference</div>
        <div style="overflow-x:auto">
          <table class="chord-tones-table" style="width:100%;min-width:520px">
            <thead>
              <tr>
                <th style="width:3rem">°</th>
                <th>Mode (jazz name)</th>
                <th>Formula</th>
                <th>Best over</th>
              </tr>
            </thead>
            <tbody>${tableRows}</tbody>
          </table>
        </div>
      </div>

      <div class="theory-item">
        <div class="theory-item-title">Why melodic minor matters in jazz</div>
        <p>The melodic minor scale differs from natural minor by only two notes — the raised 6th and 7th. This small change produces seven modes with dramatically different colours, from the lush <strong>Lydian Augmented</strong> (∆7♯5 chords) to the tension-packed <strong>Altered Scale</strong> (7alt chords).</p>
        <p class="text-muted">Key relationship: Mode VII of melodic minor (Altered Scale) is built a half-step above the dominant root. So for G7alt, use Ab melodic minor starting on G.</p>
      </div>

      <div class="theory-list">${cards}</div>

      <div class="theory-item mt-lg">
        <div class="theory-item-title">Altered Scale — note on spelling</div>
        <p>The Altered Scale contains both a ♭3 (= ♯9 tension) and a ♮3 (chord tone). The formula <code>1 ♭2 ♭3 ♮3 ♭5 ♭6 ♭7</code> lists them as separate degrees. In jazz notation these appear as: <strong>root, ♭9, ♯9, 3, ♯11/♭5, ♭13, ♭7</strong>.</p>
        <p class="text-muted">Tip: Think of the Altered Scale as the 7th mode of the melodic minor scale a half-step above the dominant root.</p>
      </div>
    </div>
  `
}

function buildCards() { return MELODIC_MINOR_MODES.map(m => {
    const notes = getMelodicMinorModeNotes('C', m.name).join(' — ')
    return `
      <div class="theory-item">
        <div class="theory-item-title">${m.degree} &nbsp; ${m.name}</div>
        <div class="theory-item-subtitle">${m.altNames} &nbsp;·&nbsp; ${m.feel}</div>
        <p class="text-muted">Formula: <code>${m.formula}</code> &nbsp;·&nbsp; Steps: <code>${m.steps}</code></p>
        <p class="text-muted">C example: <strong>${notes}</strong></p>
        <p class="text-muted">Characteristic: ${m.characteristic}</p>
        <p class="text-muted">Best over: <strong>${m.chordFit}</strong> &nbsp;(<code>${m.chordSymbol}</code>)</p>
        <p class="text-muted">Jazz context: ${m.jazzContext}</p>
      </div>
    `
  }).join(''); }
function buildTableRows() { return MELODIC_MINOR_MODES.map(m => `
    <tr>
      <td class="text-muted">${m.degree}</td>
      <td><strong>${m.name}</strong><br><span style="font-size:var(--text-xs);color:var(--text-muted)">${m.altNames}</span></td>
      <td><code>${m.formula}</code></td>
      <td><strong>${m.chordFit}</strong></td>
    </tr>
  `).join(''); }
