import { SCALES, BEBOP_SCALE_NAMES, getScaleNotes } from '../music/scales.js'

export default function render(container) {
  const items = BEBOP_SCALE_NAMES.map(name => {
    const { pattern, steps, note, passingToneIndex, chordFit, chord, parentScale, degree } = SCALES[name]
    const notes = getScaleNotes('C', name)

    const notesHTML = notes.map((n, i) => {
      const isPassing = i === passingToneIndex
      return isPassing
        ? `<span style="color:var(--warning);font-weight:700">${n}*</span>`
        : `<span>${n}</span>`
    }).join(' — ')

    return `
      <div class="theory-item">
        <div class="theory-item-title">${name}</div>
        <div class="theory-item-subtitle">Parent scale: ${parentScale} &nbsp;·&nbsp; Fits over: ${degree}</div>
        <p class="text-muted">Chord: <strong>${chord}</strong></p>
        <p class="text-muted">Steps: <code>${steps}</code> &nbsp;·&nbsp; ${pattern.length} notes</p>
        <p class="text-muted">C example: ${notesHTML}</p>
        <p class="text-muted" style="font-style:italic">${note}</p>
        <p class="text-muted">Chord fit: <strong>${chordFit}</strong></p>
      </div>
    `
  }).join('')

  container.innerHTML = `
    <div class="page-header">
      <h1>Bebop Scales — Theory</h1>
      <div class="page-nav-links">
        <a href="#/bebop/exercises">Exercises →</a>
        <a href="#/scales/theory">All Scales →</a>
      </div>
    </div>

    <div class="theory-content">
      <div class="theory-item">
        <div class="theory-item-title">What is a bebop scale?</div>
        <p>Bebop scales add a single <strong>chromatic passing tone</strong> to a 7-note parent scale, producing an <strong>8-note</strong> scale. The extra note has one purpose: when you play a steady stream of 8th notes starting on beat 1, every <strong>chord tone</strong> (root, 3rd, 5th, 7th) falls on a <strong>strong beat</strong> (1, 2, 3, 4).</p>
        <p class="text-muted">With a 7-note scale, chord tones alternate between strong and weak beats as you ascend — harmonic clarity suffers. The 8th note realigns everything.</p>
        <p class="text-muted">The passing tone is marked with <span style="color:var(--warning);font-weight:700">*</span> in each example below.</p>
      </div>

      <div class="theory-item">
        <div class="theory-item-title">Strong-beat alignment rule</div>
        <p>Start on the root (beat 1, strong). Each 8th note moves one scale step. With 8 notes per octave, the pattern repeats exactly every bar. Chord tones on positions 1, 3, 5, 7 land on beats 1, 2, 3, 4 — every bar, every octave.</p>
        <p class="text-muted">Practically: begin bebop lines <em>on a chord tone</em> on a strong beat and the rest of the line will outline the harmony automatically.</p>
      </div>

      <div class="theory-list">${items}</div>
    </div>
  `
}
