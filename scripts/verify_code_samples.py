"""Checks the code samples in docs/code-samples/README.md against a running API (Bhatti's "Trustworthy" rule).

For every sample the README marks with <!-- sample: NAME.py --> and <!-- response: NAME.py -->, this script:
  1. checks that the code shown in the README is exactly the code in NAME.py,
  2. runs NAME.py against the API and checks that the JSON it prints equals the documented response,
  3. checks that neither the samples nor the spec fall back to generic placeholders such as foo/bar.

Usage, with the Prism mock of docs/openapi/openapi.yaml listening on port 4010:
    python scripts/verify_code_samples.py
"""

import json
import os
import re
import subprocess
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
SAMPLES_DIR = REPO_ROOT / "docs" / "code-samples"
SAMPLES_DOC = SAMPLES_DIR / "README.md"
SPEC = REPO_ROOT / "docs" / "openapi" / "openapi.yaml"
API_URL = os.environ.get("CODEPRACTICE_API_URL", "http://127.0.0.1:4010")

# "test" is only a placeholder inside code; the spec may legitimately talk about unit tests.
PLACEHOLDER_IN_SPEC = re.compile(r"\b(foo|bar|baz|qux)\b", re.IGNORECASE)
PLACEHOLDER_IN_CODE = re.compile(r"\b(foo|bar|baz|qux|test)\b", re.IGNORECASE)


def marked_blocks(doc: str, marker: str, language: str) -> dict[str, str]:
    pattern = rf"<!-- {marker}: (\S+) -->\s*```{language}\n(.*?)```"
    return dict(re.findall(pattern, doc, re.DOTALL))


def main() -> int:
    doc = SAMPLES_DOC.read_text(encoding="utf-8")
    documented_code = marked_blocks(doc, "sample", "python")
    documented_responses = marked_blocks(doc, "response", "json")
    failures = []

    if not documented_code:
        failures.append(f"{SAMPLES_DOC.name}: no <!-- sample: ... --> blocks found")

    for name, code_in_doc in documented_code.items():
        code = (SAMPLES_DIR / name).read_text(encoding="utf-8")
        if code_in_doc != code:
            failures.append(f"{name}: the code in README.md differs from the file")
        if match := PLACEHOLDER_IN_CODE.search(code):
            failures.append(f"{name}: generic placeholder '{match.group()}'")

        run = subprocess.run(
            [sys.executable, name],
            cwd=SAMPLES_DIR,
            env={**os.environ, "CODEPRACTICE_API_URL": API_URL, "PYTHONIOENCODING": "utf-8"},
            capture_output=True,
            encoding="utf-8",
            timeout=90,
        )
        if run.returncode != 0:
            failures.append(f"{name}: exited with code {run.returncode}\n{run.stderr}")
            continue
        if name not in documented_responses:
            failures.append(f"{name}: README.md has no <!-- response: {name} --> block")
            continue
        if json.loads(run.stdout) != json.loads(documented_responses[name]):
            failures.append(f"{name}: the documented response differs from what {API_URL} returned:\n{run.stdout}")
            continue
        print(f"ok  {name}")

    if match := PLACEHOLDER_IN_SPEC.search(SPEC.read_text(encoding="utf-8")):
        failures.append(f"{SPEC.name}: generic placeholder '{match.group()}'")

    for failure in failures:
        print(f"FAIL {failure}", file=sys.stderr)
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
