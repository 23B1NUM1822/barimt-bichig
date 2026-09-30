# Lab 05: OpenAPI 3.0 & Bhatti code samples

**Software Project Documentation · Week 05 · National University of Mongolia**
Student: T. Sodnomdamba (23B1NUM1822) · Guiding project: *AI-Powered Code Reviewer & Practice Platform* (diploma project)

## Deliverables

| Phase | User story | Deliverable |
|---|---|---|
| 1. OpenAPI 3.0.3 specification | US-5.1 | [`docs/openapi/openapi.yaml`](../openapi/openapi.yaml): 5 endpoints, Bearer JWT, 17 reusable schemas, examples on every request and response |
| 2. Three Python code samples | US-5.2 | [`docs/code-samples/README.md`](../code-samples/README.md) and the `.py` files next to it |
| 3. Bhatti 5-principles audit scorecard | US-5.2 | [`audit-scorecard.md`](audit-scorecard.md): **4.73 / 5.0** average |
| 4. Decision report & CLI commands | US-5.3, US-5.4 | [`decision-report.md`](decision-report.md): 100-word report and exact commands |
| Bonus (+10%) | Bhatti p. 96 | [`.github/workflows/api-docs.yml`](../../.github/workflows/api-docs.yml) runs every code sample in CI |

## Endpoints

| Method & path | Purpose | Responses |
|---|---|---|
| `POST /api/v1/evaluate` | AI review of an answer | 200, 400, 401, 404, 422, 429, 500, 502, 503 |
| `GET /api/v1/problems` | List problems, filtered by `category` and `difficulty` | 200, 400, 401, 500 |
| `GET /api/v1/problems/{id}` | Full problem statement and starter code | 200, 401, 404, 500 |
| `POST /api/v1/submissions` | Save an answer with its AI score | 201, 400, 401, 404, 500 |
| `GET /api/v1/categories` | The 4 learning modules | 200, 401, 500 |

Schemas: `Problem`, `EvaluationRequest`, `EvaluationResponse`, `Submission`, `ErrorResponse`, plus `Evaluation`,
`EvaluationIssue`, `ProblemSummary`, `ProblemListResponse`, `Category`, `CategoryRef`, `CategoryListResponse`,
`SubmissionCreateRequest`, and the enums `CategorySlug`, `Difficulty`, `AnswerType`, and `SubmissionStatus`.

The field names, enums, and error messages follow the diploma project's real code: the Prisma schema, the
`EvaluationSchema` in `lib/ai/evaluate.ts`, and the `/api/evaluate` route. The example data comes from its seed
database. The two GET endpoints have no request body, so their request examples are the parameter examples
(`category=math`, `difficulty=MEDIUM`, `id=limit-sin`).

## Definition of Done

- [x] OpenAPI 3.0 YAML spec committed and passing `redocly lint` with **0 errors, 0 warnings**
- [x] Swagger UI sandbox with a working "Try it out", tested against the Prism mock: [`public/swagger/`](../../public/swagger/index.html)
- [x] Redoc three-panel reference with navigation and search, built by CI into `public/index.html`
- [ ] Both renderers live on GitHub Pages (deployed by CI once Pages is enabled for the repository)
- [x] Code sample audit scorecard with an average of **4.73 / 5.0** (≥ 4.0 required)
- [x] 100-word decision report comparing Swagger UI and Redoc

## Reproduce locally

```bash
npx @redocly/cli@2.56.0 lint docs/openapi/openapi.yaml           # 1. lint
npx @stoplight/prism-cli@5.16.0 mock docs/openapi/openapi.yaml   # 2. mock server (keep it running)
python scripts/verify_code_samples.py                            # 3. run the samples against the mock
```
