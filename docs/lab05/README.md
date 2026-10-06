# Lab 05: OpenAPI 3.0 & Bhatti code samples

**Software Project Documentation · Week 05 · National University of Mongolia**
Student: T. Sodnomdamba (23B1NUM1822) · Guiding project: *AI-Powered Code Reviewer & Practice Platform* (diploma project)

## Published contract: version 1.1.0

| Renderer | Latest | Pinned to this version (tag `api-v1.1.0`) |
|---|---|---|
| Redoc, the public reference | <https://23b1num1822.github.io/barimt-bichig/> | <https://23b1num1822.github.io/barimt-bichig/v1.1.0/#spec-sha256-cebf8f97116b> |
| Swagger UI, the sandbox | <https://23b1num1822.github.io/barimt-bichig/swagger/> | <https://23b1num1822.github.io/barimt-bichig/v1.1.0/swagger/#spec-sha256-cebf8f97116b> |

The fragment is the first 12 hex digits of the SHA-256 of `openapi.yaml`. A contract test fails when the spec
changes and these links do not. Version 1.0.0 stays online at
[`/v1.0.0/`](https://23b1num1822.github.io/barimt-bichig/v1.0.0/) (tag `api-v1.0.0`).

## Deliverables

| Phase | User story | Deliverable |
|---|---|---|
| 1. OpenAPI 3.0.3 specification | US-5.1 | [`docs/openapi/openapi.yaml`](../openapi/openapi.yaml) and its bundle [`openapi.json`](../openapi/openapi.json): 5 endpoints, Bearer JWT, 19 reusable schemas, examples on every request and response |
| 2. Three Python code samples | US-5.2 | [`docs/code-samples/README.md`](../code-samples/README.md) and the `.py` files next to it |
| 3. Bhatti 5-principles audit scorecard | US-5.2 | [`audit-scorecard.md`](audit-scorecard.md): **4.73 / 5.0** average |
| 4. Decision report & CLI commands | US-5.3, US-5.4 | [`decision-report.md`](decision-report.md): the 100-word report, the 150-word write-up, and exact commands |
| Bonus (+10%) | Bhatti p. 96 | [`.github/workflows/api-docs.yml`](../../.github/workflows/api-docs.yml) runs every code sample in CI |
| M5: build-verified examples | Lecture W05 | [`scripts/test_contract.py`](../../scripts/test_contract.py): every example below is served by the mock and compared with the spec |
| M5: one failing test on an old path | Lecture W05 | `test_the_old_unversioned_evaluate_path_still_answers` in the same file |

## Endpoints and their verified examples

Each endpoint documents one success and every error it can return. CI forces each one from the Prism mock with the
`Prefer: code=...` header and compares the body with the example in the spec.

| Operation | Success | Errors: status and `code` |
|---|---|---|
| `POST /api/v1/evaluate` | 200 | 400 `category_mismatch`, 400 `validation_failed`, 401 `unauthorized`, 404 `problem_not_found`, 422 `evaluation_refused`, 429 `rate_limited`, 500 `internal_error`, 502 `ai_incomplete`, 503 `ai_unavailable` |
| `GET /api/v1/problems` | 200 | 400 `validation_failed`, 401 `unauthorized`, 429 `rate_limited`, 500 `internal_error` |
| `GET /api/v1/problems/{id}` | 200 | 401 `unauthorized`, 404 `problem_not_found`, 429 `rate_limited`, 500 `internal_error` |
| `POST /api/v1/submissions` | 201 | 400 `validation_failed`, 401 `unauthorized`, 404 `problem_not_found`, 409 `idempotency_conflict`, 429 `rate_limited`, 500 `internal_error` |
| `GET /api/v1/categories` | 200 | 401 `unauthorized`, 429 `rate_limited`, 500 `internal_error` |

Every error body has the same shape: `code` (machine-readable), `error` (message in Mongolian), and `requestId` (for
tracing). Validation errors add `fields`, a list of each invalid field. `429` carries a `Retry-After` header in seconds.

Schemas: `Problem`, `EvaluationRequest`, `EvaluationResponse`, `Submission`, `ErrorResponse`, plus `Evaluation`,
`EvaluationIssue`, `ProblemSummary`, `ProblemListResponse`, `Category`, `CategoryRef`, `CategoryListResponse`,
`SubmissionCreateRequest`, `FieldError`, and the enums `CategorySlug`, `Difficulty`, `AnswerType`, `SubmissionStatus`,
and `ErrorCode`.

The field names, enums, status codes, and error messages follow the diploma project's real code: the Prisma schema,
the `EvaluationSchema` in `lib/ai/evaluate.ts`, and the `/api/evaluate` route. The example data comes from its seed
database. The two GET endpoints have no request body, so their request examples are the parameter examples
(`category=math`, `difficulty=MEDIUM`, `id=limit-sin`).

## The four good practices from the lecture

| Practice | Where it is in the spec |
|---|---|
| 1. Realistic examples, success and error | Every response has an example. Named `examples` where there is more than one case. |
| 2. Explicit error codes | The table above. A test also reads the real route handler and fails if it returns a status that the spec does not document. |
| 3. Version in the URL | Every path starts with `/api/v1/`. The server URL does not repeat the version. |
| 4. Changelog at every endpoint | `x-changelog` on each operation: version, date, what changed, and why. Swagger UI shows the extension. Redoc does not show operation-level extensions, so each description repeats the list, and a test keeps the two identical. |

## Versioning, and the failing test on an old path

The strategy is the path prefix (lecture, strategy A). A breaking change gets `/api/v2/...` and both versions stay
online. An additive change keeps the prefix and raises the minor version. That is what 1.1.0 did: new fields in error
bodies, new documented error codes, no removed or renamed field.

Before 1.0.0 the endpoint was the unversioned `POST /api/evaluate`. The contract dropped that path, which is a breaking
change, so the prefix `/api/v1` was introduced with it. The test
`test_the_old_unversioned_evaluate_path_still_answers` sends a valid request to the old path and asserts `200`. It
gets `404` and fails. The test is marked as an expected failure, so CI reports it and stays green:

```text
test_the_old_unversioned_evaluate_path_still_answers ... expected failure
OK (expected failures=1)
```

If that test ever passes, an unversioned path has come back without the contract saying so, and CI turns red.

## The six pitfalls and the gate against each

| Pitfall | Gate |
|---|---|
| 01 Cargo-cult Swagger 2.0 | `openapi: 3.0.3`, 19 schemas under `components`, linted with the Redocly `recommended` rules |
| 02 Vague description | Lint rule `operation-description: error`. Each description says what the call does, what it needs, and how it fails |
| 03 Success-only | Lint rule `operation-4xx-response: error`. The contract test requires an error example, `401`, and `429` on every operation |
| 04 Over-confident spec | `test_the_spec_documents_every_status_the_real_route_returns` compares the spec with the handler's code |
| 05 Lying example | Lint rule `no-invalid-media-type-examples: error`. `test_lint_rejects_a_lying_example` changes a score to `eighty-two` and checks that lint fails |
| 06 Real secrets in examples | The only token is the placeholder `your_student_jwt_from_login`. `test_examples_contain_no_real_secrets` scans for JWTs and API keys |

## Spec, render, publish: the gate at each step

| Step | Gate in CI |
|---|---|
| Author | `redocly lint` with 0 errors and 0 warnings. `openapi.json` must equal the bundle of `openapi.yaml` |
| Render | Redoc and Swagger UI are both built from the same file on every push. The contract tests run against the mock first |
| Publish | The site is deployed to the latest URL and to one pinned URL per `api-v*` tag. After the deployment, CI fetches `spec-version.json` from the live site and fails if it is not the commit that was just built |

## Definition of Done

- [x] OpenAPI 3.0 YAML spec committed and passing `redocly lint` with **0 errors, 0 warnings**
- [x] Swagger UI sandbox with a working "Try it out", tested against the Prism mock: [`public/swagger/`](../../public/swagger/index.html)
- [x] Redoc three-panel reference with navigation and search, built by CI
- [x] Both renderers live on GitHub Pages, at the latest and the pinned URLs above
- [x] Code sample audit scorecard with an average of **4.73 / 5.0** (≥ 4.0 required)
- [x] 100-word decision report comparing Swagger UI and Redoc
- [x] M5: build-verified examples, one success and every error per endpoint
- [x] M5: 150-word comparison write-up naming the renderer we keep
- [x] M5: one failing test on an old path

## Reproduce locally

```bash
npx @redocly/cli@2.56.0 lint docs/openapi/openapi.yaml           # 1. lint
npx @stoplight/prism-cli@5.16.0 mock docs/openapi/openapi.yaml   # 2. mock server (keep it running)
python scripts/verify_code_samples.py                            # 3. run the samples against the mock
python -m unittest discover -s scripts -v                        # 4. contract tests
```
