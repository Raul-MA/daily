import { copy } from '../../i18n.js';
import { mountMarkdown } from '../components/markdown.js'

export const THEORY_MD = `
## Chord Substitution

### Shell Chords

A **shell chord** is a voicing that uses only the essential guide tones — the **3rd and 7th** — omitting the root and fifth. These two notes define the chord's quality and voice leading direction.

| Chord | 3rd | 7th | Feel |
|-------|-----|-----|------|
| Maj7  | 3   | 7   | Happy, bright |
| 7     | 3   | b7  | Tense, dominant |
| m7    | b3  | b7  | Sad, cool |
| mMaj7 | b3  | 7   | Mysterious, tense |

The root and fifth are implied by context (bass line, other instruments).

---

### Why guide tones matter

The **tritone** between the 3rd and 7th of a dominant chord (V7) is what drives resolution to I. When the V7 resolves:

- The 3rd resolves **up** by a half step to the root of I
- The 7th resolves **down** by a half step to the 3rd of I

This half-step voice leading is the engine of harmonic motion.

---

### Tritone Substitution

A dominant 7th chord can be replaced by the dominant chord a **tritone away** (6 semitones). Both chords share the same guide tones (3rd and 7th are enharmonic).

**Example**: G7 can be substituted by Db7

| Chord | 3rd | 7th |
|-------|-----|-----|
| G7    | B   | F   |
| Db7   | F   | Cb (=B) |

The guide tones are the same — only the root moves.

---

### ii–V–I substitutions

The most common jazz progression is **ii–V–I**. Common substitutions:

- Replace **ii** with **IV** (both are pre-dominant)
- Replace **V** with its tritone substitution (bII7)
- Replace **I** with **vi** (both are tonic function chords)

---

### Chord quality ambiguity

Because guide tones define chord quality, chords with the same 3rd and 7th are interchangeable:

- **Cmaj7** and **Em7** share similar tones — both are tonic function in C major
- **G7** and **Db7** share the same tritone — both resolve to C
`

export default function render(container) {
  const content = document.createElement('div')
  content.className = 'theory-content'

  container.innerHTML = copy(`
    <div class="page-header">
      <h1>${copy("Chord Substitution")}</h1>
    </div>
  `)
  mountMarkdown(content, THEORY_MD)
  container.appendChild(content)
}
