# Google Cloud Professional Agentic Architect (PAA) Crash Course

A publication-grade interactive study companion, case study blueprint analyzer, and full-length timed exam simulator for the **Google Cloud Certified — Professional Agentic Architect (PAA)** certification.

Live application: **[https://paa.gdemos.cloud](https://paa.gdemos.cloud)**

---

## Official Exam Domains & Weights

| Domain | Title | Weight | Core Services & Focus |
| :--- | :--- | :---: | :--- |
| **Domain 1** | Building agents using low-code tools | **13%** | `Gemini Enterprise Agent Designer`, `CX Agent Studio`, state-based workflows (pages, transition routes, event handlers), system instructions, few-shot/CoT prompting, `Agent Search`, multimodal data ingestion |
| **Domain 2** | Using coding agents for application development | **17%** | `Antigravity` (CLI, SDK, App), `Claude Code on Google Cloud`, MCP servers, custom skills (`SKILL.md`), plugins, extension hooks, subagents, secure sandboxes on `GKE` (gVisor) & `Cloud Workstations`, `Agents CLI` governance |
| **Domain 3** | Developing custom agents | **33%** | `Agent Development Kit (ADK)`, model selection in `Model Garden` (LLM vs SLM, OSS vs Proprietary), `Agent Platform Memory Bank` & managed sessions, `Agents CLI`, `RAG Engine`, `Vector Search 1.0`, `Agent Retrieval`, `Agent Identity` & `Agent Registry`, Google Cloud `MCP Servers` (Cloud SQL, BigQuery, Spanner, 3P SaaS), `Agent2Agent (A2A)` protocol, multi-agent orchestration on `Agent Runtime` |
| **Domain 4** | Evaluating and deploying agentic workflows | **22%** | `ADK evalset`, `Gen AI Evaluation Service`, golden datasets, custom LLM-as-a-judge autoraters, trajectory precision/recall evaluation, `Agent Runtime` vs `Cloud Run` vs `GKE`, `Cloud Trace` & `Cloud Logging` |
| **Domain 5** | Securing and governing agentic workflows | **15%** | `Auth Manager` OAuth 2.0, `Principal Access Boundary (PAB)` via `Agent Identity`, `Agent Gateway` monitoring/rate-limiting, `Model Armor` guardrails, `Human-in-the-Loop (HITL)`, `Sensitive Data Protection (DLP)`, identity propagation |

---

## Enterprise Agentic Case Studies Included

All six enterprise case studies feature interactive **Requirement-to-GCP-Service Architecture Blueprints**, **Exam Traps**, and a **50/50 Split-Screen Exam Simulation View**:

1. **FinServe Global** — Wealth Management Advisory & Autonomous Portfolio Rebalancing Mesh (`finserve`)
2. **Cymbal OmniRetail** — Conversational Commerce & Autonomous Supply Chain Replenishment (`cymbal`)
3. **Apex BioHealth** — Clinical Trial Matching & HIPAA-Compliant Prior Authorization (`apex`)
4. **DevVelocity Cloud** — Multi-Tenant Autonomous Software Engineering & Secure Sandboxes (`devvelocity`)
5. **AeroLogistics Fleet** — Global Aviation MRO Predictive Maintenance & Autonomous AOG Dispatch (`aerologistics`)
6. **MediaPulse Network** — Real-Time Multimodal Broadcast Intelligence & Rights Clearance (`mediapulse`)

---

## Repository Structure

```text
├── data/
│   ├── reference/          # Official exam blueprint & verbatim case study texts
│   ├── study/              # 9 Markdown study modules (~30,000+ words)
│   └── questions/          # Source question bank JSON files (1,000+ questions)
├── site/
│   ├── index.html          # Single-page application shell
│   ├── css/styles.css      # Google Cloud corporate design system (Google Sans + Mono)
│   ├── js/                 # Modular ES module frontend (core.js, quiz.js, app.js)
│   └── data/               # Compiled site data (questions.json, study.json, cases/)
├── tools/
│   ├── validate_questions.py # Strict schema validator & duplicate detector
│   └── build_site.py         # Compiles Markdown & JSON into site/data/
├── Dockerfile              # Production Nginx Alpine container
└── nginx.conf              # Static asset caching & SPA routing config
```

---

## Building & Validating Locally

```bash
# Validate all question files and compile site/data/
python3 tools/build_site.py

# Serve locally on port 8766
python3 -m http.server 8766 --directory site
```

---

## Deploying to Cloud Run

```bash
gcloud run deploy paa-crash-course \
  --source=. \
  --region=us-central1 \
  --project=sa-learning-1 \
  --configuration=argolis-project \
  --allow-unauthenticated
```
