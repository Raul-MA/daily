import { copy } from '../../i18n.js';
export function renderMarkdown(md) {
  if (!md) return '';
  const state = { lines: md.split('\n'), index: 0, html: '', steps: 0 };
  const blocks = [fence, heading, rule, quote, table, unordered, ordered, blank, paragraph];
  while (state.index < state.lines.length) {
    state.steps++;
    const start = state.index;
    if (state.steps > state.lines.length * 10) throw new Error(`Markdown renderer stalled near line ${state.index + 1}`);
    for (const block of blocks) { if (block(state)) break; }
    if (state.index === start) throw new Error(`Markdown renderer stalled on line ${state.index + 1}`);
  }
  return state.html;
}
function fence(state) {
  const line = state.lines[state.index];
  if (!line.startsWith('```')) return false;
  const lang = line.slice(3).trim();
  let code = '';
  state.index++;
  while (state.index < state.lines.length && !state.lines[state.index].startsWith('```')) {
    code += escapeHtml(state.lines[state.index]) + '\n';
    state.index++;
  }
  state.html += `<pre><code class="language-${escapeHtml(lang)}">${copy(code)}</code></pre>\n`;
  state.index++;
  return true;
}
function heading(state) {
  const match = state.lines[state.index].match(/^(#{1,6})\s+(.+)/);
  if (!match) return false;
  const level = match[1].length;
  state.html += `<h${level}>${copy(inlineMarkdown(match[2]))}</h${level}>\n`;
  state.index++;
  return true;
}
function rule(state) {
  if (!/^(-{3,}|\*{3,}|_{3,})$/.test(state.lines[state.index].trim())) return false;
  state.html += '<hr>\n';
  state.index++;
  return true;
}
function quote(state) {
  if (!state.lines[state.index].startsWith('> ')) return false;
  let content = '';
  while (state.index < state.lines.length && state.lines[state.index].startsWith('> ')) {
    content += state.lines[state.index].slice(2) + '\n';
    state.index++;
  }
  state.html += `<blockquote>${copy(renderMarkdown(content.trim()))}</blockquote>\n`;
  return true;
}
function table(state) {
  if (!isTableStart(state.lines, state.index)) return false;
  const header = parseTableRow(state.lines[state.index]);
  state.index += 2;
  let rows = '';
  while (state.index < state.lines.length && state.lines[state.index].includes('|')) {
    const cells = parseTableRow(state.lines[state.index]);
    rows += '<tr>' + cells.map(cell => `<td>${copy(inlineMarkdown(cell))}</td>`).join('') + '</tr>\n';
    state.index++;
  }
  const headerHTML = '<tr>' + header.map(cell => `<th>${copy(inlineMarkdown(cell))}</th>`).join('') + '</tr>';
  state.html += `<table><thead>${copy(headerHTML)}</thead><tbody>${copy(rows)}</tbody></table>\n`;
  return true;
}
function list(state, pattern, tag) {
  if (!pattern.test(state.lines[state.index])) return false;
  state.html += `<${tag}>\n`;
  while (state.index < state.lines.length && pattern.test(state.lines[state.index])) {
    state.html += `<li>${copy(inlineMarkdown(state.lines[state.index].replace(pattern, '')))}</li>\n`;
    state.index++;
  }
  state.html += `</${tag}>\n`;
  return true;
}
function unordered(state) { return list(state, /^[-*+]\s/, 'ul'); }
function ordered(state) { return list(state, /^\d+\.\s/, 'ol'); }
function blank(state) {
  if (state.lines[state.index].trim() !== '') return false;
  state.index++;
  return true;
}
function blockBoundary(lines, index) {
  const line = lines[index];
  return line.trim() === '' || ['#', '```', '> '].some(prefix => line.startsWith(prefix))
    || /^[-*+]\s/.test(line) || /^\d+\.\s/.test(line) || isTableStart(lines, index) || /^(-{3,}|\*{3,}|_{3,})$/.test(line.trim());
}
function paragraph(state) {
  let text = '';
  while (state.index < state.lines.length && !blockBoundary(state.lines, state.index)) {
    text += (text ? ' ' : '') + state.lines[state.index];
    state.index++;
  }
  if (!text) return false;
  state.html += `<p>${copy(inlineMarkdown(text))}</p>\n`;
  return true;
}

function isTableStart(lines, index) {
  return Boolean(
    lines[index]?.includes('|') &&
    index + 1 < lines.length &&
    lines[index + 1].match(/^\|?\s*[-:]+\s*(\|\s*[-:]+\s*)+\|?$/)
  )
}

function parseTableRow(line) {
  return line.replace(/^\||\|$/g, '').split('|').map(c => c.trim())
}

function inlineMarkdown(text) {
  return copy(text
    
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    
    .replace(/~~(.+?)~~/g, '<del>$1</del>'))
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}


export function mountMarkdown(element, md) {
  element.innerHTML = copy(renderMarkdown(md))
}
