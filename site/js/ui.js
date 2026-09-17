// Small UI helpers: html tag, icons, toast, SVG charts.

export const html = (strings, ...vals) => strings.reduce((a, s, i) => a + s + (i < vals.length ? (Array.isArray(vals[i]) ? vals[i].join('') : vals[i] ?? '') : ''), '');
export const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

export const ICON = {
  check: '<svg viewBox="0 0 24 24"><path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z"/></svg>',
  close: '<svg viewBox="0 0 24 24"><path d="M19 6.4 17.6 5 12 10.6 6.4 5 5 6.4l5.6 5.6L5 17.6 6.4 19l5.6-5.6 5.6 5.6 1.4-1.4-5.6-5.6z"/></svg>',
  flag: '<svg viewBox="0 0 24 24"><path d="M14.4 6 14 4H5v17h2v-7h5.6l.4 2h7V6z"/></svg>',
  flagOutline: '<svg viewBox="0 0 24 24"><path d="M12.36 6l.4 2H18v6h-3.36l-.4-2H7V6h5.36M14 4H5v17h2v-7h5.6l.4 2h7V6h-7.6L14 4z"/></svg>',
  bookmark: '<svg viewBox="0 0 24 24"><path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"/></svg>',
  bookmarkOutline: '<svg viewBox="0 0 24 24"><path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2zm0 15-5-2.18L7 18V5h10v13z"/></svg>',
  arrowRight: '<svg viewBox="0 0 24 24"><path d="M12 4l-1.4 1.4 5.6 5.6H4v2h12.2l-5.6 5.6L12 20l8-8z"/></svg>',
  arrowLeft: '<svg viewBox="0 0 24 24"><path d="M20 11H7.8l5.6-5.6L12 4l-8 8 8 8 1.4-1.4L7.8 13H20z"/></svg>',
  grid: '<svg viewBox="0 0 24 24"><path d="M4 8h4V4H4v4zm6 12h4v-4h-4v4zm-6 0h4v-4H4v4zm0-6h4v-4H4v4zm6 0h4v-4h-4v4zm6-10v4h4V4h-4zm-6 4h4V4h-4v4zm6 6h4v-4h-4v4zm0 6h4v-4h-4v4z"/></svg>',
  book: '<svg viewBox="0 0 24 24"><path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/></svg>',
  quiz: '<svg viewBox="0 0 24 24"><path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-5 14h-2v-2h2v2zm1.9-6.8-.9.9c-.7.8-1 1.4-1 2.9h-2v-.5c0-1.1.4-2.1 1.2-2.8l1.2-1.3c.4-.3.6-.8.6-1.4 0-1.1-.9-2-2-2s-2 .9-2 2H10c0-2.2 1.8-4 4-4s4 1.8 4 4c0 .9-.4 1.7-.9 2.3z"/></svg>',
  timer: '<svg viewBox="0 0 24 24"><path d="M15 1H9v2h6V1zm-4 13h2V8h-2v6zm8.03-6.61 1.42-1.42c-.43-.51-.9-.99-1.41-1.41l-1.42 1.42A8.962 8.962 0 0 0 12 4c-4.97 0-9 4.03-9 9s4.02 9 9 9a8.994 8.994 0 0 0 7.03-14.61zM12 20c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/></svg>',
  chart: '<svg viewBox="0 0 24 24"><path d="M5 9.2h3V19H5V9.2zM10.6 5h2.8v14h-2.8V5zm5.6 8H19v6h-2.8v-6z"/></svg>',
  case: '<svg viewBox="0 0 24 24"><path d="M20 6h-4V4c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-6 0h-4V4h4v2z"/></svg>',
  shield: '<svg viewBox="0 0 24 24"><path d="M12 1 3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg>',
  cloud: '<svg viewBox="0 0 24 24"><path d="M19.35 10.04A7.49 7.49 0 0 0 12 4C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 0 0 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z"/></svg>',
  sparkle: '<svg viewBox="0 0 24 24"><path d="M12 2 9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5z"/></svg>',
  menu: '<svg viewBox="0 0 24 24"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/></svg>',
  search: '<svg viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>',
  play: '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>',
  history: '<svg viewBox="0 0 24 24"><path d="M13 3a9 9 0 0 0-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42A8.954 8.954 0 0 0 13 21a9 9 0 0 0 0-18zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/></svg>',
  warn: '<svg viewBox="0 0 24 24"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>',
  trend: '<svg viewBox="0 0 24 24"><path d="m16 6 2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/></svg>',
};

let toastTimer;
export function toast(msg) {
  let t = $('.toast'); if (!t) { t = document.createElement('div'); t.className = 'toast'; document.body.appendChild(t); }
  t.textContent = msg; t.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
}

export function ring(pctVal, color) {
  const r = 78, c = 2 * Math.PI * r, off = c * (1 - pctVal / 100);
  return `<svg width="180" height="180" viewBox="0 0 180 180"><circle cx="90" cy="90" r="${r}" fill="none" stroke="#E8EAED" stroke-width="12"/><circle cx="90" cy="90" r="${r}" fill="none" stroke="${color}" stroke-width="12" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${off}" style="transition:stroke-dashoffset 1s cubic-bezier(.2,0,0,1)"/></svg>`;
}

export const tone = (p) => p >= 80 ? 'ok' : p >= 65 ? 'mid' : 'low';
export const toneColor = (p) => p >= 80 ? '#34A853' : p >= 65 ? '#FBBC04' : '#EA4335';

export function bars(rows, { target } = {}) {
  return `<div class="bars">${rows.map(r => `<div class="bar ${tone(r.pct)}"><div class="lbl">${esc(r.label)}${r.sub ? `<small>${esc(r.sub)}</small>` : ''}</div><div class="track"><span style="width:${r.total ? r.pct : 0}%"></span>${target ? `<i class="tgt" style="left:${target}%"></i>` : ''}</div><div class="val">${r.total ? `${r.correct}/${r.total} · ${r.pct}%` : '—'}</div></div>`).join('')}</div>`;
}

// Line chart for score history.
export function sparkline(points, { w = 640, h = 160, min = 0, max = 100 } = {}) {
  if (!points.length) return '';
  const pad = 28, iw = w - pad * 2, ih = h - pad * 1.5;
  const x = (i) => pad + (points.length === 1 ? iw / 2 : i * iw / (points.length - 1));
  const y = (v) => pad / 2 + ih - (v - min) / (max - min) * ih;
  const d = points.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p.v).toFixed(1)}`).join(' ');
  const grid = [50, 70, 80, 100].map(g => `<line x1="${pad}" x2="${w - pad}" y1="${y(g)}" y2="${y(g)}" stroke="${g === 80 ? '#34A853' : '#E8EAED'}" stroke-dasharray="${g === 80 ? '4 4' : '0'}"/><text x="${pad - 6}" y="${y(g) + 4}" font-size="11" text-anchor="end" fill="#80868B" font-family="Google Sans Code">${g}</text>`).join('');
  const dots = points.map((p, i) => `<circle cx="${x(i)}" cy="${y(p.v)}" r="4.5" fill="${toneColor(p.v)}" stroke="#fff" stroke-width="2"><title>${esc(p.label)}: ${p.v}%</title></circle>`).join('');
  return `<svg class="spark" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">${grid}<path d="${d}" fill="none" stroke="#4471ED" stroke-width="2.5" stroke-linejoin="round"/>${dots}</svg>`;
}

export function letter(i) { return String.fromCharCode(65 + i); }
