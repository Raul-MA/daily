import { copy } from '../../i18n.js';
export function initialize0(ctx) {
ctx.container.innerHTML = copy(`
    <div class="search-wrapper">
      <input
        class="search-input"
        type="search"
        placeholder="Search topics…"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded="false"
        aria-controls="search-results"
        autocomplete="off"
        spellcheck="false"
        aria-label="Search pages and content"
      />
      <div id="search-results" class="search-results" role="listbox" aria-label="Search results"></div>
      <div class="search-status" role="status"></div>
    </div>
  `)
}
