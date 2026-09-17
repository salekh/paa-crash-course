// Router + page views.
import { DOMAINS, CASES, AREA_MODULES, EXAM, getBank, getStudyIndex, getMeta, loadText, q, store, save, resetStore, filterBank, sampleExam, analyze, shuffle, pct, fmtTime, fmtClock, fmtDate, isBookmarked, toggleBookmark } from './core.js';
import { html, esc, ICON, toast, ring, bars, sparkline, tone, toneColor, letter, $, $$ } from './ui.js';
import { render as md } from './md.js';
import { startSession, hasSession, abandonSession, renderSession, explain, caseHtml } from './quiz.js';

const app = $('#app');
const routes = [];
const route = (re, fn) => routes.push({ re, fn });
const nav = (h) => { location.hash = h; };

function setActiveNav(hash) {
  $$('.nav a').forEach(a => { const h = a.getAttribute('href'); a.classList.toggle('active', h === '#/' ? hash === '#/' || hash === '' : hash.startsWith(h)); });
  $('.nav').classList.remove('open');
}

async function router() {
  const hash = location.hash || '#/';
  setActiveNav(hash);
  for (const r of routes) {
    const m = hash.match(r.re);
    if (m) { try { await r.fn(...m.slice(1)); } catch (e) { console.error(e); app.innerHTML = `<div class="wrap section"><div class="empty"><h3>Something went wrong</h3><p>${esc(e.message)}</p></div></div>`; } return; }
  }
  app.innerHTML = `<div class="wrap section"><div class="empty"><h3>Page not found</h3><a class="btn primary" href="#/">Go home</a></div></div>`;
}
window.addEventListener('hashchange', router);
window.addEventListener('DOMContentLoaded', () => { $('.menu-btn').addEventListener('click', () => $('.nav').classList.toggle('open')); router(); });

const page = (inner) => { app.innerHTML = `<div class="fade-in">${inner}</div>`; window.scrollTo({ top: 0 }); };
const domainBadge = (d) => `<span class="badge d${d}">Domain ${d}</span>`;

// ------------------------------------------------------------------ HOME
route(/^#\/$/, async () => {
  const [meta, study] = await Promise.all([getMeta(), getStudyIndex()]);
  const st = store();
  const done = Object.values(st.study).filter(x => x.done).length;
  const last = st.attempts.filter(a => a.mode === 'exam').slice(-1)[0];
  const lastA = last ? analyze(last) : null;
  const csCount = Object.entries(meta.byCaseStudy || {}).filter(([k]) => k !== 'none').reduce((a, [_, v]) => a + v, 0);
  page(html`
  <section class="hero">
    <img class="motif" src="assets/brand/logo_motif_crop.png" alt="">
    <div class="wrap">
      <img class="lockup" src="assets/brand/gcloud_lockup_white.png" alt="Google Cloud">
      <span class="eyebrow">Professional Agentic Architect · Crash course</span>
      <h1>Design Autonomous AI. Build It. Prove It.</h1>
      <p class="lead">A complete, exam-aligned crash course for the Google Cloud Professional Agentic Architect certification: nine deep study modules covering all 28 in-scope tools (ADK, Antigravity, MCP, A2A, Agent Runtime, RAG Engine, Model Armor), six enterprise agentic case studies, and a ${meta.questionCount.toLocaleString()}-question bank with GA & Beta timed exam simulators.</p>
      <div class="row">
        <a class="btn on-dark lg" href="#/study">Start studying</a>
        <a class="btn on-dark outline lg" href="#/exam">Take a mock exam</a>
        <a class="btn on-dark outline lg" href="#/cases">Enterprise Case Studies (6)</a>
      </div>
      <div class="facts"><span><b>60 (GA) / 80 (Beta)</b> questions</span><span><b>2–3 hours</b></span><span><b>5</b> domains</span><span><b>28</b> in-scope tools</span><span><b>6</b> case studies</span><span>Valid <b>2 years</b></span></div>
    </div>
  </section>

  <section class="section tight"><div class="wrap">
    <div class="stats">
      <div class="stat"><div class="n tnum">${meta.questionCount.toLocaleString()}</div><div class="l">Exam-style questions across ${meta.areaCount} agentic topic areas & 28 in-scope tools</div></div>
      <div class="stat"><div class="n tnum">${meta.studyModules}</div><div class="l">Study modules · ${Math.round(meta.studyWords / 1000)}k words mapped to official PAA Exam Guide</div></div>
      <div class="stat"><div class="n tnum">${csCount}</div><div class="l">Scenario questions across 6 Enterprise Agentic Case Studies</div></div>
      <div class="stat"><div class="n tnum">${st.attempts.length}</div><div class="l">${st.attempts.length === 1 ? 'Session' : 'Sessions'} completed on this device · ${done}/${study.length} modules read</div></div>
    </div>
  </div></section>

  ${lastA ? html`<section class="section tight"><div class="wrap"><div class="card" style="display:grid;grid-template-columns:auto 1fr auto;gap:28px;align-items:center">
    <div class="ring" style="width:96px;height:96px">${ring(lastA.score, toneColor(lastA.score)).replace(/width="180" height="180"/, 'width="96" height="96"')}<div class="v"><b style="font-size:24px">${lastA.score}%</b></div></div>
    <div><span class="eyebrow" style="margin-bottom:4px">Last mock exam · ${fmtDate(last.endedAt)}</span><h3 style="margin:0 0 4px">${lastA.correct}/${lastA.total} correct · ${lastA.weak.length ? `weakest: ${esc(lastA.weak[0].label)}` : 'no weak areas detected'}</h3><p class="muted small" style="margin:0">Time used ${fmtClock(lastA.totalTime)} · ${lastA.flagged.length} flagged · ${lastA.wrong.length} to review</p></div>
    <a class="btn tonal" href="#/results/${last.id}">Open analysis</a>
  </div></div></section>` : ''}

  <section class="section"><div class="wrap">
    <span class="eyebrow">How to use this course</span>
    <h2 style="max-width:20ch">Three loops: learn, drill, simulate.</h2>
    <div class="grid c3" style="margin-top:36px">
      <a class="card link" href="#/study"><div class="medallion">${ICON.book}</div><h3>Study modules</h3><p class="muted">Dense architecture notes per exam section: ADK patterns, MCP/A2A protocols, Antigravity sandboxes, Model Armor guardrails, and evaluation pipelines.</p><div class="meta"><span>${study.length} modules</span><span>~${Math.round(study.reduce((a, b) => a + b.minutes, 0) / 60)} h reading</span></div></a>
      <a class="card link" href="#/practice"><div class="medallion">${ICON.quiz}</div><h3>Practice by topic</h3><p class="muted">Filter by domain, agentic tool area, difficulty, or enterprise case study. Tutor mode explains every answer immediately; quiz mode defers feedback.</p><div class="meta"><span>${meta.questionCount.toLocaleString()} questions</span><span>${meta.areaCount} areas</span></div></a>
      <a class="card link" href="#/exam"><div class="medallion">${ICON.timer}</div><h3>Exam simulator</h3><p class="muted">Simulate either the 60-question (120m GA) or 80-question (180m Beta) exam with split-screen case studies and full diagnostic analysis.</p><div class="meta"><span>GA & Beta Modes</span><span>Detailed analysis</span></div></a>
    </div>
  </div></section>

  <section class="band"><div class="wrap"><h2>What the exam covers</h2><p>Five official domains, weighted exactly as in the Google Cloud Professional Agentic Architect Exam Guide.</p></div></section>

  <section class="section"><div class="wrap">
    <div class="grid c2" style="gap:56px;align-items:start">
      <div><span class="eyebrow">Exam blueprint</span><h2>Five domains, weighted like the real thing.</h2><p class="muted">The simulator samples questions in these proportions and includes enterprise scenario questions from two randomly chosen case studies. Click any domain to practice it directly.</p>
        <p class="muted small">Source: Google Cloud Professional Agentic Architect Exam Guide (2026). Custom agent development in ADK, RAG/MCP integration, and multi-agent orchestration account for 33% of the exam.</p></div>
      <ol class="agenda">${[1, 2, 3, 4, 5].map(d => `<li><span class="num">0${d}</span><div><a href="#/practice?domain=${d}"><div class="t">${esc(DOMAINS[d].title)}</div></a><div class="d">${meta.byDomain[d] || 0} questions in the bank</div></div><div class="w"><b>${Math.round(DOMAINS[d].weight * 1000) / 10}%</b>weight</div></li>`).join('')}</ol>
    </div>
  </div></section>

  <section class="section" style="padding-top:0"><div class="wrap">
    <span class="eyebrow">Enterprise Agentic Case Studies</span>
    <h2>Master the six reference architectures.</h2>
    <p class="muted" style="max-width:70ch">Complex multi-agent scenarios test how you combine ADK, CX Agent Studio, Antigravity, MCP, A2A, RAG Engine, Agent Identity, and Model Armor under real enterprise constraints.</p>
    <div class="grid c3" style="margin-top:28px">${Object.entries(CASES).map(([k, c]) => `<a class="card link dark" href="#/cases/${k}"><div class="medallion">${ICON.case}</div><h3>${esc(c.name)}</h3><p class="muted small">${esc(c.blurb)}</p><div class="meta"><span style="color:#BABBBC">${meta.byCaseStudy[k] || 0} questions</span></div></a>`).join('')}</div>
  </div></section>`);
});

// ------------------------------------------------------------------ STUDY
route(/^#\/study$/, async () => {
  const [study, meta] = await Promise.all([getStudyIndex(), getMeta()]);
  const st = store().study;
  const doneN = study.filter(m => st[m.id] && st[m.id].done).length;
  page(html`<div class="wrap">
    <div class="module-head"><span class="eyebrow">Study material</span><h1>Study modules</h1><p class="muted" style="max-width:70ch;font-size:17px">Read in order for a full crash course (~${Math.round(study.reduce((a, b) => a + b.minutes, 0) / 60)} hours), or jump to the section a mock exam flagged as weak. Each module ends with key takeaways and a self-check.</p>
      <div class="row" style="margin-top:16px"><div class="progress-bar g" style="width:240px"><span style="width:${pct(doneN, study.length)}%"></span></div><span class="small muted">${doneN}/${study.length} modules completed</span></div></div>
    <div class="grid c2" style="margin-bottom:72px">${study.map((m, i) => { const s = st[m.id]; return `<a class="card link" href="#/study/${m.id}">
      <div class="row between"><span class="badge ${m.domain ? 'd' + m.domain : ''}">${m.domain ? 'Domain ' + m.domain : 'Foundations'}</span>${s && s.done ? `<span class="done-check">${ICON.check} Completed</span>` : ''}</div>
      <h3 style="margin-top:14px"><span class="muted" style="font-weight:400">${String(i + 1).padStart(2, '0')}&nbsp;</span>${esc(m.title)}</h3><p class="muted small" style="margin:0">${esc(m.summary)}</p>
      <div class="meta"><span>${m.minutes} min read</span><span>${m.outline.filter(o => o.level === 2).length} sections</span><span>${(m.words / 1000).toFixed(1)}k words</span></div></a>`; }).join('')}</div>
  </div>`);
});

route(/^#\/study\/([\w-]+)(?:#(.*))?$/, async (id) => {
  const study = await getStudyIndex();
  const i = study.findIndex(m => m.id === id); if (i < 0) throw new Error('Unknown module ' + id);
  const m = study[i];
  const src = await loadText('data/study/' + m.file);
  const { html: body, headings } = md(src, { withHeadings: true });
  const st = store().study[m.id] || {};
  const prev = study[i - 1], next = study[i + 1];
  const practiceLink = m.domain ? `#/practice?domain=${m.domain}` : '#/practice';
  page(html`<div class="wrap">
    <div class="module-head">
      <span class="badge ${m.domain ? 'd' + m.domain : ''}">${m.domain ? 'Domain ' + m.domain + ' · ' + Math.round(DOMAINS[m.domain].weight * 1000) / 10 + '% of exam' : 'Foundations'}</span>
      <h1 style="margin-top:14px">${esc(m.title)}</h1><p class="muted" style="font-size:17px;max-width:70ch">${esc(m.summary)}</p>
      <div class="row"><span class="small muted">${m.minutes} min read · ${m.words.toLocaleString()} words</span><span class="spacer" style="flex:1"></span><a class="btn tonal sm" href="${practiceLink}">${ICON.quiz} Practice this ${m.domain ? 'domain' : 'material'}</a><button class="btn ${st.done ? 'secondary' : 'primary'} sm" id="markDone">${st.done ? 'Mark as unread' : 'Mark as completed'}</button></div></div>
    <div class="reader">
      <article class="article" id="article">${body}
        <div class="module-nav">${prev ? `<a href="#/study/${prev.id}"><div class="lbl">Previous</div><div class="t">${esc(prev.title)}</div></a>` : '<span></span>'}${next ? `<a class="next" href="#/study/${next.id}"><div class="lbl">Next</div><div class="t">${esc(next.title)}</div></a>` : ''}</div>
      </article>
      <nav class="toc"><h4>On this page</h4>${headings.filter(h => h.level <= 3).map(h => `<a href="#/study/${m.id}#${h.id}" data-id="${h.id}" class="l${h.level}">${esc(h.text)}</a>`).join('')}</nav>
    </div></div>`);
  $('#markDone').addEventListener('click', () => { const s = store().study[m.id] || {}; s.done = !s.done; s.at = Date.now(); store().study[m.id] = s; save(); toast(s.done ? 'Module marked as completed' : 'Marked as unread'); router(); });
  // TOC: intercept clicks to scroll without changing route
  $$('.toc a').forEach(a => a.addEventListener('click', (e) => { e.preventDefault(); const el = document.getElementById(a.dataset.id); el && el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }));
  const hs = $$('#article h2, #article h3');
  const io = new IntersectionObserver((entries) => { for (const en of entries) if (en.isIntersecting) { $$('.toc a').forEach(a => a.classList.toggle('active', a.dataset.id === en.target.id)); } }, { rootMargin: '-72px 0px -70% 0px' });
  hs.forEach(h => io.observe(h));
  const frag = location.hash.split('#')[2]; if (frag) setTimeout(() => { const el = document.getElementById(frag); el && el.scrollIntoView(); }, 50);
});

// ------------------------------------------------------------------ CASE STUDIES
let caseViewMode = 'reader'; // 'reader' | 'split'
route(/^#\/cases(?:\/(\w+))?$/, async (key) => {
  const meta = await getMeta();
  key = key && CASES[key] ? key : 'finserve';
  const c = CASES[key];
  const txt = await loadText('data/cases/' + c.file);
  const study = await getStudyIndex(); const csMod = study.find(m => m.id === 'case-studies');
  const qCount = meta.byCaseStudy[key] || 0;
  const pdfUrl = 'https://services.google.com/fh/files/misc/professional_agentic_architect_exam_guide_english.pdf';

  const archHtml = c.arch && c.arch.length ? html`
    <div class="cs-arch-section" id="sec-architecture">
      <div class="cs-sec-head"><span class="cs-sec-kicker">07 · Exam Blueprint & Decoder</span><h3>Recommended Google Cloud Architecture & Exam Traps</h3></div>
      <p class="muted small" style="margin-bottom:18px">Each requirement in the ${esc(c.name)} case study maps to specific Google Cloud services and architectural patterns tested on the exam.</p>
      <div class="cs-arch-grid">
        ${c.arch.map((item, idx) => html`
          <div class="cs-arch-card">
            <div class="cs-arch-req"><span class="cs-arch-num">R${idx + 1}</span><h4>${esc(item.req)}</h4></div>
            <div class="cs-arch-services">${item.services.map(s => `<span class="cs-svc-chip">${esc(s)}</span>`).join('')}</div>
            <p class="cs-arch-rat"><strong>Architecture Rationale:</strong> ${esc(item.rationale)}</p>
            <div class="cs-arch-trap"><strong>Exam Trap to Avoid:</strong> ${esc(item.trap)}</div>
          </div>
        `).join('')}
      </div>
    </div>` : '';

  const tocSections = [
    { id: 'sec-company-overview', num: '01', title: 'Company Overview' },
    { id: 'sec-solution-concept', num: '02', title: 'Solution Concept' },
    { id: 'sec-existing-env', num: '03', title: 'Existing Environment' },
    { id: 'sec-business-reqs', num: '04', title: 'Business Requirements' },
    { id: 'sec-tech-reqs', num: '05', title: 'Technical Requirements' },
    { id: 'sec-exec-statement', num: '06', title: 'Executive Statement' },
    ...(c.arch && c.arch.length ? [{ id: 'sec-architecture', num: '07', title: 'Architecture & Exam Traps' }] : [])
  ];

  const paintCase = () => {
    page(html`<div class="wrap" style="max-width:1360px">
      <div class="module-head" style="margin-bottom:28px;padding-bottom:24px">
        <span class="eyebrow">Official & Sample Case Studies</span>
        <h1>Case Studies & Architecture Blueprints</h1>
        <p class="muted" style="max-width:78ch;font-size:16.5px">Master the verbatim case study scenarios and their Google Cloud reference architectures. In the live exam, your assigned case studies appear in a split pane beside each question. Use <b>Split-Screen Exam View</b> below to study the verbatim text side-by-side with the requirement-to-service decoder.</p>
      </div>

      <div class="cs-selector-grid">
        ${Object.entries(CASES).map(([k, x]) => {
          const cnt = meta.byCaseStudy[k] || 0;
          return html`<button class="cs-sel-card ${k === key ? 'active' : ''}" data-case="${k}">
            <div class="cs-sel-top">
              <span class="badge ${x.legacy ? '' : 'official'}">${x.legacy ? 'Legacy / Sample' : 'Exam v6.1'}</span>
              <span class="cs-sel-qcount tnum">${cnt} Qs</span>
            </div>
            <div class="cs-sel-title">${esc(x.name.replace(' (Legacy)', ''))}</div>
            <div class="cs-sel-ind">${esc(x.industry || '')}</div>
          </button>`;
        }).join('')}
      </div>

      <div class="cs-hero-card">
        <div class="cs-hero-main">
          <div class="row" style="gap:8px;margin-bottom:10px">
            <span class="badge ${c.legacy ? '' : 'official'}">${c.legacy ? 'Legacy Sample Case Study' : 'Active Exam Guide v6.1'}</span>
            ${c.industry ? `<span class="badge d1">${esc(c.industry)}</span>` : ''}
            ${c.sla ? `<span class="badge easy">${esc(c.sla)}</span>` : ''}
          </div>
          <h2>${esc(c.name)}</h2>
          <p class="muted" style="font-size:15.5px;max-width:72ch;margin-bottom:14px">${esc(c.blurb)}</p>
          ${c.driver ? `<div class="cs-driver-pill"><strong>Primary Transformation Driver:</strong> ${esc(c.driver)}</div>` : ''}
        </div>
        <div class="cs-hero-actions">
          <div class="seg cs-view-toggle">
            <button class="${caseViewMode === 'reader' ? 'on' : ''}" data-view="reader">Reader + Blueprint</button>
            <button class="${caseViewMode === 'split' ? 'on' : ''}" data-view="split">Split-Screen Exam View</button>
          </div>
          <div class="row" style="gap:10px;margin-top:12px;justify-content:flex-end">
            <a class="btn primary" href="#/practice?case=${key}">${ICON.quiz} Practice ${qCount} Questions</a>
            ${csMod ? `<a class="btn secondary sm" href="#/study/case-studies">Full Study Guide</a>` : ''}
            ${pdfUrl ? `<a class="btn ghost sm" href="${pdfUrl}" target="_blank" rel="noopener">Official PDF ↗</a>` : ''}
          </div>
        </div>
      </div>

      ${caseViewMode === 'split' ? html`
        <div class="cs-split-layout">
          <div class="cs-split-pane verbatim-pane">
            <div class="cs-pane-header"><span>Verbatim Exam Reference Text</span><span class="badge">Exam Split-Pane Simulation</span></div>
            <article class="article cs-article" id="csArticle">${caseHtml(txt)}</article>
          </div>
          <div class="cs-split-pane blueprint-pane">
            <div class="cs-pane-header"><span>Interactive GCP Architecture Decoder & Exam Traps</span><span class="badge official">${c.arch ? c.arch.length : 0} Core Mappings</span></div>
            <div class="cs-pane-body">${archHtml}</div>
          </div>
        </div>
      ` : html`
        <div class="reader cs-reader-layout">
          <article class="article cs-article" id="csArticle">
            <div class="cs-verbatim-box">
              <div class="cs-verbatim-banner"><span>Verbatim Case Study Text</span><span class="muted small">Formatted from official exam guide documentation</span></div>
              ${caseHtml(txt)}
            </div>
            ${archHtml}
          </article>
          <aside class="toc cs-toc">
            <div class="card flat stack" style="padding:18px;margin-bottom:20px;background:#fff">
              <h4 style="margin:0;font-size:14px;text-transform:none;letter-spacing:0">Quick Actions</h4>
              <a class="btn primary sm" href="#/practice?case=${key}" style="width:100%">Practice ${qCount} questions</a>
              <button class="btn tonal sm" id="toggleSplitBtn" style="width:100%">Switch to Split-Screen View</button>
              ${pdfUrl ? `<a class="btn ghost sm" href="${pdfUrl}" target="_blank" rel="noopener" style="width:100%">Download Official PDF ↗</a>` : ''}
            </div>
            <h4>On this page</h4>
            ${tocSections.map(s => `<a href="#/cases/${key}#${s.id}" data-csid="${s.id}"><span class="mono small muted" style="margin-right:6px">${s.num}</span>${esc(s.title)}</a>`).join('')}
          </aside>
        </div>
      `}
    </div>`);

    $$('[data-case]').forEach(b => b.addEventListener('click', () => nav('#/cases/' + b.dataset.case)));
    $$('[data-view]').forEach(b => b.addEventListener('click', () => { caseViewMode = b.dataset.view; paintCase(); }));
    const splitBtn = $('#toggleSplitBtn'); splitBtn && splitBtn.addEventListener('click', () => { caseViewMode = 'split'; paintCase(); });

    $$('[data-csid]').forEach(a => a.addEventListener('click', (e) => {
      e.preventDefault();
      const el = document.getElementById(a.dataset.csid);
      el && el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }));

    const targets = $$('#csArticle .cs-sec-head, #sec-architecture');
    if (targets.length && caseViewMode === 'reader') {
      const io = new IntersectionObserver((entries) => {
        for (const en of entries) {
          if (en.isIntersecting) {
            const id = en.target.id || (en.target.closest('[id]') && en.target.closest('[id]').id);
            if (id) $$('[data-csid]').forEach(a => a.classList.toggle('active', a.dataset.csid === id));
          }
        }
      }, { rootMargin: '-80px 0px -65% 0px' });
      targets.forEach(t => io.observe(t));
    }
  };

  paintCase();
});

// ------------------------------------------------------------------ PRACTICE (config)
function parseQuery(hash) { const i = hash.indexOf('?'); return new URLSearchParams(i >= 0 ? hash.slice(i + 1) : ''); }

route(/^#\/practice(\?.*)?$/, async () => {
  const bank = await getBank();
  const qs = parseQuery(location.hash);
  const resume = hasSession('practice');
  const areas = [...new Set(bank.map(x => x.area))].sort();
  const cfg = { domains: qs.get('domain') ? [+qs.get('domain')] : [], areas: qs.get('area') ? [qs.get('area')] : [], difficulty: 'all', caseStudy: qs.get('case') || 'all', type: 'all', source: qs.get('source') || 'all', count: 20, tutor: true };
  const st = store();
  const paint = () => {
    const pool = filterBank(bank, cfg);
    const offN = filterBank(bank, { source: 'official' }).length, wrongN = filterBank(bank, { source: 'wrong' }).length, unseenN = filterBank(bank, { source: 'unseen' }).length, bmN = st.bookmarks.length;
    page(html`<div class="wrap" style="max-width:980px">
      <div class="module-head"><span class="eyebrow">Practice</span><h1>Build a practice set</h1><p class="muted" style="font-size:17px;max-width:70ch">Filter the ${bank.length.toLocaleString()}-question bank (including ${offN} official sample questions). Tutor mode reveals the explanation after each answer; quiz mode holds feedback until the end and produces the same diagnostic report as the exam simulator.</p></div>
      ${resume ? `<div class="card" style="margin-bottom:24px;display:flex;gap:16px;align-items:center;flex-wrap:wrap"><div style="flex:1"><b>You have an unfinished practice session</b><div class="muted small">${resume.qids.length} questions · started ${fmtDate(resume.startedAt)}</div></div><a class="btn primary" href="#/practice/run">Resume</a><button class="btn ghost" id="abandon">Discard</button></div>` : ''}
      <div class="card">
        <div class="field-group"><label class="field">Mode</label><div class="seg"><button class="${cfg.tutor ? 'on' : ''}" data-set="tutor" data-v="1">Tutor · instant feedback</button><button class="${!cfg.tutor ? 'on' : ''}" data-set="tutor" data-v="0">Quiz · feedback at the end</button></div></div>
        <div class="field-group"><label class="field">Domains</label><div class="chips">${[1, 2, 3, 4, 5].map(d => `<label class="chip ${cfg.domains.includes(d) ? 'on' : ''}"><input type="checkbox" data-dom="${d}" ${cfg.domains.includes(d) ? 'checked' : ''}>0${d} ${esc(DOMAINS[d].short)}</label>`).join('')}<label class="chip ${!cfg.domains.length ? 'on' : ''}"><input type="checkbox" data-dom="0" ${!cfg.domains.length ? 'checked' : ''}>All domains</label></div></div>
        <div class="grid c2">
          <div class="field-group"><label class="field">Topic area</label><select id="area"><option value="">All areas</option>${areas.map(a => `<option ${cfg.areas[0] === a ? 'selected' : ''}>${esc(a)}</option>`).join('')}</select></div>
          <div class="field-group"><label class="field">Case study</label><select id="case"><option value="all" ${cfg.caseStudy === 'all' ? 'selected' : ''}>Any (mixed)</option><option value="none" ${cfg.caseStudy === 'none' ? 'selected' : ''}>No case study</option><option value="any" ${cfg.caseStudy === 'any' ? 'selected' : ''}>Case-study questions only</option>${Object.entries(CASES).map(([k, c]) => `<option value="${k}" ${cfg.caseStudy === k ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select></div>
          <div class="field-group"><label class="field">Difficulty</label><select id="diff">${['all', 'easy', 'medium', 'hard'].map(d => `<option value="${d}" ${cfg.difficulty === d ? 'selected' : ''}>${d === 'all' ? 'All difficulties' : d[0].toUpperCase() + d.slice(1)}</option>`).join('')}</select></div>
          <div class="field-group"><label class="field">Question type</label><select id="type"><option value="all">Single and multiple answer</option><option value="single" ${cfg.type === 'single' ? 'selected' : ''}>Single answer only</option><option value="multi" ${cfg.type === 'multi' ? 'selected' : ''}>Multiple answer only</option></select></div>
          <div class="field-group"><label class="field">Source</label><select id="source"><option value="all">Whole bank (${bank.length.toLocaleString()})</option><option value="official" ${cfg.source === 'official' ? 'selected' : ''}>Official sample questions (${offN})</option><option value="unseen" ${cfg.source === 'unseen' ? 'selected' : ''}>Never seen (${unseenN})</option><option value="wrong" ${cfg.source === 'wrong' ? 'selected' : ''}>Answered wrong last time (${wrongN})</option><option value="bookmarked" ${cfg.source === 'bookmarked' ? 'selected' : ''}>Bookmarked (${bmN})</option></select></div>
          <div class="field-group"><label class="field">Number of questions</label><select id="count">${[10, 20, 30, 50, 75, 100].map(n => `<option ${cfg.count === n ? 'selected' : ''}>${n}</option>`).join('')}<option value="0" ${cfg.count === 0 ? 'selected' : ''}>All matching</option></select></div>
        </div>
        <div class="row between" style="border-top:1px solid var(--rule);padding-top:20px"><span class="muted"><b class="tnum">${pool.length.toLocaleString()}</b> questions match</span><button class="btn primary lg" id="start" ${pool.length ? '' : 'disabled'}>${ICON.play} Start practice</button></div>
      </div>
      <p class="kbd-hint" style="margin-top:16px">Tip: select <b>Official sample questions (${offN})</b> under Source to drill the community/official sample exam questions specifically.</p>
    </div>`);
    $$('[data-set="tutor"]').forEach(b => b.addEventListener('click', () => { cfg.tutor = b.dataset.v === '1'; paint(); }));
    $$('[data-dom]').forEach(c => c.addEventListener('change', () => { const d = +c.dataset.dom; if (!d) cfg.domains = []; else { cfg.domains.includes(d) ? cfg.domains.splice(cfg.domains.indexOf(d), 1) : cfg.domains.push(d); } paint(); }));
    $('#area').addEventListener('change', e => { cfg.areas = e.target.value ? [e.target.value] : []; paint(); });
    $('#case').addEventListener('change', e => { cfg.caseStudy = e.target.value; paint(); });
    $('#diff').addEventListener('change', e => { cfg.difficulty = e.target.value; paint(); });
    $('#type').addEventListener('change', e => { cfg.type = e.target.value; paint(); });
    $('#source').addEventListener('change', e => { cfg.source = e.target.value; paint(); });
    $('#count').addEventListener('change', e => { cfg.count = +e.target.value; paint(); });
    const ab = $('#abandon'); ab && ab.addEventListener('click', () => { abandonSession(); paint(); });
    $('#start').addEventListener('click', () => {
      const chosen = shuffle(pool).slice(0, cfg.count || pool.length);
      startSession({ mode: 'practice', questions: chosen, tutor: cfg.tutor, config: { ...cfg } });
    });
  };
  paint();
});
route(/^#\/practice\/run$/, async () => { await getBank(); app.innerHTML = ''; renderSession(app, 'practice'); });

// ------------------------------------------------------------------ EXAM (config)
route(/^#\/exam$/, async () => {
  const bank = await getBank(); const st = store();
  const resume = hasSession('exam');
  const exams = st.attempts.filter(a => a.mode === 'exam');
  page(html`<div class="wrap" style="max-width:980px">
    <div class="module-head"><span class="eyebrow">Exam simulator</span><h1>Full-length mock exam</h1><p class="muted" style="font-size:17px;max-width:72ch">Reproduces the live exam format: ${EXAM.questions} questions in ${EXAM.minutes} minutes, ${EXAM.caseStudies} randomly selected case studies (${EXAM.perCase} questions each, opened in a side pane), and domain weights from the exam guide. No feedback until you submit. Unanswered questions count as wrong.</p></div>
    ${resume ? `<div class="card" style="margin-bottom:24px;display:flex;gap:16px;align-items:center;flex-wrap:wrap"><div style="flex:1"><b>Exam in progress</b><div class="muted small">Started ${fmtDate(resume.startedAt)} · the clock keeps running while you are away</div></div><a class="btn primary" href="#/exam/run">Resume exam</a><button class="btn ghost" id="abandon">Discard</button></div>` : ''}
    <div class="grid c2" style="align-items:start">
      <div class="card">
        <h3>Before you start</h3>
        <ul class="muted" style="padding-left:20px;line-height:1.8;font-size:15px"><li>Block two uninterrupted hours (or 3 hours for Beta mode); the timer does not pause.</li><li>Read the last sentence of each stem first — it tells you what is being optimized (cost, latency, least operational overhead, compliance).</li><li>Flag and move on after ~2 minutes; you get a navigator to return.</li><li>Multiple-answer questions state how many to select; partial credit is not given.</li><li>Google does not publish the passing score. Aim for consistent ≥ 80% here before booking.</li></ul>
        <div class="row" style="margin-top:20px"><button class="btn primary lg" id="startExam">${ICON.timer} Start ${EXAM.minutes}-minute exam</button></div>
        <details style="margin-top:20px"><summary class="small muted" style="cursor:pointer">Custom simulation options (GA 60Q vs Beta 80Q)</summary>
          <div class="grid c2" style="margin-top:14px"><div><label class="field">Questions</label><select id="exN"><option>30</option><option>50</option><option selected>60</option><option>80</option></select></div><div><label class="field">Minutes</label><select id="exM"><option>60</option><option selected>120</option><option>180</option><option value="0">Untimed</option></select></div></div>
          <p class="muted small" style="margin:12px 0 0">Question count scales the domain quotas proportionally (33% Domain 3, 22% Domain 4, 17% Domain 2, 15% Domain 5, 13% Domain 1); case-study questions are always included.</p></details>
      </div>
      <div class="card flat" style="background:var(--canvas)">
        <h3>Your exam history</h3>
        ${exams.length ? `<table class="data"><thead><tr><th>Date</th><th class="r">Score</th><th class="r">Time</th><th></th></tr></thead><tbody>${exams.slice().reverse().slice(0, 8).map(a => { const an = analyze(a); return `<tr><td>${fmtDate(a.endedAt)}</td><td class="r" style="color:${toneColor(an.score)};font-weight:700">${an.score}%</td><td class="r">${fmtClock(an.totalTime)}</td><td class="r"><a href="#/results/${a.id}">Report</a></td></tr>`; }).join('')}</tbody></table>` : `<p class="muted small">No mock exams yet. Your first score is a baseline — take one before studying to find out where you stand.</p><p class="small" style="margin-top:12px"><a href="#/results/demo">Preview sample diagnostic report →</a></p>`}
      </div>
    </div></div>`);
  const ab = $('#abandon'); ab && ab.addEventListener('click', () => { if (confirm('Discard the in-progress exam? It will not be scored.')) { abandonSession(); router(); } });
  $('#startExam').addEventListener('click', () => {
    const n = +$('#exN').value, m = +$('#exM').value;
    const { questions, cases } = sampleExam(bank, n);
    startSession({ mode: 'exam', questions, tutor: false, minutes: m || null, cases, config: { n, m } });
  });
});
route(/^#\/exam\/run$/, async () => { await getBank(); app.innerHTML = ''; renderSession(app, 'exam'); });

function demoAttempt(bank) {
  const qs = bank.slice(0, 60);
  const items = qs.map((x, i) => {
    const correct = (i % 4 !== 0);
    const chosen = correct ? x.answer.slice() : [(x.answer[0] + 1) % x.options.length];
    return { id: x.id, chosen, correct, time: 75 + ((i * 23) % 95), flagged: i % 9 === 0, changes: i % 11 === 0 ? 1 : 0 };
  });
  return { id: 'demo', mode: 'exam', tutor: false, startedAt: Date.now() - 5400000, endedAt: Date.now(), duration: 7200, cases: ['finserve', 'cymbal'], items };
}

// ------------------------------------------------------------------ RESULTS
route(/^#\/results\/(\w+)$/, async (id) => {
  const bank = await getBank(); const study = await getStudyIndex();
  let a = store().attempts.find(x => x.id === id);
  if (!a && id === 'demo') a = demoAttempt(bank);
  if (!a) throw new Error('Attempt not found');
  const r = analyze(a);
  const modTitle = (mid) => { const m = study.find(x => x.id === mid); return m ? m.title.replace(/^Section \d+: /, '') : mid; };
  const verdictText = { ready: 'On track — keep drilling weak areas', border: 'Borderline — targeted revision needed', notyet: 'Not yet — significant gaps' }[r.verdict];
  const verdictDetail = r.verdict === 'ready' ? 'Consistent scores at or above 80% on unseen questions are a reasonable readiness signal for the real exam.' : r.verdict === 'border' ? 'Scores in the 70s usually mean a few domains are dragging the total. Work the plan below and retake with fresh questions.' : 'Below 70%, the fastest path is reading the recommended modules for the weakest areas below before drilling more questions.';
  let filter = 'wrong';
  const reviewList = () => { const items = filter === 'all' ? r.items : filter === 'wrong' ? r.wrong : filter === 'flagged' ? r.flagged : r.items.filter(i => !i.chosen.length); return items.length ? items.map(it => reviewItem(it)).join('') : `<div class="empty"><h3>Nothing here</h3><p>No questions in this filter.</p></div>`; };
  const reviewItem = (it) => { const qq = it.q; const idx = r.items.indexOf(it) + 1; const cls = !it.chosen.length ? 'skip' : it.correct ? 'ok' : 'bad'; return `<details class="review-item ${cls}"><summary><span class="st">${it.correct ? ICON.check : ICON.close}</span><span class="q"><b>Q${idx}.</b> ${esc(qq.question)}</span><span class="m">${fmtTime(it.time)}${it.flagged ? ' · flagged' : ''}</span></summary><div class="body"><div class="tags" style="margin:14px 0 10px;display:flex;gap:8px;flex-wrap:wrap"><span class="badge d${qq.domain}">Domain ${qq.domain}</span><span class="badge ${qq.difficulty}">${qq.difficulty}</span>${qq.officialSample ? '<span class="badge official">Official sample</span>' : ''}<span class="badge">${esc(qq.area)}</span>${qq.caseStudy ? `<span class="badge cs">${esc(CASES[qq.caseStudy].name)}</span>` : ''}</div><ul class="opts">${qq.options.map((o, i) => { const sel = it.chosen.includes(i), corr = qq.answer.includes(i); const c = corr && sel ? 'correct' : sel ? 'wrong' : corr ? 'missed' : ''; return `<li><div class="opt ${c}" style="cursor:default"><span class="k">${letter(i)}</span><span>${esc(o)}</span></div></li>`; }).join('')}</ul>${explain(qq, it.chosen)}<div class="row" style="margin-top:12px"><button class="btn ghost sm" data-bm="${qq.id}">${isBookmarked(qq.id) ? ICON.bookmark : ICON.bookmarkOutline} ${isBookmarked(qq.id) ? 'Bookmarked' : 'Bookmark'}</button><a class="btn ghost sm" href="#/practice?area=${encodeURIComponent(qq.area)}">Practice “${esc(qq.area)}”</a></div></div></details>`; };

  page(html`<div class="wrap" style="max-width:1040px">
    <div class="module-head" style="border:0;margin-bottom:8px"><span class="eyebrow">${a.mode === 'exam' ? 'Mock exam report' : 'Practice report'} · ${fmtDate(a.endedAt)}</span><h1>Performance analysis</h1></div>
    <div class="card score-hero">
      <div class="ring">${ring(r.score, toneColor(r.score))}<div class="v"><b class="tnum">${r.score}%</b><span>${r.correct} of ${r.total}</span></div></div>
      <div><span class="verdict ${r.verdict}">${verdictText}</span><p style="margin:14px 0 18px;font-size:16px">${verdictDetail}</p>
        <div class="kpis"><div class="kpi"><div class="n tnum">${r.weighted}%</div><div class="l">Blueprint-weighted score</div></div><div class="kpi"><div class="n tnum">${fmtClock(r.totalTime)}</div><div class="l">Time used${a.duration ? ` of ${fmtClock(a.duration)}` : ''}</div></div><div class="kpi"><div class="n tnum">${fmtTime(r.avgTime)}</div><div class="l">Avg per question</div></div><div class="kpi"><div class="n tnum">${r.total - r.answered}</div><div class="l">Unanswered</div></div><div class="kpi"><div class="n tnum">${r.flagged.length}</div><div class="l">Flagged</div></div></div></div>
    </div>

    ${r.weak.length ? html`<div class="card" style="margin-top:24px"><span class="eyebrow">Recommended next steps</span><h2 style="font-size:26px">Your study plan</h2><p class="muted">Weak areas ranked by number of questions missed. Each links to the module section that covers it and a practice set restricted to that area.</p>
      ${r.weak.map((w, i) => `<div class="plan-item"><span class="n">0${i + 1}</span><div><div class="t">${esc(w.label)}</div><div class="d">${w.correct}/${w.total} correct (${w.pct}%) · read: ${(AREA_MODULES[w.label] || []).map(mid => `<a href="#/study/${mid}">${esc(modTitle(mid))}</a>`).join(', ') || 'see cheat sheets'}</div></div><div class="acts"><a class="btn tonal sm" href="#/practice?area=${encodeURIComponent(w.label)}">Practice area</a>${(AREA_MODULES[w.label] || [])[0] ? `<a class="btn secondary sm" href="#/study/${AREA_MODULES[w.label][0]}">Study</a>` : ''}</div></div>`).join('')}
      ${r.strong.length ? `<p class="small muted" style="margin:18px 0 0"><b>Strengths:</b> ${r.strong.map(s => esc(s.label) + ` (${s.pct}%)`).join(' · ')}</p>` : ''}
    </div>` : `<div class="card" style="margin-top:24px"><h3>No weak areas detected</h3><p class="muted">Every area with 2+ questions scored ≥ 70%. Take a longer set with the <b>Never seen</b> source to test more ground.</p></div>`}

    <div class="grid c2" style="margin-top:24px;align-items:start">
      <div class="card"><h3>By exam domain</h3><p class="muted small">Bar = your accuracy · tick = 80% target. Domain weight shown under the label.</p>${bars(r.byDomain.map(d => ({ ...d, label: `0${d.key} ${d.label}`, sub: `${Math.round(d.weight * 1000) / 10}% of exam` })), { target: 80 })}</div>
      <div class="card"><h3>By difficulty and type</h3><p class="muted small">Real exams skew medium/hard; misses on easy questions usually mean rushing.</p>${bars([...r.byDifficulty.map(d => ({ ...d, label: d.label[0].toUpperCase() + d.label.slice(1) })), ...r.byType.map(t => ({ ...t, label: t.label === 'multi' ? 'Multiple answer' : 'Single answer' }))], { target: 80 })}
        ${r.byCase.length ? `<h4 style="margin-top:24px">Case studies</h4>${bars(r.byCase, { target: 80 })}` : ''}</div>
    </div>

    <div class="grid c2" style="margin-top:24px;align-items:start">
      <div class="card"><h3>All topic areas</h3><table class="data"><thead><tr><th>Area</th><th class="r">Score</th><th class="r">Avg time</th></tr></thead><tbody>${r.byArea.map(x => `<tr><td><a href="#/practice?area=${encodeURIComponent(x.key)}">${esc(x.label)}</a></td><td class="r" style="color:${toneColor(x.pct)};font-weight:700">${x.correct}/${x.total}</td><td class="r">${fmtTime(x.avgTime)}</td></tr>`).join('')}</tbody></table></div>
      <div class="card"><h3>Time management</h3>
        <p class="muted small">Budget is ${fmtTime(a.duration ? a.duration / r.total : 120)} per question for a 60-question, 120-minute exam. ${r.avgTime > 140 ? 'You are running slow — practice eliminating two options quickly.' : r.avgTime < 60 ? 'You are very fast; re-read stems for qualifiers like “most cost-effective” or “least operational overhead”.' : 'Your pace is within budget.'}</p>
        <table class="data"><thead><tr><th>Slowest questions</th><th class="r">Time</th><th class="r">Result</th></tr></thead><tbody>${r.slowest.map(it => `<tr><td>Q${r.items.indexOf(it) + 1} · <span class="muted">${esc(it.q.area)}</span></td><td class="r">${fmtTime(it.time)}</td><td class="r" style="color:${it.correct ? '#188038' : '#C5221F'}">${it.correct ? 'Correct' : 'Wrong'}</td></tr>`).join('')}</tbody></table>
        <p class="muted small" style="margin:16px 0 0">Answers changed on ${r.changed} question${r.changed === 1 ? '' : 's'}. Flagged questions: ${r.flagged.length} (${r.flagged.filter(f => f.correct).length} correct).</p></div>
    </div>

    <div class="card" style="margin-top:24px"><h3>Question review</h3>
      <div class="filter-tabs" id="tabs"><button data-f="wrong" class="on">Incorrect (${r.wrong.length})</button><button data-f="flagged">Flagged (${r.flagged.length})</button><button data-f="skipped">Unanswered (${r.total - r.answered})</button><button data-f="all">All (${r.total})</button></div>
      <div id="review">${reviewList()}</div></div>

    <div class="row" style="margin:32px 0 72px"><a class="btn primary" href="${a.mode === 'exam' ? '#/exam' : '#/practice'}">${a.mode === 'exam' ? 'Take another mock exam' : 'New practice set'}</a>${r.wrong.length ? `<button class="btn secondary" id="retryWrong">Retry the ${r.wrong.length} you missed</button>` : ''}<a class="btn ghost" href="#/progress">View progress</a></div>
  </div>`);
  $('#tabs').addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; filter = b.dataset.f; $$('#tabs button').forEach(x => x.classList.toggle('on', x === b)); $('#review').innerHTML = reviewList(); });
  app.addEventListener('click', (e) => { const b = e.target.closest('[data-bm]'); if (!b) return; const on = toggleBookmark(b.dataset.bm); b.innerHTML = `${on ? ICON.bookmark : ICON.bookmarkOutline} ${on ? 'Bookmarked' : 'Bookmark'}`; });
  const rw = $('#retryWrong'); rw && rw.addEventListener('click', () => startSession({ mode: 'practice', questions: shuffle(r.wrong.map(w => w.q)), tutor: true, config: { retryOf: a.id } }));
});

// ------------------------------------------------------------------ PROGRESS
route(/^#\/progress$/, async () => {
  const bank = await getBank(); const study = await getStudyIndex(); const st = store();
  const qs = st.qstats; const seen = Object.keys(qs).length;
  const totalAns = Object.values(qs).reduce((a, b) => a + b.seen, 0), totalCorrect = Object.values(qs).reduce((a, b) => a + b.correct, 0);
  const exams = st.attempts.filter(a => a.mode === 'exam');
  const points = exams.map(a => ({ v: analyze(a).score, label: fmtDate(a.endedAt) }));
  // mastery per area from all-time stats
  const areaStats = {};
  for (const qq of bank) { const s = qs[qq.id]; const x = areaStats[qq.area] || (areaStats[qq.area] = { label: qq.area, total: 0, seen: 0, correct: 0, attempts: 0 }); x.total++; if (s) { x.seen++; x.correct += s.correct; x.attempts += s.seen; } }
  const areas = Object.values(areaStats).map(x => ({ ...x, pct: pct(x.correct, x.attempts), coverage: pct(x.seen, x.total) })).sort((a, b) => (a.attempts ? a.pct : 101) - (b.attempts ? b.pct : 101));
  const domStats = [1, 2, 3, 4, 5].map(d => { let c = 0, n = 0, s = 0, t = 0; for (const qq of bank) if (qq.domain === d) { t++; const x = qs[qq.id]; if (x) { s++; c += x.correct; n += x.seen; } } return { key: d, label: `0${d} ${DOMAINS[d].short}`, sub: `${s}/${t} questions seen`, correct: c, total: n, pct: pct(c, n) }; });
  const doneMods = study.filter(m => st.study[m.id] && st.study[m.id].done);
  page(html`<div class="wrap" style="max-width:1040px">
    <div class="module-head"><span class="eyebrow">Progress</span><h1>Your progress</h1><p class="muted" style="font-size:17px">Everything is stored locally in this browser. Export before switching devices.</p></div>
    ${seen ? html`
    <div class="kpis" style="margin-bottom:24px"><div class="kpi" style="background:#fff"><div class="n tnum">${pct(seen, bank.length)}%</div><div class="l">Bank coverage · ${seen.toLocaleString()} of ${bank.length.toLocaleString()} seen</div></div><div class="kpi" style="background:#fff"><div class="n tnum">${pct(totalCorrect, totalAns)}%</div><div class="l">All-time accuracy · ${totalAns.toLocaleString()} answers</div></div><div class="kpi" style="background:#fff"><div class="n tnum">${exams.length}</div><div class="l">Mock exams${exams.length ? ` · best ${Math.max(...points.map(p => p.v))}%` : ''}</div></div><div class="kpi" style="background:#fff"><div class="n tnum">${doneMods.length}/${study.length}</div><div class="l">Modules completed</div></div><div class="kpi" style="background:#fff"><div class="n tnum">${filterBank(bank, { source: 'wrong' }).length}</div><div class="l">Currently marked wrong</div></div></div>
    <div class="grid c2" style="align-items:start">
      <div class="card"><h3>Mock exam trend</h3>${points.length ? sparkline(points) + '<p class="muted small" style="margin:8px 0 0">Dashed line = 80% target.</p>' : '<p class="muted small">Take a mock exam to start the trend line.</p>'}
        ${st.attempts.length ? `<h4 style="margin-top:20px">Recent sessions</h4><table class="data"><tbody>${st.attempts.slice().reverse().slice(0, 8).map(a => { const an = analyze(a); return `<tr><td>${a.mode === 'exam' ? 'Exam' : a.tutor ? 'Tutor' : 'Quiz'} · ${a.items.length} Qs</td><td class="muted small">${fmtDate(a.endedAt)}</td><td class="r" style="color:${toneColor(an.score)};font-weight:700">${an.score}%</td><td class="r"><a href="#/results/${a.id}">Report</a></td></tr>`; }).join('')}</tbody></table>` : ''}</div>
      <div class="card"><h3>All-time accuracy by domain</h3>${bars(domStats, { target: 80 })}
        <div class="row" style="margin-top:24px"><a class="btn tonal sm" href="#/practice?source=wrong">Drill wrong answers</a><a class="btn secondary sm" href="#/practice?source=bookmarked">Bookmarked (${st.bookmarks.length})</a></div></div>
    </div>
    <div class="card" style="margin-top:24px"><h3>Topic-area mastery</h3><p class="muted small">Sorted weakest first. Coverage = share of the bank's questions in that area you have attempted.</p>
      <table class="data"><thead><tr><th>Area</th><th class="r">Accuracy</th><th class="r">Coverage</th><th></th></tr></thead><tbody>${areas.map(x => `<tr><td>${esc(x.label)}</td><td class="r" style="color:${x.attempts ? toneColor(x.pct) : '#80868B'};font-weight:700">${x.attempts ? x.pct + '%' : '—'}</td><td class="r"><div class="progress-bar" style="width:90px;display:inline-block;vertical-align:middle;margin-right:8px"><span style="width:${x.coverage}%"></span></div>${x.coverage}%</td><td class="r"><a href="#/practice?area=${encodeURIComponent(x.label)}">Practice</a></td></tr>`).join('')}</tbody></table></div>
    ` : `<div class="empty"><h3>No activity yet</h3><p>Answer some questions or take a mock exam and your progress will appear here.</p><div class="row" style="justify-content:center;margin-top:12px"><a class="btn primary" href="#/practice">Start practicing</a><a class="btn secondary" href="#/exam">Take a mock exam</a></div></div>`}
    <div class="row" style="margin:32px 0 72px"><button class="btn secondary sm" id="export">Export progress (JSON)</button><label class="btn secondary sm" style="cursor:pointer">Import<input type="file" id="import" accept="application/json" hidden></label><span style="flex:1"></span><button class="btn danger sm" id="reset">Reset all progress</button></div>
  </div>`);
  $('#export').addEventListener('click', () => { const blob = new Blob([JSON.stringify(store())], { type: 'application/json' }); const u = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = u; a.download = `paa-progress-${new Date().toISOString().slice(0, 10)}.json`; a.click(); URL.revokeObjectURL(u); });
  $('#import').addEventListener('change', async (e) => { const f = e.target.files[0]; if (!f) return; try { const data = JSON.parse(await f.text()); Object.assign(store(), data); save(); toast('Progress imported'); router(); } catch { toast('Invalid file'); } });
  $('#reset').addEventListener('click', () => { if (confirm('Delete all attempts, statistics, bookmarks and module progress on this device?')) { resetStore(); toast('Progress reset'); router(); } });
});

// ------------------------------------------------------------------ QUESTION BANK BROWSER
route(/^#\/bank(\?.*)?$/, async () => {
  const bank = await getBank();
  const qs = parseQuery(location.hash);
  const f = { search: qs.get('q') || '', domains: [], caseStudy: 'all', difficulty: 'all', source: qs.get('source') || 'all' };
  let pageN = 0; const PER = 25;
  const offN = filterBank(bank, { source: 'official' }).length;
  const paint = () => {
    const list = filterBank(bank, f);
    const slice = list.slice(pageN * PER, pageN * PER + PER);
    page(html`<div class="wrap" style="max-width:980px">
      <div class="module-head"><span class="eyebrow">Question bank</span><h1>Browse all ${bank.length.toLocaleString()} questions</h1><p class="muted" style="font-size:17px">Search stems and options by keyword — useful for looking up how a service is tested. Includes ${offN} official sample questions.</p></div>
      <div class="card flat" style="margin-bottom:20px"><div class="grid c4"><div style="grid-column:span 4"><input type="search" id="q" placeholder="Search e.g. “Agent Development Kit”, “Principal Access Boundary”, “Model Armor”, “A2A”…" value="${esc(f.search)}"></div>
        <select id="src"><option value="all" ${f.source === 'all' ? 'selected' : ''}>All sources (${bank.length.toLocaleString()})</option><option value="official" ${f.source === 'official' ? 'selected' : ''}>Official sample questions (${offN})</option></select>
        <select id="d"><option value="">All domains</option>${[1, 2, 3, 4, 5].map(d => `<option value="${d}" ${f.domains[0] === d ? 'selected' : ''}>0${d} ${esc(DOMAINS[d].short)}</option>`).join('')}</select>
        <select id="c"><option value="all">Any case study</option><option value="none" ${f.caseStudy === 'none' ? 'selected' : ''}>None</option>${Object.entries(CASES).map(([k, c]) => `<option value="${k}" ${f.caseStudy === k ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select>
        <select id="df"><option value="all">Any difficulty</option>${['easy', 'medium', 'hard'].map(d => `<option value="${d}" ${f.difficulty === d ? 'selected' : ''}>${d}</option>`).join('')}</select></div></div>
      <p class="muted small"><b class="tnum">${list.length.toLocaleString()}</b> questions · page ${pageN + 1} of ${Math.max(1, Math.ceil(list.length / PER))}</p>
      ${slice.map(qq => `<div class="bank-item"><div class="row"><span class="badge d${qq.domain}">Domain ${qq.domain}</span><span class="badge ${qq.difficulty}">${qq.difficulty}</span>${qq.officialSample ? '<span class="badge official">Official sample</span>' : ''}${qq.type === 'multi' ? '<span class="badge multi">multi</span>' : ''}${qq.caseStudy ? `<span class="badge cs">${esc(CASES[qq.caseStudy].name)}</span>` : ''}<span class="muted small" style="margin-left:auto">${esc(qq.area)} · <span class="mono">${qq.id}</span></span></div><div class="q">${esc(qq.question)}</div><details><summary class="small" style="cursor:pointer;color:var(--accent-ink)">Show answer</summary><div class="a" style="margin-top:10px"><b>${qq.answer.map(i => letter(i) + '. ' + esc(qq.options[i])).join('<br>')}</b><p style="margin:8px 0 0">${esc(qq.explanation)}</p></div></details></div>`).join('')}
      <div class="row between" style="margin:24px 0 72px"><button class="btn secondary sm" id="prev" ${pageN === 0 ? 'disabled' : ''}>Previous</button><button class="btn secondary sm" id="next" ${(pageN + 1) * PER >= list.length ? 'disabled' : ''}>Next</button></div>
    </div>`);
    const inp = $('#q'); let t; inp.addEventListener('input', () => { clearTimeout(t); t = setTimeout(() => { f.search = inp.value; pageN = 0; const pos = inp.selectionStart; paint(); const n = $('#q'); n.focus(); n.setSelectionRange(pos, pos); }, 250); });
    $('#src').addEventListener('change', e => { f.source = e.target.value; pageN = 0; paint(); });
    $('#d').addEventListener('change', e => { f.domains = e.target.value ? [+e.target.value] : []; pageN = 0; paint(); });
    $('#c').addEventListener('change', e => { f.caseStudy = e.target.value; pageN = 0; paint(); });
    $('#df').addEventListener('change', e => { f.difficulty = e.target.value; pageN = 0; paint(); });
    $('#prev').addEventListener('click', () => { pageN--; paint(); });
    $('#next').addEventListener('click', () => { pageN++; paint(); });
  };
  paint();
});
