import { LIBRARY_GROUPS } from '../components/navigation-data.js'

export default function render(container) {
  container.innerHTML = `
    <header class="page-header">
      <h1>Library</h1>
      <p class="text-muted">Look up an idea or choose a focused exercise.</p>
    </header>
    <div class="library-grid">
      ${LIBRARY_GROUPS.map((group, index) => `
        <section class="library-family" aria-labelledby="library-family-${index}">
          <h2 id="library-family-${index}">${group.label}</h2>
          <p class="text-muted">${group.description}</p>
          <ul class="library-list">
            ${group.topics.map(topic => `
              <li class="library-row">
                <span class="library-topic">${topic.label}</span>
                <span class="library-links">${topic.links.map(link => `<a href="#${link.path}" aria-label="${topic.label} — ${link.kind}">${link.kind}</a>`).join('')}</span>
              </li>`).join('')}
          </ul>
        </section>`).join('')}
    </div>`
}
