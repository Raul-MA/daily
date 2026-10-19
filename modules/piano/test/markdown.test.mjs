import test from 'node:test';
import assert from 'node:assert/strict';
import { loadModule } from '../../../tests/support/load-module.mjs';

const { renderMarkdown } = await loadModule('piano', 'js/components/markdown.js');

test('piano Markdown retains heading emphasis code links and Unicode teaching text', () => {
  const html = renderMarkdown('# Café 🌱\n\n**Strong** and *soft* with ***both***, `C#`, ~~old~~ and [reference](https://example.com).');
  assert.match(html, /<h1>Café 🌱<\/h1>/);
  for (const fragment of ['<strong>Strong</strong>', '<em>soft</em>', '<strong><em>both</em></strong>', '<code>C#</code>', '<del>old</del>', 'target="_blank" rel="noopener"']) assert.ok(html.includes(fragment), fragment);
});

test('piano Markdown preserves tables blockquotes and escaped code fences', () => {
  const html = renderMarkdown('| Note | Degree |\n| --- | --- |\n| C | 1 |\n\n> ## Recall\n> Say **C**.\n\n```js\n<a title="x">&\n```');
  assert.match(html, /<th>Note<\/th>/);
  assert.match(html, /<td>C<\/td>/);
  assert.match(html, /<blockquote><h2>Recall<\/h2>/);
  assert.match(html, /<strong>C<\/strong>/);
  assert.ok(html.includes('language-js'));
  assert.ok(html.includes('&lt;a title=&quot;x&quot;&gt;&amp;'));
});

test('piano Markdown keeps paragraph list and rule boundaries without dropping ordinary pipes', () => {
  const html = renderMarkdown('First line\nsecond | line\n\n- One\n- Two\n\n1. Three\n2. Four\n\n---');
  assert.match(html, /<p>First line second \| line<\/p>/);
  assert.match(html, /<ul>\n<li>One<\/li>\n<li>Two<\/li>\n<\/ul>/);
  assert.match(html, /<ol>\n<li>Three<\/li>\n<li>Four<\/li>\n<\/ol>/);
  assert.match(html, /<hr>/);
});

test('piano Markdown handles blank input and detects an unconsumed malformed heading', () => {
  assert.equal(renderMarkdown(''), '');
  assert.equal(renderMarkdown(null), '');
  assert.equal(renderMarkdown('\n\n'), '');
  assert.throws(() => renderMarkdown('#Missing space'), /stalled/);
  assert.match(renderMarkdown('```\nunfinished'), /unfinished/);
});
