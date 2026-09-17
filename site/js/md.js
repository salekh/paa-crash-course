// Minimal, dependency-free Markdown renderer tuned for the study modules.
// Supports: ATX headings (with ids), paragraphs, bold/italic/code/links, fenced code,
// GFM tables, nested bullet/numbered lists, blockquotes (with Exam tip / Trap / Remember
// kickers), horizontal rules, images.

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function slugify(s) {
  return s.toLowerCase().replace(/[`*_]/g, '').replace(/[^\w\s-]/g, '').trim().replace(/[\s_]+/g, '-');
}

export function inline(text) {
  // protect code spans first
  const codes = [];
  let t = text.replace(/`([^`]+)`/g, (_, c) => { codes.push(c); return `\u0000${codes.length - 1}\u0000`; });
  t = esc(t);
  t = t.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, '<img alt="$1" src="$2" loading="lazy">');
  t = t.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, a, h) => `<a href="${h}" ${/^https?:/.test(h) ? 'target="_blank" rel="noopener"' : ''}>${a}</a>`);
  t = t.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  t = t.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  t = t.replace(/(^|[\s(])\*(?!\s)([^*]+?)\*(?=[\s).,;:!?]|$)/g, '$1<em>$2</em>');
  t = t.replace(/(^|[\s(])_(?!\s)([^_]+?)_(?=[\s).,;:!?]|$)/g, '$1<em>$2</em>');
  t = t.replace(/~~(.+?)~~/g, '<del>$1</del>');
  t = t.replace(/\u0000(\d+)\u0000/g, (_, i) => `<code>${esc(codes[+i])}</code>`);
  return t;
}

function renderTable(lines) {
  const rows = lines.map(l => l.trim().replace(/^\|/, '').replace(/\|$/, '').split(/(?<!\\)\|/).map(c => c.trim().replace(/\\\|/g, '|')));
  if (rows.length < 2) return `<p>${inline(lines.join(' '))}</p>`;
  const align = rows[1].map(c => /^:-+:$/.test(c) ? 'center' : /^-+:$/.test(c) ? 'right' : 'left');
  const head = rows[0], body = rows.slice(2);
  let h = '<div class="tbl"><table><thead><tr>' + head.map((c, i) => `<th style="text-align:${align[i] || 'left'}">${inline(c)}</th>`).join('') + '</tr></thead><tbody>';
  for (const r of body) {
    if (r.every(c => c === '')) continue;
    h += '<tr>' + head.map((_, i) => `<td style="text-align:${align[i] || 'left'}">${inline(r[i] || '')}</td>`).join('') + '</tr>';
  }
  return h + '</tbody></table></div>';
}

function renderList(items) {
  // items: [{indent, ordered, text, children:[]}] already nested
  const ordered = items[0].ordered;
  let h = ordered ? '<ol>' : '<ul>';
  for (const it of items) {
    h += `<li>${inline(it.text)}${it.children.length ? renderList(it.children) : ''}</li>`;
  }
  return h + (ordered ? '</ol>' : '</ul>');
}

function parseList(lines) {
  const flat = [];
  for (const raw of lines) {
    const m = raw.match(/^(\s*)([-*+]|\d+[.)])\s+(.*)$/);
    if (m) flat.push({ indent: m[1].replace(/\t/g, '  ').length, ordered: /\d/.test(m[2]), text: m[3], children: [] });
    else if (flat.length) flat[flat.length - 1].text += ' ' + raw.trim();
  }
  const root = [], stack = [];
  for (const it of flat) {
    while (stack.length && stack[stack.length - 1].indent >= it.indent) stack.pop();
    (stack.length ? stack[stack.length - 1].children : root).push(it);
    stack.push(it);
  }
  return root;
}

function renderQuote(lines) {
  const inner = lines.map(l => l.replace(/^\s*>\s?/, ''));
  const first = inner.find(l => l.trim()) || '';
  let cls = '', kicker = '';
  const km = first.match(/^\s*\*\*(Exam tip|Trap|Remember|Note|Warning|Tip|Key idea|Important)[:：]?\*\*[:：]?\s*/i);
  if (km) {
    const k = km[1].toLowerCase();
    cls = k.includes('tip') ? 'tip' : k.includes('trap') || k.includes('warn') ? 'trap' : k.includes('remember') || k.includes('key') || k.includes('important') ? 'remember' : '';
    kicker = km[1];
    const i = inner.indexOf(first); inner[i] = first.slice(km[0].length);
  }
  const body = render(inner.join('\n'));
  return `<blockquote class="${cls}">${kicker ? `<span class="kicker">${esc(kicker)}</span>` : ''}${body}</blockquote>`;
}

export function render(md, opts = {}) {
  const lines = md.replace(/\r\n?/g, '\n').split('\n');
  const out = [];
  const headings = [];
  let i = 0;
  const isTableLine = (l) => /^\s*\|.*\|\s*$/.test(l);
  const isListLine = (l) => /^\s*([-*+]|\d+[.)])\s+/.test(l);
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }
    // fenced code
    let m = line.match(/^\s*```\s*(\w+)?/);
    if (m) {
      const buf = []; i++;
      while (i < lines.length && !/^\s*```/.test(lines[i])) buf.push(lines[i++]);
      i++;
      out.push(`<pre><code class="lang-${m[1] || 'text'}">${esc(buf.join('\n'))}</code></pre>`);
      continue;
    }
    // heading
    m = line.match(/^(#{1,6})\s+(.+?)\s*#*\s*$/);
    if (m) {
      const level = m[1].length, text = m[2];
      let id = slugify(text); let n = 1;
      while (headings.some(h => h.id === id)) id = slugify(text) + '-' + (++n);
      headings.push({ level, text, id });
      out.push(`<h${level} id="${id}">${inline(text)}</h${level}>`);
      i++; continue;
    }
    // hr
    if (/^\s*(-{3,}|\*{3,}|_{3,})\s*$/.test(line)) { out.push('<hr>'); i++; continue; }
    // table
    if (isTableLine(line) && i + 1 < lines.length && /^\s*\|?\s*:?-+/.test(lines[i + 1])) {
      const buf = [];
      while (i < lines.length && isTableLine(lines[i])) buf.push(lines[i++]);
      out.push(renderTable(buf)); continue;
    }
    // blockquote
    if (/^\s*>/.test(line)) {
      const buf = [];
      while (i < lines.length && (/^\s*>/.test(lines[i]) || (lines[i].trim() && buf.length && !/^\s*$/.test(lines[i]) && !isListLine(lines[i]) && !/^#{1,6}\s/.test(lines[i]) && /^\s*>/.test(buf[buf.length - 1])))) buf.push(lines[i++]);
      out.push(renderQuote(buf)); continue;
    }
    // list
    if (isListLine(line)) {
      const buf = [];
      while (i < lines.length && (isListLine(lines[i]) || (lines[i].trim() && /^\s{2,}/.test(lines[i]) && !isTableLine(lines[i])))) buf.push(lines[i++]);
      out.push(renderList(parseList(buf))); continue;
    }
    // paragraph
    const buf = [];
    while (i < lines.length && lines[i].trim() && !/^\s*```/.test(lines[i]) && !/^#{1,6}\s/.test(lines[i]) && !isListLine(lines[i]) && !/^\s*>/.test(lines[i]) && !(isTableLine(lines[i]) && i + 1 < lines.length && /^\s*\|?\s*:?-+/.test(lines[i + 1]))) buf.push(lines[i++]);
    out.push(`<p>${inline(buf.join(' '))}</p>`);
  }
  const html = out.join('\n');
  return opts.withHeadings ? { html, headings } : html;
}
