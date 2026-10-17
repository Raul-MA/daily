import { copy } from '../../i18n.js';
import { LIBRARY_GROUPS } from '../components/navigation-data.js'

export default function render(container) {
  container.innerHTML = copy(`
    <header class="page-header">
      <h1>${copy("Library")}</h1>
      <p class="text-muted">${copy("Look up an idea or choose a focused exercise.")}</p>
    </header>
    <div class="library-grid">
      ${copy(LIBRARY_GROUPS.map((group, index) => `
        <section class="library-family" aria-labelledby="library-family-${index}">
          <h2 id="library-family-${index}">${copy(group.label)}</h2>
          <p class="text-muted">${copy(group.description)}</p>
          <ul class="library-list">
            ${copy(group.topics.map(topic => `
              <li class="library-row">
                <span class="library-topic">${copy(topic.label)}</span>
                <span class="library-links">${copy(topic.links.map(link => `<a href="#${link.path}" aria-label="${topic.label} — ${link.kind}">${copy(link.kind)}</a>`).join(''))}</span>
              </li>`).join(''))}
          </ul>
        </section>`).join(''))}
    </div>`)
}
