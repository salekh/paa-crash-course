#!/usr/bin/env python3
"""Build step for the PCA crash-course static site.

- Validates + merges question files into site/data/questions.json (via validate_questions).
- Copies study modules (data/study/*.md) into site/data/study/ and writes an index.json
  with the parsed front matter, a heading outline and a word count.
- Writes site/data/meta.json with bank statistics used by the landing page.

Usage: python3 tools/build_site.py
"""
import json
import os
import re
import subprocess
import sys
from collections import Counter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STUDY_SRC = os.path.join(ROOT, "data", "study")
SITE = os.path.join(ROOT, "site")
STUDY_DST = os.path.join(SITE, "data", "study")

FM_RE = re.compile(r"^---\s*\n(.*?)\n---\s*\n", re.S)


def parse_front_matter(text):
    m = FM_RE.match(text)
    if not m:
        return {}, text
    meta = {}
    for line in m.group(1).splitlines():
        if ":" not in line:
            continue
        k, v = line.split(":", 1)
        v = v.strip().strip('"').strip("'")
        if re.fullmatch(r"-?\d+", v):
            v = int(v)
        meta[k.strip()] = v
    return meta, text[m.end():]


def slugify(s):
    s = re.sub(r"[^\w\s-]", "", s.lower()).strip()
    return re.sub(r"[\s_]+", "-", s)


def outline(body):
    out = []
    in_code = False
    for line in body.splitlines():
        if line.startswith("```"):
            in_code = not in_code
            continue
        if in_code:
            continue
        m = re.match(r"^(#{2,3})\s+(.*)", line)
        if m:
            out.append({"level": len(m.group(1)), "text": m.group(2).strip(), "id": slugify(m.group(2))})
    return out


def build_study():
    os.makedirs(STUDY_DST, exist_ok=True)
    index = []
    for fn in sorted(os.listdir(STUDY_SRC)):
        if not fn.endswith(".md"):
            continue
        with open(os.path.join(STUDY_SRC, fn), encoding="utf-8") as f:
            text = f.read()
        meta, body = parse_front_matter(text)
        if "id" not in meta:
            print(f"WARN {fn}: missing front matter id", file=sys.stderr)
            continue
        words = len(re.findall(r"\w+", re.sub(r"\|", " ", body)))
        entry = {
            "id": meta["id"],
            "file": fn,
            "title": meta.get("title", fn),
            "domain": int(meta.get("domain", 0)),
            "order": int(meta.get("order", 99)),
            "minutes": int(meta.get("minutes", max(10, round(words / 220)))),
            "summary": meta.get("summary", ""),
            "words": words,
            "outline": outline(body),
        }
        index.append(entry)
        with open(os.path.join(STUDY_DST, fn), "w", encoding="utf-8") as f:
            f.write(body)
    index.sort(key=lambda e: e["order"])
    with open(os.path.join(STUDY_DST, "index.json"), "w", encoding="utf-8") as f:
        json.dump(index, f, indent=1)
    print(f"study modules: {len(index)}  total words: {sum(e['words'] for e in index)}")
    return index


# Coarse topic areas used by the analytics views. First matching rule wins; rules are
# matched against the fine-grained topic first, then topic + stem.
AREA_RULES = [
    ("Gemini Enterprise & CX Agent Studio", r"gemini enterprise|agent designer|cx agent studio|customer experience agent|state-based|transition route|event handler|in-console prompt"),
    ("Antigravity & Coding Agents", r"antigravity|claude code|coding agent|code refactor|workstation|sandbox|skill registry|extension hook|agents cli"),
    ("Agent Development Kit (ADK) & Custom Agents", r"adk\b|agent development kit|custom agent|sequential agent|parallel agent|graph workflow|cyclic|dag\b|supervisor|subagent"),
    ("LLM vs SLM & Model Garden Selection", r"llm vs slm|small language model|model garden|self-hosted|open-source|proprietary|gemini 1\.5|gemini flash|gemini pro|token cost|context window"),
    ("Memory Bank & Session Management", r"memory bank|managed session|session state|memorystore|redis|ephemeral state|long-term memory|scratchpad"),
    ("RAG Engine, Vector Search & Grounding", r"rag\b|rag engine|vector search|agent retrieval|agent search|embedding|similarity|rerank|chunking|grounding|multimodal ingestion"),
    ("Model Context Protocol (MCP) & Integrations", r"mcp\b|model context protocol|mcp server|api integration|cloud sql|bigquery|firestore|third-party saas|connector"),
    ("Agent2Agent (A2A) & Multi-Agent Protocols", r"a2a\b|agent2agent|inter-agent|agent registry|handoff|protocol|discovery|multi-agent coordination"),
    ("Agent Evaluation & Golden Datasets", r"evalset|evaluation|golden data|autorater|llm-as-a-judge|trajectory eval|tool execution eval|retrieval quality|groundedness"),
    ("Agent Runtime, Cloud Run & GKE Deployment", r"agent runtime|agent engine|cloud run|gke\b|kubernetes|deployment runtime|autoscal|serverless|container"),
    ("Agent Observability, Tracing & Troubleshooting", r"cloud trace|cloud logging|observability|reasoning loop|drift|latency bottleneck|hallucination|opentelemetry|debugging"),
    ("Agent Identity, OAuth 2.0 & Access Boundaries", r"agent identity|principal access boundary|\bpab\b|auth manager|oauth|identity propagation|least privilege|zero trust"),
    ("Agent Gateway, Model Armor & Guardrails", r"agent gateway|model armor|guardrail|human-in-the-loop|hitl\b|sensitive data protection|\bdlp\b|prompt injection|jailbreak|safety filter"),
]
AREA_RULES_C = [(name, re.compile(rx, re.I)) for name, rx in AREA_RULES]
AREA_DOMAIN_FALLBACK = {
    1: "Gemini Enterprise & CX Agent Studio",
    2: "Antigravity & Coding Agents",
    3: "Agent Development Kit (ADK) & Custom Agents",
    4: "Agent Evaluation & Golden Datasets",
    5: "Agent Gateway, Model Armor & Guardrails",
}


def classify_area(q):
    topic = q.get("topic", "")
    for name, rx in AREA_RULES_C:
        if rx.search(topic):
            return name
    blob = topic + " " + q.get("question", "") + " " + " ".join(q.get("options", []))
    # Score by number of distinct matches on the full text; ties -> earlier rule.
    best, best_n = None, 0
    for name, rx in AREA_RULES_C:
        n = len(rx.findall(blob))
        if n > best_n:
            best, best_n = name, n
    return best or AREA_DOMAIN_FALLBACK.get(q.get("domain"), "Other")


def build_questions():
    r = subprocess.run([sys.executable, os.path.join(ROOT, "tools", "validate_questions.py"), "--build"],
                       capture_output=True, text=True)
    tail = "\n".join(r.stdout.strip().splitlines()[-9:])
    print(tail)
    if r.returncode != 0:
        print(r.stderr, file=sys.stderr)
        sys.exit("question validation failed")
    path = os.path.join(SITE, "data", "questions.json")
    with open(path, encoding="utf-8") as f:
        data = json.load(f)
    qs = data if isinstance(data, list) else data.get("questions", [])
    for q in qs:
        q["area"] = classify_area(q)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(qs, f, ensure_ascii=False, separators=(",", ":"))
    areas = Counter(q["area"] for q in qs)
    print("areas:", len(areas))
    for a, n in areas.most_common():
        print(f"  {n:4d}  {a}")
    return qs


def build_meta(questions, study):
    qs = questions
    topics = Counter((q["domain"], q["topic"]) for q in qs)
    meta = {
        "questionCount": len(qs),
        "officialSampleCount": sum(1 for q in qs if q.get("officialSample")),
        "byDomain": dict(Counter(q["domain"] for q in qs)),
        "byDifficulty": dict(Counter(q["difficulty"] for q in qs)),
        "byCaseStudy": dict(Counter(q["caseStudy"] or "none" for q in qs)),
        "topicCount": len(topics),
        "areaCount": len(set(q["area"] for q in qs)),
        "studyModules": len(study),
        "studyWords": sum(e["words"] for e in study),
    }
    with open(os.path.join(SITE, "data", "meta.json"), "w", encoding="utf-8") as f:
        json.dump(meta, f, indent=1)
    print("meta:", json.dumps(meta))


if __name__ == "__main__":
    study = build_study()
    questions = build_questions()
    build_meta(questions, study)
