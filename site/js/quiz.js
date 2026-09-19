// Quiz session runner shared by Practice (tutor / quiz mode) and the Exam simulator.
import { q, store, save, recordAnswer, isCorrect, toggleBookmark, isBookmarked, fmtClock, uid, DOMAINS, CASES, loadText, EXAM } from './core.js?v=20260919c';
import { html, esc, ICON, toast, letter, $, $$ } from './ui.js?v=20260919c';

let tick = null;
let keyHandler = null;
let sessionAbort = null;

export function startSession({ mode, questions, tutor = false, minutes = null, config = {}, cases = [] }) {
  stopTimer();
  const s = {
    id: uid(), mode, tutor, startedAt: Date.now(), duration: minutes ? minutes * 60 : null, config, cases,
    qids: questions.map(x => x.id), idx: 0, answers: {}, currentStart: Date.now(),
  };
  store().session = s; save();
  location.hash = mode === 'exam' ? '#/exam/run' : '#/practice/run';
}

export function hasSession(mode) { const s = store().session; return s && s.mode === mode ? s : null; }
export function abandonSession() { store().session = null; save(); stopTimer(); }

export function stopTimer() {
  if (tick) { clearInterval(tick); tick = null; }
  if (keyHandler) { document.removeEventListener('keydown', keyHandler); keyHandler = null; }
  if (sessionAbort) { sessionAbort.abort(); sessionAbort = null; }
}

function ans(s, qid) { return s.answers[qid] || (s.answers[qid] = { chosen: [], flagged: false, time: 0, revealed: false, changes: 0 }); }

function isAnswered(s, id) {
  const x = s.answers[id], qx = q(id);
  return !!(x && qx && x.chosen.length >= (qx.type === 'multi' ? qx.answer.length : 1));
}

function commitTime(s) {
  const curId = s.qids[s.idx];
  if (!curId) return;
  const a = ans(s, curId);
  a.time += (Date.now() - s.currentStart) / 1000; s.currentStart = Date.now();
}

function remaining(s) { return s.duration ? s.duration - (Date.now() - s.startedAt) / 1000 : null; }

export function renderSession(root, mode) {
  stopTimer();
  const s = hasSession(mode);
  if (!s) { location.hash = mode === 'exam' ? '#/exam' : '#/practice'; return; }

  // Self-heal any stale or out-of-bounds session state in localStorage
  s.qids = (s.qids || []).filter(id => q(id));
  if (!s.qids.length) { abandonSession(); location.hash = mode === 'exam' ? '#/exam' : '#/practice'; return; }
  s.idx = Math.max(0, Math.min(s.idx || 0, s.qids.length - 1));

  sessionAbort = new AbortController();
  s.currentStart = Date.now();

  const paint = ({ scroll = false } = {}) => {
    s.idx = Math.max(0, Math.min(s.idx || 0, s.qids.length - 1));
    commitTime(s);
    save();
    root.innerHTML = view(s);
    if (scroll) window.scrollTo({ top: 0 });
  };

  paint({ scroll: true });

  const openDrawer = (id) => { const d = $('#' + id, root); d && d.classList.add('open'); const sc = $('.scrim', root); sc && sc.classList.add('open'); };
  const closeDrawers = () => { $$('.drawer', root).forEach(d => d.classList.remove('open')); const sc = $('.scrim', root); sc && sc.classList.remove('open'); };

  // Attach exactly ONE delegated click listener per session render (cleaned up via sessionAbort)
  root.addEventListener('click', async (e) => {
    const qq = q(s.qids[s.idx]);
    if (!qq) return;
    const a = ans(s, qq.id);

    const optBtn = e.target.closest('.opt');
    if (optBtn && !optBtn.disabled) {
      choose(s, qq, +optBtn.dataset.opt);
      paint({ scroll: false });
      return;
    }

    const t = e.target.closest('[data-act],[data-goto]');
    if (!t) return;
    if (t.dataset.goto != null) {
      s.idx = Math.max(0, Math.min(+t.dataset.goto, s.qids.length - 1));
      paint({ scroll: true });
      return;
    }

    switch (t.dataset.act) {
      case 'flag':
        a.flagged = !a.flagged;
        paint({ scroll: false });
        break;
      case 'bookmark':
        toast(toggleBookmark(qq.id) ? 'Bookmarked' : 'Bookmark removed');
        paint({ scroll: false });
        break;
      case 'nav':
        openDrawer('navDrawer');
        break;
      case 'case':
        openDrawer('caseDrawer');
        {
          const body = $('#caseBody', root);
          const txt = await loadText('data/cases/' + CASES[qq.caseStudy].file);
          if (body) body.innerHTML = caseHtml(txt);
        }
        break;
      case 'closeDrawer':
        closeDrawers();
        break;
      case 'prev':
        if (s.idx > 0) { s.idx--; paint({ scroll: true }); }
        break;
      case 'finish':
        confirmFinish(s);
        break;
      case 'primary':
        if (t.dataset.do === 'check') {
          const req = qq.type === 'multi' ? qq.answer.length : 1;
          if (a.chosen.length < req) return;
          a.revealed = true;
          recordAnswer(qq.id, isCorrect(qq, a.chosen));
          paint({ scroll: false });
        } else if (t.dataset.do === 'next') {
          if (s.idx < s.qids.length - 1) { s.idx++; paint({ scroll: true }); }
        } else {
          confirmFinish(s);
        }
        break;
    }
  }, { signal: sessionAbort.signal });

  if (s.duration) {
    tick = setInterval(() => {
      const r = remaining(s); const el = $('.timer', root); if (!el) return;
      el.textContent = fmtClock(r); el.classList.toggle('warn', r < 15 * 60); el.classList.toggle('crit', r < 5 * 60);
      if (r <= 0) { toast('Time is up — submitting your exam.'); finish(s); }
    }, 1000);
  }

  keyHandler = (e) => {
    if (e.target.matches('input,textarea,select')) return;
    const qq = q(s.qids[s.idx]);
    if (!qq) return;
    const a = ans(s, qq.id);
    if (/^[1-6]$/.test(e.key)) {
      const i = +e.key - 1;
      if (i < qq.options.length && !a.revealed) { choose(s, qq, i); paint({ scroll: false }); }
    } else if (e.key === 'ArrowRight' || (e.key === 'Enter' && !e.shiftKey)) {
      e.preventDefault();
      const btn = $('[data-act="primary"]', root);
      if (btn && !btn.disabled) btn.click();
    } else if (e.key === 'ArrowLeft') {
      if (s.idx > 0) { s.idx--; paint({ scroll: true }); }
    } else if (e.key.toLowerCase() === 'f') {
      a.flagged = !a.flagged;
      paint({ scroll: false });
    }
  };
  document.addEventListener('keydown', keyHandler);
}

function choose(s, qq, i) {
  const a = ans(s, qq.id);
  if (qq.type === 'multi') {
    const k = a.chosen.indexOf(i);
    if (k >= 0) {
      a.chosen.splice(k, 1);
    } else if (a.chosen.length < qq.answer.length) {
      a.chosen.push(i);
    } else {
      // Smoothly replace the oldest selected option so switching choices never blocks
      a.chosen.shift();
      a.chosen.push(i);
      a.changes++;
    }
  } else {
    if (a.chosen.length && a.chosen[0] !== i) a.changes++;
    a.chosen = [i];
  }
}

function view(s) {
  const qq = q(s.qids[s.idx]); const a = ans(s, qq.id); const n = s.qids.length;
  const answered = s.qids.filter(id => isAnswered(s, id)).length;
  const isLast = s.idx === n - 1;
  const showFeedback = s.tutor && a.revealed;
  const req = qq.type === 'multi' ? qq.answer.length : 1;
  const ready = a.chosen.length >= req;
  const checkLabel = ready
    ? 'Check answer'
    : qq.type === 'multi'
      ? (a.chosen.length === 0 ? `Select ${req} options` : `Select ${req - a.chosen.length} more (${a.chosen.length}/${req})`)
      : 'Check answer';
  const cs = qq.caseStudy ? CASES[qq.caseStudy] : null;
  const examTitle = s.mode === 'exam' ? 'Exam simulation' : s.tutor ? 'Practice · tutor mode' : 'Practice · quiz mode';
  return html`
  <div class="quiz-bar"><div class="wrap">
    <span class="pos">${examTitle} · Question ${s.idx + 1} <span class="muted">of ${n}</span></span>
    <span class="grow"></span>
    ${s.duration ? `<span class="timer tnum">${fmtClock(remaining(s))}</span>` : `<span class="muted small tnum">${answered}/${n} answered</span>`}
    <button class="icon-btn ${a.flagged ? 'active' : ''}" data-act="flag" title="Flag for review (F)">${a.flagged ? ICON.flag : ICON.flagOutline}</button>
    <button class="icon-btn ${isBookmarked(qq.id) ? 'active' : ''}" data-act="bookmark" title="Bookmark question">${isBookmarked(qq.id) ? ICON.bookmark : ICON.bookmarkOutline}</button>
    <button class="icon-btn" data-act="nav" title="Question navigator">${ICON.grid}</button>
    <button class="btn secondary sm" data-act="finish">${s.mode === 'exam' ? 'Submit exam' : 'End session'}</button>
    <div class="progress-bar" style="flex-basis:100%"><span style="width:${(answered / n) * 100}%"></span></div>
  </div></div>
  <div class="wrap quiz-shell fade-in">
    ${cs ? `<div class="case-strip">${ICON.case}<span>This question refers to the <b>${cs.name}</b> case study.</span><button class="btn on-dark sm" data-act="case">Open case study</button></div>` : ''}
    <div class="qcard">
      <div class="tags">
        <span class="badge d${qq.domain}">Domain ${qq.domain} · ${esc(DOMAINS[qq.domain].short)}</span>
        <span class="badge ${qq.difficulty}">${qq.difficulty}</span>
        ${qq.officialSample ? '<span class="badge official">Official sample</span>' : ''}
        ${qq.type === 'multi' ? `<span class="badge multi">Choose ${req} answers</span>` : ''}
        <span class="muted small" style="margin-left:auto">${esc(qq.topic)}</span>
      </div>
      <div class="stem">${esc(qq.question)}</div>
      ${qq.type === 'multi' ? `<div class="hint">Select ${req} options — ${a.chosen.length} of ${req} selected.</div>` : ''}
      <ul class="opts">${qq.options.map((o, i) => {
        let cls = qq.type === 'multi' ? 'multi' : '';
        const sel = a.chosen.includes(i), corr = qq.answer.includes(i);
        if (showFeedback) { if (corr && sel) cls += ' correct'; else if (sel && !corr) cls += ' wrong'; else if (corr) cls += ' missed'; }
        else if (sel) cls += ' sel';
        return `<li><button class="opt ${cls}" data-opt="${i}" ${showFeedback ? 'disabled' : ''}><span class="k">${letter(i)}</span><span>${esc(o)}</span></button></li>`;
      })}</ul>
      ${showFeedback ? explain(qq, a.chosen) : ''}
      <div class="qactions">
        <button class="btn secondary" data-act="prev" ${s.idx === 0 ? 'disabled' : ''}>${ICON.arrowLeft} Previous</button>
        <span class="kbd-hint">Keys: <kbd>1</kbd>–<kbd>${qq.options.length}</kbd> select · <kbd>Enter</kbd> ${s.tutor && !a.revealed ? 'check' : 'next'} · <kbd>F</kbd> flag</span>
        <span class="spacer"></span>
        ${s.tutor && !a.revealed
          ? `<button class="btn primary" data-act="primary" data-do="check" ${ready ? '' : 'disabled'}>${checkLabel}</button>`
          : isLast ? `<button class="btn primary" data-act="primary" data-do="finish">${s.mode === 'exam' ? 'Submit exam' : 'Finish & analyze'}</button>`
            : `<button class="btn primary" data-act="primary" data-do="next">Next ${ICON.arrowRight}</button>`}
      </div>
    </div>
  </div>
  <div class="scrim" data-act="closeDrawer"></div>
  <aside class="drawer" id="navDrawer"><header><h3>Question navigator</h3><button class="icon-btn" data-act="closeDrawer">${ICON.close}</button></header>
    <div class="body">
      <div class="navgrid">${s.qids.map((id, i) => { const x = s.answers[id]; const qx = q(id); let c = i === s.idx ? 'current ' : ''; if (x && x.flagged) c += 'flag '; if (s.tutor && x && x.revealed) c += isCorrect(qx, x.chosen) ? 'right' : 'wrongq'; else if (isAnswered(s, id)) c += 'answered'; return `<button data-goto="${i}" class="${c}">${i + 1}</button>`; })}</div>
      <div class="legend"><span><i style="background:#E8F0FE"></i>Answered</span><span><i style="background:#fff"></i>Unanswered</span><span><i style="background:#FBBC04;border-radius:50%"></i>Flagged</span>${s.tutor ? '<span><i style="background:#E6F4EA"></i>Correct</span><span><i style="background:#FCE8E6"></i>Incorrect</span>' : ''}</div>
      <p class="muted small" style="margin-top:20px">${answered} of ${n} answered · ${s.qids.filter(id => s.answers[id] && s.answers[id].flagged).length} flagged</p>
      ${s.mode === 'exam' ? `<p class="muted small">Case studies in this exam: ${s.cases.map(c => CASES[c].name).join(', ')}.</p>` : ''}
    </div></aside>
  <aside class="drawer" id="caseDrawer"><header><h3>${cs ? esc(cs.name) : 'Case study'}</h3><button class="icon-btn" data-act="closeDrawer">${ICON.close}</button></header><div class="body" id="caseBody"><p class="muted">Loading…</p></div></aside>`;
}

export function explain(qq, chosen) {
  const ok = isCorrect(qq, chosen);
  const wrongIndices = qq.options.map((_, i) => i).filter(i => !qq.answer.includes(i));
  const ww = qq.whyWrong || {};
  const hasWW = wrongIndices.some(i => ww[String(i)] || ww[i]);
  const hintText = qq.hint || '';
  return `<div class="explain ${ok ? 'ok' : 'bad'}">
    <h4>${ok ? `<span style="color:#188038">${ICON.check.replace('<svg', '<svg fill="#188038"')}</span> Correct` : `<span style="color:#C5221F">${ICON.close.replace('<svg', '<svg fill="#C5221F"')}</span> Not quite`} — correct answer: ${qq.answer.map(letter).join(', ')}</h4>
    ${hintText ? `<div class="explain-hint"><span class="explain-hint-label">💡 Architectural Hint & Core Takeaway</span><div class="explain-hint-body">${esc(hintText)}</div></div>` : ''}
    <div class="explain-section-title">Why ${qq.answer.map(letter).join(', ')} is correct</div>
    <p>${esc(qq.explanation)}</p>
    ${hasWW ? `<div class="explain-ww">
      <div class="explain-section-title">Why the other options are wrong</div>
      <ul class="explain-ww-list">
        ${wrongIndices.map(i => {
          const reason = ww[String(i)] || ww[i];
          if (!reason) return '';
          const userPicked = chosen && chosen.includes(i);
          return `<li class="explain-ww-item ${userPicked ? 'user-picked' : ''}">
            <span class="explain-ww-opt"><b>Option ${letter(i)}</b>${userPicked ? ' <span class="badge wrong-pick">Your choice</span>' : ''}</span>
            <span class="explain-ww-text">${esc(reason)}</span>
          </li>`;
        }).join('')}
      </ul>
    </div>` : ''}
    ${qq.refs && qq.refs.length ? `<div class="refs">References: ${qq.refs.map(r => {
      const isYT = /youtube\.com|youtu\.be/.test(r);
      const label = isYT ? '▶ Video Walkthrough (' + (r.match(/[?&]v=([^&]+)/)?.[1] || 'YouTube') + ')' : r.replace(/^https?:\/\/(cloud\.google\.com\/|docs\.cloud\.google\.com\/)?/, '').split('?')[0].slice(0, 58);
      return `<a href="${esc(r)}" target="_blank" rel="noopener">${esc(label)}</a>`;
    }).join('')}</div>` : ''}
  </div>`;
}

function confirmFinish(s) {
  const un = s.qids.filter(id => !isAnswered(s, id)).length;
  const msg = s.mode === 'exam'
    ? `Submit the exam now?${un ? ` ${un} question${un > 1 ? 's are' : ' is'} unanswered and will count as incorrect.` : ''}`
    : `End this practice session and see your analysis?${un ? ` ${un} unanswered.` : ''}`;
  if (confirm(msg)) finish(s);
}

export function finish(s) {
  stopTimer(); commitTime(s);
  const items = s.qids.map(id => { const qq = q(id); const a = ans(s, id); const correct = isCorrect(qq, a.chosen); if (!(s.tutor && a.revealed)) recordAnswer(id, correct); return { id, chosen: a.chosen, correct, time: Math.round(a.time), flagged: a.flagged, changes: a.changes }; });
  const attempt = { id: s.id, mode: s.mode, tutor: s.tutor, startedAt: s.startedAt, endedAt: Date.now(), config: s.config, cases: s.cases, items, duration: s.duration };
  store().attempts.push(attempt); store().session = null; save();
  location.hash = '#/results/' + attempt.id;
}

export function caseHtml(txt) {
  const clean = txt.replace(/[\u200b\ufeff\r]/g, '');
  const rawLines = clean.split('\n');
  const headMap = {
    'company overview': { id: 'sec-company-overview', num: '01', tag: 'Context', title: 'Company Overview' },
    'solution concept': { id: 'sec-solution-concept', num: '02', tag: 'Vision', title: 'Solution Concept' },
    'existing technical environment': { id: 'sec-existing-env', num: '03', tag: 'Current State', title: 'Existing Technical Environment' },
    'business requirements': { id: 'sec-business-reqs', num: '04', tag: 'Business Goals', title: 'Business Requirements' },
    'technical requirements': { id: 'sec-tech-reqs', num: '05', tag: 'Technical Constraints', title: 'Technical Requirements' },
    'executive statement': { id: 'sec-exec-statement', num: '06', tag: 'Leadership Perspective', title: 'Executive Statement' }
  };

  let out = '';
  let inExec = false;
  let mode = null; // 'p' | 'ul'
  let pBuf = [];
  let ulItems = [];
  let curLi = [];
  let afterBlank = false;

  const formatInline = (str) => {
    let s = esc(str);
    s = s.replace(/\[([^\]]+)\]/g, '<span class="cs-inline-badge">$1</span>');
    s = s.replace(/^([A-Z][A-Za-z0-9\s\-\/()]{2,45}:)(\s)/, '<strong>$1</strong>$2');
    return s;
  };

  const flushLi = () => {
    if (curLi.length) {
      ulItems.push(formatInline(curLi.join(' ').replace(/\s+/g, ' ').trim()));
      curLi = [];
    }
  };

  const flush = () => {
    flushLi();
    if (ulItems.length) {
      out += `<ul class="case-list">${ulItems.map(item => `<li>${item}</li>`).join('')}</ul>`;
      ulItems = [];
    }
    if (pBuf.length) {
      const text = pBuf.join(' ').replace(/\s+/g, ' ').trim();
      if (text) {
        if (inExec && /^[A-Z][a-z]+ [A-Z][a-z]+,\s+.+/.test(text) && text.length < 70) {
          out += `<footer class="exec-cite">— ${esc(text)}</footer>`;
        } else {
          out += `<p>${formatInline(text)}</p>`;
        }
      }
      pBuf = [];
    }
    mode = null;
  };

  for (let raw of rawLines) {
    raw = raw.replace(/\f/g, '').trim();
    if (!raw) {
      if (mode === 'p') flush();
      else if (mode === 'ul') flushLi();
      afterBlank = true;
      continue;
    }
    if (/^PROFESSIONAL (CLOUD|AGENTIC) ARCHITECT/i.test(raw)) continue;
    if (/^(FinServe Global|Cymbal OmniRetail|Apex BioHealth|DevVelocity Cloud|AeroLogistics Fleet|MediaPulse Network|EHR Healthcare|Cymbal Retail|Altostrat Media|KnightMotives Automotive|Mountkirk Games|Helicopter Racing League \(HRL\)) Case Study(\s+\d+)?$/i.test(raw)) continue;

    const lower = raw.toLowerCase();
    if (headMap[lower]) {
      flush();
      if (inExec) { out += '</blockquote>'; inExec = false; }
      const h = headMap[lower];
      out += `<div class="cs-sec-head" id="${h.id}"><span class="cs-sec-kicker">${h.num} · ${h.tag}</span><h3>${h.title}</h3></div>`;
      if (lower === 'executive statement') {
        inExec = true;
        out += `<blockquote class="exec-quote">`;
      }
      afterBlank = false;
      continue;
    }

    const bulletMatch = raw.match(/^[●•\-]\s*(.+)$/);
    if (bulletMatch) {
      if (mode === 'p') flush();
      flushLi();
      mode = 'ul';
      curLi.push(bulletMatch[1]);
      afterBlank = false;
      continue;
    }

    if (mode === 'ul') {
      if (afterBlank) {
        flush();
        mode = 'p';
        pBuf.push(raw);
      } else {
        curLi.push(raw);
      }
    } else {
      mode = 'p';
      pBuf.push(raw);
    }
    afterBlank = false;
  }
  flush();
  if (inExec) out += '</blockquote>';
  return out;
}
