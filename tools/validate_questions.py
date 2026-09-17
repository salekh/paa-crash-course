#!/usr/bin/env python3
"""Validate and merge question JSON files.

Usage:
  python3 tools/validate_questions.py            # validate all files in data/questions
  python3 tools/validate_questions.py file.json  # validate one file
  python3 tools/validate_questions.py --build    # validate + write site/data/questions.json (merged)
"""
import glob
import json
import os
import re
import sys
from collections import Counter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
QDIR = os.path.join(ROOT, "data", "questions")
OUT = os.path.join(ROOT, "site", "data", "questions.json")

ALLOWED_CS = {None, "finserve", "cymbal", "apex", "devvelocity", "aerologistics", "mediapulse"}
ALLOWED_DIFF = {"easy", "medium", "hard"}


def norm(s):
    return re.sub(r"[^a-z0-9]+", " ", s.lower()).strip()


def validate_file(path, seen_ids, seen_stems):
    errors = []
    try:
        with open(path, encoding="utf-8") as f:
            data = json.load(f)
    except Exception as e:  # noqa: BLE001
        return [f"{path}: invalid JSON: {e}"], []
    if not isinstance(data, list):
        return [f"{path}: top-level must be a list"], []
    good = []
    for i, q in enumerate(data):
        where = f"{os.path.basename(path)}[{i}] ({q.get('id', '?')})"
        req = ["id", "domain", "topic", "difficulty", "type", "question", "options", "answer", "explanation", "refs"]
        missing = [k for k in req if k not in q]
        if missing:
            errors.append(f"{where}: missing {missing}")
            continue
        if q["id"] in seen_ids:
            errors.append(f"{where}: duplicate id")
            continue
        if not isinstance(q["domain"], int) or not 1 <= q["domain"] <= 5:
            errors.append(f"{where}: bad domain {q['domain']}")
        if q["difficulty"] not in ALLOWED_DIFF:
            errors.append(f"{where}: bad difficulty {q['difficulty']}")
        if q["type"] not in ("single", "multi"):
            errors.append(f"{where}: bad type {q['type']}")
        if q.get("caseStudy") not in ALLOWED_CS:
            errors.append(f"{where}: bad caseStudy {q.get('caseStudy')}")
        opts = q["options"]
        if not isinstance(opts, list) or not 4 <= len(opts) <= 6:
            errors.append(f"{where}: options must have 4-6 entries")
        if len(set(map(norm, opts))) != len(opts):
            errors.append(f"{where}: duplicate options")
        ans = q["answer"]
        if not isinstance(ans, list) or not ans or any(not isinstance(a, int) or a < 0 or a >= len(opts) for a in ans):
            errors.append(f"{where}: bad answer indices {ans}")
        elif q["type"] == "single" and len(ans) != 1:
            errors.append(f"{where}: single type must have exactly 1 answer")
        elif q["type"] == "multi" and not 2 <= len(ans) <= 3:
            errors.append(f"{where}: multi type must have 2-3 answers")
        if q["type"] == "multi" and not re.search(r"choose (two|three)", q["question"], re.I):
            errors.append(f"{where}: multi question must state 'Choose two/three'")
        if len(q["question"]) < 60:
            errors.append(f"{where}: question stem too short")
        if len(q["explanation"]) < 80:
            errors.append(f"{where}: explanation too short")
        if not isinstance(q["refs"], list) or not q["refs"]:
            errors.append(f"{where}: refs required")
        stem = norm(q["question"] + " " + " ".join(opts[:2]))
        if stem in seen_stems:
            errors.append(f"{where}: near-duplicate stem of {seen_stems[stem]}")
        seen_stems[stem] = q["id"]
        seen_ids.add(q["id"])
        q.setdefault("caseStudy", None)
        good.append(q)
    return errors, good


def main(argv):
    build = "--build" in argv
    files = [a for a in argv if a.endswith(".json")] or sorted(glob.glob(os.path.join(QDIR, "*.json")))
    seen_ids, seen_stems = set(), {}
    all_q, all_err = [], []
    for p in files:
        errs, good = validate_file(p, seen_ids, seen_stems)
        all_err += errs
        all_q += good
        print(f"{os.path.basename(p):40s} {len(good):5d} ok  {len(errs):3d} errors")
    print("-" * 60)
    print(f"TOTAL questions: {len(all_q)}   errors: {len(all_err)}")
    for e in all_err[:80]:
        print("  !", e)
    if all_q:
        dom = Counter(q["domain"] for q in all_q)
        print("by domain:", dict(sorted(dom.items())))
        print("by difficulty:", dict(Counter(q["difficulty"] for q in all_q)))
        print("by type:", dict(Counter(q["type"] for q in all_q)))
        print("case study:", dict(Counter(q.get("caseStudy") or "none" for q in all_q)))
        pos = Counter(a for q in all_q if q["type"] == "single" for a in q["answer"])
        print("answer position (single):", dict(sorted(pos.items())))
    if build:
        os.makedirs(os.path.dirname(OUT), exist_ok=True)
        with open(OUT, "w", encoding="utf-8") as f:
            json.dump(all_q, f, ensure_ascii=False, separators=(",", ":"))
        print(f"wrote {OUT} ({os.path.getsize(OUT)//1024} KB)")
    return 1 if all_err else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
