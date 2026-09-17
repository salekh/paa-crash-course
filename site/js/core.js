// Shared constants, data loading, persistent store, sampling and analytics engine for PAA Crash Course.

export const DOMAINS = {
  1: { short: 'Low-code agent tools', title: 'Building agents using low-code tools', weight: 0.13, modules: ['d1-lowcode'] },
  2: { short: 'Coding agents & Antigravity', title: 'Using coding agents for application development', weight: 0.17, modules: ['d2-coding'] },
  3: { short: 'Custom agents & ADK', title: 'Developing custom agents', weight: 0.33, modules: ['d3-adk', 'd3-rag-mcp', 'd3-orchestration'] },
  4: { short: 'Evaluation & deployment', title: 'Evaluating and deploying agentic workflows', weight: 0.22, modules: ['d4-eval-deploy'] },
  5: { short: 'Security & governance', title: 'Securing and governing agentic workflows', weight: 0.15, modules: ['d5-security'] },
};

export const CASES = {
  finserve: {
    name: 'FinServe Global',
    file: 'case_study_finserve_global.txt',
    industry: 'Wealth Management & Banking',
    driver: 'Autonomous multi-agent financial advisory & regulatory compliance',
    sla: 'Sub-2s chat latency · 100% SEC/FINRA/GDPR compliance · Mandatory HITL',
    blurb: 'Multinational wealth manager deploying hierarchical ADK subagents, Agent Identity PAB policies, Model Armor, and HITL trade execution approval.',
    arch: [
      { req: 'Hierarchical multi-agent orchestration (Portfolio, Tax, Compliance)', services: ['Agent Development Kit (ADK)', 'Agent Runtime', 'Agent Registry'], rationale: 'ADK hierarchical/supervisor pattern delegates domain tasks to specialized subagents running on managed Agent Runtime with centralized schema registration.', trap: 'Avoid monolithic single-prompt LLM chains for multi-domain financial advisory requiring distinct compliance verification.' },
      { req: 'Zero-trust identity propagation & preventing unauthorized account access', services: ['Agent Identity', 'Principal Access Boundary (PAB)', 'Auth Manager (OAuth 2.0)'], rationale: 'Propagate end-user OAuth 2.0 tokens and enforce Principal Access Boundary policies via Agent Identity so subagents can only query ledgers authorized for that client.', trap: 'Never use a single shared over-privileged service account key across all client sessions.' },
      { req: 'Mandatory human advisor approval for trades > $50,000 or derivatives', services: ['Human-in-the-Loop (HITL) Gateways', 'ADK Stateful Interrupts', 'Agent Gateway'], rationale: 'Implement deterministic HITL interrupt checkpoints in ADK workflows routed through Agent Gateway before invoking core banking execution APIs.', trap: 'Relying solely on system prompt instructions ("do not trade over $50k") is non-deterministic and violates SEC/FINRA audit mandates.' },
      { req: 'In-line protection against prompt injection, jailbreaks & PII leakage', services: ['Model Armor', 'Sensitive Data Protection (DLP)', 'Agent Gateway'], rationale: 'Attach Model Armor policies at the Agent Gateway to inspect prompts and tool outputs for injection attacks, toxic content, and sensitive financial identifiers.', trap: 'Post-hoc log scanning does not prevent real-time PII exfiltration or prompt injection execution.' },
      { req: 'Long-term client risk profile memory vs ephemeral multi-turn session state', services: ['Agent Platform Memory Bank', 'Managed Sessions', 'Memorystore for Redis'], rationale: 'Store persistent long-term investor goals in Memory Bank while keeping active multi-turn conversation context in managed sessions.', trap: 'Stuffing entire historical client transaction logs into every prompt context window causes extreme token cost and latency spikes.' },
      { req: 'Continuous pre-production & production compliance evaluation', services: ['ADK evalset', 'Gen AI Evaluation Service', 'Custom Autoraters'], rationale: 'Run automated CI/CD evaluation pipelines against golden financial datasets using ADK evalset and domain-specific LLM-as-a-judge compliance autoraters.', trap: 'Manual spot-checking of agent responses cannot certify tool-calling precision across regulatory edge cases.' }
    ]
  },
  cymbal: {
    name: 'Cymbal OmniRetail',
    file: 'case_study_cymbal_omniretail.txt',
    industry: 'Omnichannel Retail & Supply Chain',
    driver: 'Multimodal conversational commerce & B2B Agent2Agent (A2A) logistics',
    sla: '85% support automation · Dynamic SLM/LLM routing · A2A interoperability',
    blurb: 'Global retailer combining low-code CX Agent Studio shopping assistants with custom ADK supply chain agents negotiating via Agent2Agent (A2A) protocol.',
    arch: [
      { req: 'Low-code multimodal conversational shopping flows with deterministic state', services: ['Customer Experience Agent Studio (CX Agent Studio)', 'Gemini Enterprise Agent Designer'], rationale: 'Build state-based conversational flows using pages, transition routes, event handlers, and structured few-shot prompt templates in CX Agent Studio.', trap: 'Writing custom state-machine boilerplate from scratch when low-code state-based flows satisfy retail customer service requirements.' },
      { req: 'B2B autonomous inventory restock & rerouting across external 3PL partners', services: ['Agent2Agent (A2A) Protocol', 'Agent Registry', 'Agent Gateway'], rationale: 'Use standardized A2A protocol for secure, schema-validated cross-organization negotiation between Cymbal supply chain agents and external 3PL partner agents.', trap: 'Exposing internal MCP servers or direct database connections to external third-party logistics partners.' },
      { req: 'Internal tool execution against Cloud SQL, Firestore & REST APIs', services: ['Model Context Protocol (MCP) Servers', 'Google Cloud MCP Servers', 'Auth Manager'], rationale: 'Expose internal databases and order management APIs to custom ADK agents via standardized MCP servers with scoped OAuth 2.0 credentials.', trap: 'Allowing LLMs to generate and execute raw arbitrary SQL strings directly against production transactional databases.' },
      { req: 'High-precision catalog & return policy grounding over 15M SKUs', services: ['Agent Search', 'RAG Engine', 'Vector Search 1.0 (Hybrid + Reranking)'], rationale: 'Combine dense vector embeddings with sparse keyword matching and cross-encoder reranking in Vector Search 1.0 / Agent Search to handle exact SKU codes and semantic queries.', trap: 'Pure vector similarity search fails on exact part numbers, SKU codes, and specific return policy clauses.' },
      { req: 'Cost & latency optimization across 80M shoppers', services: ['Model Garden (SLM vs LLM Routing)', 'Gemini 1.5 Flash', 'Gemini 1.5 Pro'], rationale: 'Route high-volume tier-1 intent classification and catalog lookups to Gemini Flash / SLMs while escalating complex multi-constraint supply chain negotiations to Gemini Pro.', trap: 'Invoking frontier reasoning models for every trivial greeting or order status lookup.' },
      { req: 'Detecting reasoning loops, tool latency spikes & drift in production', services: ['Cloud Trace', 'Cloud Logging', 'Agent Gateway Telemetry'], rationale: 'Instrument OpenTelemetry spans in Cloud Trace across every agent reasoning step, tool call, and A2A handoff to identify latency bottlenecks and infinite loops.', trap: 'Monitoring only HTTP 200 status codes misses silent agent hallucinations and multi-step reasoning loops.' }
    ]
  },
  apex: {
    name: 'Apex BioHealth',
    file: 'case_study_apex_biohealth.txt',
    industry: 'Biopharma & Clinical Trials',
    driver: 'Multimodal clinical trial synthesis, regulatory RAG & GxP/HIPAA compliance',
    sla: '99.5% citation precision · Strict PHI redaction · VPC-SC isolation',
    blurb: 'Global clinical trial sponsor using multimodal RAG Engine, Sensitive Data Protection PHI redaction, and ADK verification agents for FDA/EMA dossiers.',
    arch: [
      { req: 'Multimodal ingestion of clinical PDFs, DICOM imagery & physician audio', services: ['RAG Engine', 'Agent Retrieval', 'Gemini Multimodal LLMs'], rationale: 'Use RAG Engine with multimodal document parsing and layout-aware chunking to index complex clinical tables, medical images, and audio transcripts.', trap: 'Standard plain-text OCR strips critical dosage tables and cross-column relationships in clinical trial PDFs.' },
      { req: 'Zero ungrounded medical claims & 99.5% citation precision', services: ['ADK Sequential/Verification Workflow', 'Groundedness Autoraters', 'Agent Search'], rationale: 'Pair a Drafting Agent with a dedicated Verification Agent that cross-examines every synthesized medical statement against retrieved source chunk IDs.', trap: 'Relying on single-pass LLM generation without explicit citation verification introduces regulatory non-compliance risks.' },
      { req: 'Mandatory PHI de-identification before inference & logging', services: ['Sensitive Data Protection (DLP)', 'Model Armor', 'CMEK'], rationale: 'Configure Sensitive Data Protection de-identification templates in the ingestion and gateway pipelines to mask patient names, MRNs, and dates.', trap: 'Allowing raw patient identifiers into LLM prompt logs or third-party model endpoints violates HIPAA mandates.' },
      { req: 'Study-scoped data isolation per researcher IRB authorization', services: ['Agent Identity', 'Principal Access Boundary (PAB)', 'VPC Service Controls (VPC-SC)'], rationale: 'Enforce study-level Principal Access Boundary policies via Agent Identity inside a VPC-SC perimeter so agents only retrieve documents matching the user IRB scope.', trap: 'Granting the retrieval agent broad read access to the entire clinical Cloud Storage bucket without per-request identity propagation.' },
      { req: 'Continuous clinical accuracy & groundedness benchmarking', services: ['Agent Platform Gen AI Evaluation Service', 'ADK evalset', 'Golden Clinical QA Sets'], rationale: 'Automate evaluation runs scoring factual precision, recall, and citation faithfulness against physician-curated golden datasets before deployment.', trap: 'Using generic BLEU/ROUGE string matching metrics to evaluate complex medical synthesis.' }
    ]
  },
  devvelocity: {
    name: 'DevVelocity Cloud',
    file: 'case_study_devvelocity_cloud.txt',
    industry: 'Enterprise SaaS & Developer Tools',
    driver: 'Autonomous software engineering, CVE patching & legacy refactoring',
    sla: 'Zero code exfiltration · Isolated sandboxes · Human-vs-Agent mode gates',
    blurb: 'Enterprise SaaS provider scaling Antigravity coding agents, Claude Code on GCP, custom MCP servers, and Skill Registry across 4,500 engineers.',
    arch: [
      { req: 'Isolated execution environments for autonomous code refactoring & testing', services: ['Antigravity Sandboxes', 'Google Kubernetes Engine (GKE)', 'Cloud Workstations'], rationale: 'Execute coding agents (Antigravity / Claude Code on GCP) inside ephemeral, network-restricted GKE and Cloud Workstations sandboxes to prevent lateral movement.', trap: 'Running autonomous code-execution agents directly on shared production clusters or unisolated developer laptops.' },
      { req: 'Standardizing organizational coding rules, skills & subagents', services: ['Antigravity (CLI, SDK, App)', 'Skill Registry', 'Extension Hooks & Rules'], rationale: 'Publish versioned Antigravity Skills, Rules, Plugins, and specialized Subagents (e.g., Security Auditor) via Skill Registry for uniform enforcement across 4,500 devs.', trap: 'Allowing ad-hoc unversioned local prompt files that drift from enterprise security standards.' },
      { req: 'Safe agent access to internal Git, Jira, Cloud SQL & error logs', services: ['Model Context Protocol (MCP) Servers', 'Auth Manager (OAuth 2.0)', 'Agent Gateway'], rationale: 'Build internal MCP servers mediated by Agent Gateway and OAuth 2.0 so coding agents query schemas and logs through strictly typed, audited tool interfaces.', trap: 'Embedding static admin database passwords or Git personal access tokens inside coding agent prompts.' },
      { req: 'Lifecycle governance, scaling & optimization of deployed coding agents', services: ['Agents CLI in Agent Platform', 'Agent Registry', 'Cloud Logging'], rationale: 'Use the Agents CLI to programmatically build, test, version, govern, and scale coding agent configurations across enterprise development pipelines.', trap: 'Managing hundreds of autonomous coding agents manually through unscripted console clicks.' },
      { req: 'Preventing autonomous production merges or IAM escalation', services: ['Agents CLI (Agent Mode vs Human Mode)', 'Human-in-the-Loop (HITL)', 'Principal Access Boundary'], rationale: 'Configure agent mode for sandboxed test execution and refactoring, but enforce human mode gates requiring developer approval before Git merge or IAM modification.', trap: 'Granting coding agents autonomous write permissions to production main branches or IAM policy bindings.' }
    ]
  },
  aerologistics: {
    name: 'AeroLogistics Fleet',
    file: 'case_study_aerologistics_fleet.txt',
    industry: 'Autonomous Freight & Aviation',
    driver: 'Real-time graph multi-agent fleet dispatch & sub-second edge routing',
    sla: 'p99 latency < 800ms · 99.99% availability · Zero infinite reasoning loops',
    blurb: 'Global autonomous cargo network running cyclic/DAG graph agent workflows in ADK with hybrid SLM/LLM routing, Redis session state, and Cloud Trace.',
    arch: [
      { req: 'Asynchronous multi-agent coordination across weather, fuel & airspace', services: ['ADK Graph Workflows (DAG / Cyclic)', 'Parallel & Sequential Agents', 'Agent Runtime'], rationale: 'Use ADK graph workflows to run Weather, Fuel, and Airspace subagents in parallel, converging into a sequential Safety Verification agent before dispatch.', trap: 'Executing independent telemetry checks sequentially in a single thread violates the sub-800ms p99 latency budget.' },
      { req: 'Sub-800ms p99 decision latency & preventing storm-induced cost spikes', services: ['Small Language Models (SLMs) on GKE', 'Gemini 1.5 Flash / Pro Routing', 'Model Garden'], rationale: 'Deploy fine-tuned SLMs on GKE accelerators for sub-second edge routing decisions, invoking Gemini 1.5 Pro only when complex multi-hub conflicts arise.', trap: 'Sending 500,000 telemetry events/sec directly to a large frontier LLM causes severe latency timeouts and runaway token bills.' },
      { req: 'Preventing infinite reasoning loops & cascading timeouts', services: ['ADK Step Budgets & Circuit Breakers', 'Agent Gateway Rate Limiting', 'Deterministic Fallbacks'], rationale: 'Enforce strict maximum iteration limits (`max_steps`), tool call timeouts, and deterministic heuristic fallbacks if an agent reasoning loop exceeds budget.', trap: 'Allowing unbounded cyclic agent graphs without step limits or fallback heuristics in safety-critical aviation dispatch.' },
      { req: 'Ultra-low-latency shared scratchpad & session state', services: ['Memorystore for Redis', 'Managed Sessions', 'Pub/Sub'], rationale: 'Use Memorystore for Redis for sub-millisecond shared agent scratchpad state across distributed GKE/Cloud Run agent workers.', trap: 'Using high-latency cold object storage or unindexed SQL tables for high-frequency multi-agent state sharing.' },
      { req: 'Real-time trajectory debugging & bottleneck identification', services: ['Cloud Trace', 'OpenTelemetry', 'Cloud Logging'], rationale: 'Capture end-to-end distributed traces across every graph node, parallel branch, and tool call in Cloud Trace to isolate p99 latency outliers.', trap: 'Relying on unstructured text logs without trace context correlation across asynchronous subagents.' }
    ]
  },
  mediapulse: {
    name: 'MediaPulse Network',
    file: 'case_study_mediapulse_network.txt',
    industry: 'Global Media, News & Streaming',
    driver: 'Autonomous multi-language content production, MCP SaaS tools & rights governance',
    sla: '< 10 min global publishing · Zero copyright/factual hallucinations',
    blurb: 'Digital media syndicate orchestrating sequential ADK editorial pipelines, third-party SaaS MCP servers, Model Armor copyright guardrails, and HITL sign-off.',
    arch: [
      { req: 'Seamless agent integration with third-party CMS, Slack & DAM platforms', services: ['Model Context Protocol (MCP) Servers', 'Auth Manager (OAuth 2.0)', 'Agent Registry'], rationale: 'Wrap third-party SaaS APIs (CMS, Slack, Rights DB) as standardized MCP servers with OAuth 2.0 token management via Auth Manager.', trap: 'Hardcoding brittle point-to-point webhook scripts inside individual agent prompts.' },
      { req: 'Multi-stage editorial pipeline with automated fact & copyright verification', services: ['ADK Sequential Workflow', 'Agent Search (Verified Archives)', 'Model Armor'], rationale: 'Chain Research → Drafting → Rights/Fact Verification → Localization agents sequentially, blocking publication if Model Armor or Verification flags unverified claims.', trap: 'Allowing drafting agents to publish directly to CMS endpoints without an independent verification stage.' },
      { req: 'Continuous production quality scoring across 28 languages', services: ['ADK evalset', 'Gen AI Evaluation Service', 'Multilingual Autoraters'], rationale: 'Score localized drafts continuously for factual faithfulness, brand tone, and translation accuracy using automated evaluation pipelines before staging.', trap: 'Deploying multilingual localization agents without continuous automated drift and hallucination monitoring.' },
      { req: 'Division-scoped access to embargoed investigative media assets', services: ['Agent Identity', 'Principal Access Boundary (PAB)', 'Identity Propagation'], rationale: 'Propagate journalist identity through Agent Gateway and enforce PAB policies so agents only retrieve embargoed Cloud Storage assets authorized for that syndicate.', trap: 'Indexing embargoed investigative files into a globally accessible vector index without ACL filtering.' },
      { req: 'Human editor override & final publication sign-off', services: ['Human-in-the-Loop (HITL) Approval', 'Gemini Enterprise Workflows', 'Agent Gateway'], rationale: 'Pause autonomous execution at CMS staging and notify editors in Slack via MCP, requiring cryptographic human approval before live syndication.', trap: 'Fully autonomous public syndication of sensitive investigative news without human editorial accountability.' }
    ]
  }
};

// Area → recommended study module(s) (module ids from data/study front matter).
export const AREA_MODULES = {
  'Gemini Enterprise & CX Agent Studio': ['d1-lowcode'],
  'Antigravity & Coding Agents': ['d2-coding'],
  'Agent Development Kit (ADK) & Custom Agents': ['d3-adk', 'd3-orchestration'],
  'LLM vs SLM & Model Garden Selection': ['d3-adk'],
  'Memory Bank & Session Management': ['d3-adk'],
  'RAG Engine, Vector Search & Grounding': ['d3-rag-mcp'],
  'Model Context Protocol (MCP) & Integrations': ['d3-rag-mcp', 'd2-coding'],
  'Agent2Agent (A2A) & Multi-Agent Protocols': ['d3-orchestration'],
  'Agent Evaluation & Golden Datasets': ['d4-eval-deploy'],
  'Agent Runtime, Cloud Run & GKE Deployment': ['d4-eval-deploy'],
  'Agent Observability, Tracing & Troubleshooting': ['d4-eval-deploy'],
  'Agent Identity, OAuth 2.0 & Access Boundaries': ['d5-security'],
  'Agent Gateway, Model Armor & Guardrails': ['d5-security'],
};

export const EXAM = { questions: 60, minutes: 120, caseStudies: 2, perCase: 6 };

// ---------- data ----------
const cache = {};
export async function loadJSON(path) {
  if (!cache[path]) cache[path] = fetch(path).then(r => { if (!r.ok) throw new Error(path + ' ' + r.status); return r.json(); });
  return cache[path];
}
export async function loadText(path) {
  if (!cache[path]) cache[path] = fetch(path).then(r => { if (!r.ok) throw new Error(path + ' ' + r.status); return r.text(); });
  return cache[path];
}
let bank = null, bankById = null;
export async function getBank() {
  if (!bank) {
    bank = await loadJSON('data/questions.json');
    bankById = new Map(bank.map(q => [q.id, q]));
  }
  return bank;
}
export function q(id) { return bankById ? bankById.get(id) : null; }
export const getStudyIndex = () => loadJSON('data/study/index.json');
export const getMeta = () => loadJSON('data/meta.json');

// ---------- store (localStorage) ----------
const KEY = 'paa-crash-course.v1';
const defaults = () => ({ attempts: [], qstats: {}, study: {}, bookmarks: [], session: null });
let state = null;
export function store() {
  if (!state) {
    try { state = Object.assign(defaults(), JSON.parse(localStorage.getItem(KEY) || '{}')); }
    catch { state = defaults(); }
  }
  return state;
}
export function save() { try { localStorage.setItem(KEY, JSON.stringify(store())); } catch (e) { console.warn('save failed', e); } }
export function resetStore() { state = defaults(); save(); }
export function recordAnswer(qid, correct) {
  const s = store().qstats[qid] || { seen: 0, correct: 0, wrong: 0, last: 0 };
  s.seen++; correct ? s.correct++ : s.wrong++; s.last = Date.now(); s.lastCorrect = correct;
  store().qstats[qid] = s; save();
}
export function toggleBookmark(qid) {
  const b = store().bookmarks; const i = b.indexOf(qid);
  i >= 0 ? b.splice(i, 1) : b.push(qid); save(); return i < 0;
}
export const isBookmarked = (qid) => store().bookmarks.includes(qid);

// ---------- helpers ----------
export const shuffle = (a) => { const r = a.slice(); for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[r[i], r[j]] = [r[j], r[i]]; } return r; };
export const pct = (n, d) => d ? Math.round(100 * n / d) : 0;
export const fmtTime = (s) => { s = Math.max(0, Math.round(s)); const m = Math.floor(s / 60), r = s % 60; return `${m}:${String(r).padStart(2, '0')}`; };
export const fmtClock = (s) => { s = Math.max(0, Math.round(s)); const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), r = s % 60; return h ? `${h}:${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}` : `${m}:${String(r).padStart(2, '0')}`; };
export const fmtDate = (t) => new Date(t).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
export const sameSet = (a, b) => a.length === b.length && a.every(x => b.includes(x));

// ---------- sampling ----------
export function filterBank(all, f = {}) {
  return all.filter(qq => {
    if (f.domains && f.domains.length && !f.domains.includes(qq.domain)) return false;
    if (f.areas && f.areas.length && !f.areas.includes(qq.area)) return false;
    if (f.difficulty && f.difficulty !== 'all' && qq.difficulty !== f.difficulty) return false;
    if (f.caseStudy && f.caseStudy !== 'all') { if (f.caseStudy === 'none' ? qq.caseStudy : f.caseStudy === 'any' ? !qq.caseStudy : qq.caseStudy !== f.caseStudy) return false; }
    if (f.type && f.type !== 'all' && qq.type !== f.type) return false;
    if (f.source === 'official' && !qq.officialSample) return false;
    if (f.source === 'unseen' && store().qstats[qq.id]) return false;
    if (f.source === 'wrong' && !(store().qstats[qq.id] && store().qstats[qq.id].lastCorrect === false)) return false;
    if (f.source === 'bookmarked' && !isBookmarked(qq.id)) return false;
    if (f.search) { const s = f.search.toLowerCase(); if (!(qq.question + ' ' + qq.topic + ' ' + qq.options.join(' ')).toLowerCase().includes(s)) return false; }
    return true;
  });
}

const DOMAIN_IDS = [1, 2, 3, 4, 5];

// Weighted exam sample mimicking the real blueprint: ~2 case studies, remaining by domain weight.
export function sampleExam(all, n = EXAM.questions) {
  const targets = {};
  let acc = 0;
  for (const d of DOMAIN_IDS) { targets[d] = Math.round(DOMAINS[d].weight * n); acc += targets[d]; }
  targets[3] += n - acc; // fix rounding on Domain 3 (33%)
  const picked = [], used = new Set();
  const activeCases = Object.keys(CASES).filter(k => !CASES[k].legacy);
  const cases = shuffle(activeCases).slice(0, EXAM.caseStudies);
  for (const c of cases) {
    const pool = shuffle(all.filter(x => x.caseStudy === c));
    for (const x of pool.slice(0, EXAM.perCase)) { picked.push(x); used.add(x.id); targets[x.domain]--; }
  }
  const st = store().qstats;
  const rank = (x) => (st[x.id] ? 1 + (st[x.id].last / 1e13) : 0) + Math.random() * 0.5;
  for (const d of DOMAIN_IDS) {
    const pool = all.filter(x => !x.caseStudy && x.domain === d && !used.has(x.id)).sort((a, b) => rank(a) - rank(b));
    for (const x of pool.slice(0, Math.max(0, targets[d]))) { picked.push(x); used.add(x.id); }
  }
  while (picked.length < n) { const rest = all.filter(x => !used.has(x.id)); if (!rest.length) break; const x = rest[Math.floor(Math.random() * rest.length)]; picked.push(x); used.add(x.id); }
  return { questions: shuffle(picked).slice(0, n), cases };
}

// ---------- analytics ----------
export function analyze(attempt) {
  const items = attempt.items.map(it => ({ ...it, q: q(it.id) })).filter(it => it.q);
  const total = items.length;
  const correct = items.filter(it => it.correct).length;
  const answered = items.filter(it => it.chosen && it.chosen.length).length;
  const groupBy = (keyFn, labelFn) => {
    const m = {};
    for (const it of items) {
      const k = keyFn(it.q); if (k == null) continue;
      m[k] = m[k] || { key: k, label: labelFn ? labelFn(k) : k, total: 0, correct: 0, time: 0 };
      m[k].total++; if (it.correct) m[k].correct++; m[k].time += it.time || 0;
    }
    return Object.values(m).map(g => ({ ...g, pct: pct(g.correct, g.total), avgTime: g.total ? g.time / g.total : 0 }));
  };
  const byDomain = DOMAIN_IDS.map(d => {
    const g = groupBy(x => x.domain === d ? d : null)[0] || { key: d, total: 0, correct: 0, pct: 0, time: 0, avgTime: 0 };
    return { ...g, label: DOMAINS[d].short, weight: DOMAINS[d].weight };
  });
  const byArea = groupBy(x => x.area).sort((a, b) => a.pct - b.pct || b.total - a.total);
  const byDifficulty = ['easy', 'medium', 'hard'].map(k => groupBy(x => x.difficulty === k ? k : null)[0] || { key: k, label: k, total: 0, correct: 0, pct: 0 });
  const byType = ['single', 'multi'].map(k => groupBy(x => x.type === k ? k : null)[0] || { key: k, label: k, total: 0, correct: 0, pct: 0 });
  const byCase = groupBy(x => x.caseStudy, k => CASES[k] ? CASES[k].name : k);
  const times = items.map(it => it.time || 0);
  const totalTime = times.reduce((a, b) => a + b, 0);
  const slowest = items.slice().sort((a, b) => (b.time || 0) - (a.time || 0)).slice(0, 5);
  const flagged = items.filter(it => it.flagged);
  const wrong = items.filter(it => !it.correct);
  let wsum = 0, wtot = 0;
  for (const d of byDomain) if (d.total) { wsum += d.pct * d.weight; wtot += d.weight; }
  const weighted = wtot ? Math.round(wsum / wtot) : pct(correct, total);
  const score = pct(correct, total);
  const verdict = score >= 80 ? 'ready' : score >= 70 ? 'border' : 'notyet';
  const weak = byArea.filter(a => a.total >= 2 && a.pct < 70 || a.total === 1 && a.pct === 0)
    .map(a => ({ ...a, impact: (a.total - a.correct) })).sort((a, b) => b.impact - a.impact || a.pct - b.pct).slice(0, 6);
  const strong = byArea.filter(a => a.total >= 2 && a.pct >= 85).sort((a, b) => b.total - a.total).slice(0, 5);
  const changed = items.filter(it => it.changes && it.changes > 0).length;
  return { items, total, correct, answered, score, weighted, verdict, byDomain, byArea, byDifficulty, byType, byCase, totalTime, avgTime: total ? totalTime / total : 0, slowest, flagged, wrong, weak, strong, changed };
}

export function isCorrect(qq, chosen) { return sameSet(qq.answer, chosen || []); }
