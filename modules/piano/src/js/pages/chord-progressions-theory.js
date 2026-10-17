import { copy } from '../../i18n.js';
import { mountMarkdown } from '../components/markdown.js'

export const THEORY_MD = `
## Chord Progressions Theory

### ii-V-I — The Core Jazz Cadence

The **ii-V-I** progression is the backbone of jazz harmony. Every jazz standard uses it in some form.

**Major key** (e.g. C major)

| Roman | Chord | Function |
|-------|-------|----------|
| iim7  | Dm7   | Predominant |
| V7    | G7    | Dominant |
| Imaj7 | Cmaj7 | Tonic |

**Minor key** (e.g. C minor — harmonic minor for V7)

| Roman  | Chord     | Function |
|--------|-----------|----------|
| iiø7   | Dø7       | Predominant |
| V7(♭9) | G7(♭9)    | Dominant |
| imMaj7 | CmMaj7    | Tonic |

The raised 7th of harmonic minor creates a leading tone and a natural V7 chord.

---

### Backcycling

**Backcycling** (also called back-cycling or chain of dominants) extends a cadence by
prepending earlier dominant approaches. Each new dominant resolves to the next chord in the chain.

The process works backwards through the circle of fifths: each new dominant is a P5 above
(or P4 below) the previous target.

**Example in C major:**

Starting from the final ii-V-I:

- **Dm7 – G7 – Cmaj7**

Add one more link (Em7–A7 resolves to Dm7):

- **Em7 – A7 – Dm7 – G7 – Cmaj7**

Add another link (F#ø7–B7 resolves to Em7):

- **F#ø7 – B7 – Em7 – A7 – Dm7 – G7 – Cmaj7**

Each ii-V pair tonicises the chord that follows it. The chain can be extended as far as desired.

> **Key insight:** The dominant cycle follows the circle of fifths backwards —
> each new V7 is a perfect fifth above the previous ii.

---

### Contiguous Dominants

Dominant 7th chords may also move by **half-step** or **whole-step** for chromatic dominant motion.
These are called contiguous dominants (or parallel dominants) and create tension through
chromatic voice leading.

**Half-step approach (subdominant / tritone sub motion):**

- **D♭7 → Cmaj7** — D♭7 is a half step above the tonic, resolving by step

**Whole-step approach:**

- **A7 → G7 → Cmaj7** — A7 moves down a whole step to G7

**Chromatic descending dominant chain:**

- **B♭7 – A7 – A♭7 – G7 → Cmaj7** — four dominant chords descending by half step

This type of motion appears frequently in jazz arrangements and reharmonisations because
each dominant creates tension and the chromatic descent provides smooth voice leading.

---

### Comparison

| Technique | Motion | Example |
|-----------|--------|---------|
| Backcycling | Circle of fifths backwards | A7 → Dm7 → G7 → Cmaj7 |
| Tritone sub | ♭II replaces V | Dm7 – D♭7 – Cmaj7 |
| Contiguous half-step | Dominant descends ½ step | D♭7 → Cmaj7 |
| Contiguous whole-step | Dominant descends whole step | A7 → G7 → Cmaj7 |
`

export default function render(container) {
  const content = document.createElement('div')
  content.className = 'theory-content'

  container.innerHTML = copy(`
    <div class="page-header">
      <h1>${copy("Chord Progressions")}</h1>
      <div class="page-nav-links">
        <a href="#/chord-substitution/theory">${copy("Substitution")}</a>
      </div>
    </div>
  `)
  mountMarkdown(content, THEORY_MD)
  container.appendChild(content)
}
