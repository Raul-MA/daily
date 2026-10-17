import { copy } from '../../i18n.js';
import { mountMarkdown } from '../components/markdown.js'

export const THEORY_MD = `
## Available Tensions

A **tension** is a note added to a 7th chord beyond the four basic chord tones. Tensions create color and motion.

### Which tensions are available?

Not all tensions sound good on every chord. A tension is **available** if it does not create a dissonant half-step (minor 9th) against any chord tone.

An **avoid note** is a note that creates this half-step clash — it sounds unresolved or wrong when sustained.

### Rules for dominant 7th chords (V7)

Dominant chords (the V chord) have the most available tensions because their function is to create tension that resolves to I.

| Tension | Semitones | Character |
|---------|-----------|-----------|
| b9      | 1         | Dark, Spanish flavor |
| 9       | 2         | Neutral, bright |
| #9      | 3         | Blues/rock intensity |
| #11     | 6         | Lydian dominant, sophisticated |
| b13     | 8         | Dark color |
| 13      | 9         | Open, full sound |

### Rules for non-dominant chords

Non-dominant chords (major 7, minor 7, etc.) have fewer available tensions because they need to remain stable:

- **Maj7**: 9, #11, 13 (avoid the natural 11 — it clashes with the major 3rd)
- **m7**: 9, 11 (avoid the major 6th / natural 13th in most contexts)
- **mMaj7**: 9, 11
- **m7b5**: 9, 11, b13

### The avoid note concept

On a **Maj7** chord in a major key, the natural 4th (11th) is only a half step above the 3rd. Sustained, it creates tension that doesn't resolve — so it's treated as an avoid note in most contexts (though it can be used as a passing tone).
`

export default function render(container) {
  const content = document.createElement('div')
  content.className = 'theory-content'

  container.innerHTML = copy(`
    <div class="page-header">
      <h1>${copy("Available Tensions — Theory")}</h1>
      <div class="page-nav-links">
        <a href="#/available-tensions/exercises">${copy("Exercises →")}</a>
        <a href="#/available-tensions/cards">${copy("Cards →")}</a>
      </div>
    </div>
  `)
  mountMarkdown(content, THEORY_MD)
  container.appendChild(content)
}
