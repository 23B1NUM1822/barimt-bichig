"""Checks the Lab 07 rules that a link checker cannot see.

- The tutorial has prerequisites before step 1 and at most 10 numbered steps (Bhatti Ch. 2, pp. 31-32).
- Each how-to guide opens with "When you need", ends with a Verify section, and has no tables (Diátaxis separation).
- Each reference page links back to the how-to guides that use it.
- The microcopy report covers exactly three touchpoints.
- With --site, the built search index contains the tutorial and every reference page (Chinchilla Ch. 4, p. 50).

Usage:
    python lab07/check_docs.py                     # source checks only
    python lab07/check_docs.py --site public/guide # source checks + built search index
"""

import json
import re
import sys
from pathlib import Path

DOCS = Path(__file__).resolve().parent / "docs"
TABLE_RULE = re.compile(r"^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$", re.M)

failures = []


def check(condition, message):
    if not condition:
        failures.append(message)


def body_after_title(text):
    return text.split("\n", 1)[1].lstrip() if text.startswith("# ") else text


# Tutorial
tutorial = (DOCS / "tutorials" / "first-ai-review.md").read_text(encoding="utf-8")
steps = [int(n) for n in re.findall(r"^## (\d+)\. ", tutorial, re.M)]
check(1 <= len(steps) <= 10, f"tutorial has {len(steps)} steps, the limit is 10")
check(steps == list(range(1, len(steps) + 1)), f"tutorial steps are not numbered 1..n: {steps}")
check(tutorial.find("## Before you start") != -1 and tutorial.find("## Before you start") < tutorial.find("## 1. "),
      "tutorial must state its prerequisites before step 1")

# How-to guides
guides = sorted(p for p in (DOCS / "how-to").glob("*.md") if p.name != "index.md")
check(len(guides) == 3, f"expected 3 how-to guides, found {len(guides)}")
for guide in guides:
    text = guide.read_text(encoding="utf-8")
    check(body_after_title(text).startswith("When you need"), f"{guide.name}: must open with a trigger, \"When you need ...\"")
    check("\n## Verify\n" in text, f"{guide.name}: needs a '## Verify' section")
    check(not TABLE_RULE.search(text), f"{guide.name}: contains a table; tables belong in the reference")
slack = DOCS / "how-to" / "connect-corgly-to-slack.md"
check(slack.read_text(encoding="utf-8").startswith("# How to Connect Corg.ly to a Slack Channel\n"),
      "the Slack guide must be titled exactly 'How to Connect Corg.ly to a Slack Channel'")

# Reference
for page in sorted((DOCS / "reference").glob("*.md")):
    if page.name == "index.md":
        continue
    text = page.read_text(encoding="utf-8")
    check("**Used in:**" in text and "../how-to/" in text, f"reference/{page.name}: needs a '**Used in:**' link to a how-to guide")

# Microcopy report
report = (DOCS / "reports" / "microcopy.md").read_text(encoding="utf-8")
check(re.findall(r"^## (\d)\. ", report, re.M) == ["1", "2", "3"], "the microcopy report must have touchpoints 1, 2, and 3")

# Built search index
if "--site" in sys.argv:
    site = Path(sys.argv[sys.argv.index("--site") + 1])
    index = json.loads((site / "search" / "search_index.json").read_text(encoding="utf-8"))
    locations = {doc["location"].split("#")[0] for doc in index["docs"]}
    required = ["tutorials/first-ai-review/"] + [
        f"reference/{p.stem}/" if p.stem != "index" else "reference/" for p in (DOCS / "reference").glob("*.md")
    ]
    for location in required:
        check(location in locations, f"search index is missing {location}")
    print(f"search index: {len(index['docs'])} entries, tutorial and {len(required) - 1} reference pages present")

for failure in failures:
    print(f"FAIL {failure}", file=sys.stderr)
print(f"tutorial steps: {len(steps)}/10, how-to guides: {len(guides)}, failures: {len(failures)}")
sys.exit(1 if failures else 0)
