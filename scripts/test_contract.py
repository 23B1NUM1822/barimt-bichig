"""Contract tests for docs/openapi/openapi.yaml (Week 05 lecture, milestone M5).

SpecRules   reads only files in the repository.
LintGate    needs npx, to run Redocly CLI.
MockServer  needs the Prism mock of the spec on CODEPRACTICE_API_URL (default http://127.0.0.1:4010).

Run everything, with the mock started first:
    npx @stoplight/prism-cli mock docs/openapi/openapi.yaml
    python -m unittest discover -s scripts -v
"""

import hashlib
import json
import os
import re
import shutil
import subprocess
import tempfile
import unittest
from pathlib import Path

import requests

ROOT = Path(__file__).resolve().parent.parent
SPEC_YAML = ROOT / "docs" / "openapi" / "openapi.yaml"
SPEC_JSON = ROOT / "docs" / "openapi" / "openapi.json"
LAB_README = ROOT / "docs" / "lab05" / "README.md"
REAL_ROUTE = ROOT / "lab06" / "app" / "api" / "evaluate" / "route.ts"

SPEC = json.loads(SPEC_JSON.read_text(encoding="utf-8"))
API_URL = os.environ.get("CODEPRACTICE_API_URL", "http://127.0.0.1:4010")
REDOCLY_CLI = os.environ.get("REDOCLY_CLI", "@redocly/cli@2.56.0")
AUTH = {"Authorization": "Bearer your_student_jwt_from_login"}
PAGES_URL = "https://23b1num1822.github.io/barimt-bichig"


def resolve(node):
    """Follows a local $ref such as '#/components/responses/Unauthorized'."""
    while isinstance(node, dict) and "$ref" in node:
        target = SPEC
        for key in node["$ref"].lstrip("#/").split("/"):
            target = target[key]
        node = target
    return node


def operations():
    for path, item in SPEC["paths"].items():
        for method, operation in item.items():
            yield method.upper(), path, operation


def examples_of(body_owner):
    """Named examples of a response or request body: {name: value}. A single `example` is named 'example'."""
    media = resolve(body_owner).get("content", {}).get("application/json", {})
    if "examples" in media:
        return {name: resolve(example)["value"] for name, example in media["examples"].items()}
    return {"example": media["example"]} if "example" in media else {}


def responses_of(operation):
    return {status: resolve(response) for status, response in operation["responses"].items()}


def spec_hash():
    """First 12 hex digits of the SHA-256 of the spec, with LF line endings."""
    return hashlib.sha256(SPEC_YAML.read_bytes().replace(b"\r\n", b"\n")).hexdigest()[:12]


def examples_table():
    """The 'verified examples' table of docs/lab05/README.md, generated from the spec."""
    rows = ["| Operation | Success | Errors: status and `code` |", "|---|---|---|"]
    for method, path, operation in operations():
        success, errors = [], []
        for status, response in responses_of(operation).items():
            for example in examples_of(response).values():
                if status.startswith("2"):
                    success.append(status)
                else:
                    errors.append(f"{status} `{example['code']}`")
        rows.append(f"| `{method} {path}` | {', '.join(sorted(set(success)))} | {', '.join(errors)} |")
    return rows


class SpecRules(unittest.TestCase):
    def test_every_operation_has_a_success_and_an_error_example(self):
        for method, path, operation in operations():
            with self.subTest(operation=f"{method} {path}"):
                by_status = {status: examples_of(r) for status, r in responses_of(operation).items()}
                self.assertTrue(any(v for s, v in by_status.items() if s.startswith("2")), "no success example")
                self.assertTrue(any(v for s, v in by_status.items() if s[0] in "45"), "no error example")
                for status, examples in by_status.items():
                    self.assertTrue(examples, f"{status} has no example")

    def test_every_error_example_has_a_known_code_and_a_request_id(self):
        known_codes = SPEC["components"]["schemas"]["ErrorCode"]["enum"]
        for method, path, operation in operations():
            for status, response in responses_of(operation).items():
                if status.startswith("2"):
                    continue
                for name, example in examples_of(response).items():
                    with self.subTest(operation=f"{method} {path}", status=status, example=name):
                        self.assertIn(example["code"], known_codes)
                        self.assertRegex(example["requestId"], r"^req_[0-9A-Z]{12}$")
                        self.assertTrue(example["error"])

    def test_every_operation_documents_401_and_429_with_retry_after(self):
        for method, path, operation in operations():
            with self.subTest(operation=f"{method} {path}"):
                responses = responses_of(operation)
                self.assertIn("401", responses)
                self.assertIn("429", responses)
                retry_after = responses["429"]["headers"]["Retry-After"]
                self.assertEqual(retry_after["schema"]["type"], "integer", "Retry-After must be in seconds")

    def test_every_operation_has_a_changelog_up_to_the_current_version(self):
        for method, path, operation in operations():
            with self.subTest(operation=f"{method} {path}"):
                changelog = operation.get("x-changelog", [])
                self.assertTrue(changelog, "x-changelog is missing")
                for entry in changelog:
                    self.assertEqual(sorted(entry), ["change", "date", "reason", "version"])
                    self.assertRegex(entry["date"], r"^\d{4}-\d{2}-\d{2}$")
                    # Redoc does not show operation-level extensions, so the description repeats each entry.
                    line = f"- **{entry['version']}** ({entry['date']}): {entry['change']} *Why:* {entry['reason']}"
                    self.assertTrue(line in operation["description"], f"the description is missing: {line}")
                self.assertEqual(changelog[-1]["version"], SPEC["info"]["version"])

    def test_the_version_is_in_every_path_and_only_there(self):
        major = SPEC["info"]["version"].split(".")[0]
        for path in SPEC["paths"]:
            self.assertTrue(path.startswith(f"/api/v{major}/"), path)
        for server in SPEC["servers"]:
            self.assertNotRegex(server["url"], r"/v\d+/?$", "the server URL must not repeat the version")

    def test_the_spec_documents_every_status_the_real_route_returns(self):
        """Design-first drift check: the handler in lab06 is the implementation the contract was written from."""
        returned = set(re.findall(r"\berror\((\d{3}),", REAL_ROUTE.read_text(encoding="utf-8")))
        self.assertGreaterEqual(len(returned), 7)
        documented = set(SPEC["paths"]["/api/v1/evaluate"]["post"]["responses"])
        self.assertEqual(returned - documented, set(), "statuses the route returns but the spec does not document")

    def test_examples_contain_no_real_secrets(self):
        secret = re.compile(r"eyJ[\w-]{8,}\.[\w-]{8,}|\bsk-[\w-]{16,}|\bgh[pousr]_\w{20,}|Bearer [\w.-]{30,}")
        files = [SPEC_YAML, *sorted((ROOT / "docs" / "code-samples").glob("*.py")), ROOT / "docs" / "code-samples" / "README.md"]
        for file in files:
            with self.subTest(file=file.name):
                self.assertIsNone(secret.search(file.read_text(encoding="utf-8")))

    def test_the_readme_links_to_the_current_version_and_spec_hash(self):
        version = SPEC["info"]["version"]
        readme = LAB_README.read_text(encoding="utf-8")
        for page in ("", "swagger/"):
            url = f"{PAGES_URL}/v{version}/{page}#spec-sha256-{spec_hash()}"
            self.assertTrue(url in readme, f"docs/lab05/README.md is stale. Expected the link {url}")

    def test_the_readme_lists_every_verified_example(self):
        readme = LAB_README.read_text(encoding="utf-8")
        table = examples_table()
        for row in table:
            self.assertTrue(row in readme, "docs/lab05/README.md is stale. Expected table:\n" + "\n".join(table))


@unittest.skipUnless(shutil.which("npx"), "npx is not installed")
class LintGate(unittest.TestCase):
    def run_redocly(self, *arguments):
        return subprocess.run(
            [shutil.which("npx"), "--yes", REDOCLY_CLI, *arguments],
            cwd=ROOT, capture_output=True, encoding="utf-8", errors="replace", timeout=300,
        )

    def test_lint_rejects_a_lying_example(self):
        """Lecture demo, step 5: an example that contradicts its schema must fail the build, not only warn."""
        honest = "                      score: 82\n                      verdict: partially_correct\n"
        spec = SPEC_YAML.read_text(encoding="utf-8").replace("\r\n", "\n")
        self.assertEqual(spec.count(honest), 1)
        with tempfile.TemporaryDirectory() as folder:
            lying_spec = Path(folder) / "openapi.yaml"
            lying_spec.write_text(spec.replace(honest, honest.replace("82", "eighty-two")), encoding="utf-8")
            result = self.run_redocly("lint", str(lying_spec), "--config", str(ROOT / "redocly.yaml"))
        self.assertNotEqual(result.returncode, 0, "lint accepted a score that is not a number")
        self.assertIn("no-invalid-media-type-examples", result.stdout + result.stderr)

    def test_openapi_json_is_the_bundle_of_openapi_yaml(self):
        with tempfile.TemporaryDirectory() as folder:
            bundle = Path(folder) / "openapi.json"
            result = self.run_redocly("bundle", str(SPEC_YAML), "-o", str(bundle))
            self.assertEqual(result.returncode, 0, result.stderr)
            self.assertEqual(json.loads(bundle.read_text(encoding="utf-8")), SPEC, "run the bundle command again")


class MockServer(unittest.TestCase):
    def send(self, method, path, operation, prefer=None):
        url = API_URL + path
        query = {}
        for parameter in map(resolve, operation.get("parameters", [])):
            if parameter["in"] == "path":
                url = url.replace("{" + parameter["name"] + "}", str(parameter["example"]))
            elif parameter["in"] == "query":
                query[parameter["name"]] = parameter["example"]
        body = next(iter(examples_of(operation["requestBody"]).values())) if "requestBody" in operation else None
        headers = {**AUTH, **({"Prefer": prefer} if prefer else {})}
        return requests.request(method, url, params=query, json=body, headers=headers, timeout=10)

    def test_the_mock_serves_every_documented_example(self):
        """Build-verified examples: one success and every error of each endpoint, forced with the Prefer header."""
        for method, path, operation in operations():
            for status, response in responses_of(operation).items():
                for name, expected in examples_of(response).items():
                    with self.subTest(operation=f"{method} {path}", status=status, example=name):
                        prefer = f"code={status}" + ("" if name == "example" else f", example={name}")
                        actual = self.send(method, path, operation, prefer)
                        self.assertEqual(actual.status_code, int(status))
                        self.assertEqual(actual.json(), expected)
                        if status == "429":
                            self.assertEqual(actual.headers["Retry-After"], "30")

    def test_a_request_without_a_token_gets_401(self):
        response = requests.get(API_URL + "/api/v1/categories", timeout=10)
        self.assertEqual(response.status_code, 401)

    @unittest.expectedFailure
    def test_the_old_unversioned_evaluate_path_still_answers(self):
        """M5 closing ritual: one failing test on an old path.

        Before 1.0.0 the endpoint was POST /api/evaluate. The versioned contract dropped that path, so this
        request gets 404 and the assertion fails. The failure is expected. If it ever passes, an unversioned
        path has come back and the contract no longer says so.
        """
        evaluate = SPEC["paths"]["/api/v1/evaluate"]["post"]
        response = self.send("POST", "/api/evaluate", evaluate)
        self.assertEqual(response.status_code, 200)


if __name__ == "__main__":
    unittest.main()
