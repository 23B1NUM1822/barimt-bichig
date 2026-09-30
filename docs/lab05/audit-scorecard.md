# Bhatti 5-principles audit scorecard

**US-5.2.** Bhatti et al., *Docs for Developers*, Ch. 5 (pp. 86–94). Audited samples:
[`docs/code-samples/README.md`](../code-samples/README.md).

## Scorecard

| Endpoint | Explained (1-5 ★) | Concise (1-5 ★) | Clear (1-5 ★) | Usable (1-5 ★) | Trustworthy (1-5 ★) | Audit Notes & Fixes Applied |
|---|---|---|---|---|---|---|
| `POST /api/v1/evaluate` | ★★★★★ 5 | ★★★★☆ 4 | ★★★★★ 5 | ★★★★★ 5 | ★★★★☆ 4 | **Fix (Concise):** the 54-line TypeScript answer is read from `payment_processor.ts` instead of being pasted into the script as a string. **Fix (Usable):** added `timeout=60`. `requests` has no default timeout, so a stalled connection would hang forever, and 60 s matches the server's limit for an AI review. **Fix (Trustworthy):** the first run printed a *different* review (the `limit-sin` one) because Prism served the schema-level `example`; schema examples now alias the operation examples. **−1 Concise:** the imports and two setup lines are kept so the script still runs when copied. **−1 Trustworthy:** the payload is verified against the mock, but the AI wording has not been captured from the live model yet because `/api/v1` is not deployed. |
| `GET /api/v1/problems` | ★★★★★ 5 | ★★★★★ 5 | ★★★★★ 5 | ★★★★★ 5 | ★★★★★ 5 | **Fix (Usable):** added a comment that `difficulty` is upper-case (`EASY`, `MEDIUM`, `HARD`). Lower-case `medium` returns `400`, which the prose after the sample documents. **Fix (Trustworthy):** the first run returned one problem (`total: 1`) instead of two, for the same schema-example reason; fixed. Problem IDs and titles come from the platform's seed database (`log-diff-extrema`, `limit-sin`). Filters live in a named `problem_filters` dict instead of a hand-built query string. |
| `POST /api/v1/submissions` | ★★★★★ 5 | ★★★★☆ 4 | ★★★★★ 5 | ★★★★☆ 4 | ★★★★★ 5 | **Fix (Clear):** the score and feedback are named variables (`evaluation_score`, `evaluation_feedback`) with a comment saying which `evaluate` fields they come from, not bare literals inside the payload. **Fix (Trustworthy):** the first run returned the `limit-sin` submission; fixed. The `201` status and body are verified in CI, and Prism also validated the request body against `SubmissionCreateRequest`. **−1 Concise:** the feedback string takes 6 lines. **−1 Usable:** the reader copies `score` and `feedback` from sample 1 by hand. Chaining both calls in one script would break the one-sample, one-call rule. |
| **Average** | **5.00** | **4.33** | **5.00** | **4.67** | **4.67** | **Overall: 71 / 75 stars = 4.73 / 5.0 (94.7 %)**, above the 4.0 / 80 % Definition of Done threshold. |

## How each principle was checked

| Principle | Check applied to every sample | Evidence |
|---|---|---|
| **Explained** (p. 87) | 1–2 sentences before the code state what it does and what it assumes (input file, token, filters). | Prose above each block in the samples README. |
| **Concise** (p. 90) | Only the payload and the request call. No classes, argument parsing, retries, or logging. | 18–34 lines per sample. |
| **Clear** (p. 92) | Descriptive names (`auth_token`, `review_response`, `problems_response`, `submission_payload`), no single-letter variables, PEP 8 indentation. | Code review of the three files. |
| **Usable** (p. 93) | Runs after copy-paste. Domain placeholders only: `your_student_jwt_from_login`, `polymorphic-refactor`, `payment_processor.ts`. No `foo`, `bar`, or `test`. | `scripts/verify_code_samples.py` fails the build if `foo`, `bar`, `baz`, `qux`, or `test` appears in a sample, or `foo`/`bar`/`baz`/`qux` in the spec. |
| **Trustworthy** (p. 94) | Each documented response is the real output of running the sample against the Prism mock of `openapi.yaml`. | The CI job `Lint spec & run code samples` re-runs all three samples on every push and fails if the code or response in the README differs from the file or the server. This covers the lab's +10% bonus (Bhatti p. 96). |

## What the audit caught

Running the samples, instead of only reading them, found one real defect. All three documented responses were first
wrong because Prism prefers a schema's own `example` over the operation's named `examples`.
The reader would have seen a `GET /problems/limit-sin` call return `binary-search`. The fix makes the two sources
identical with YAML anchors (`example: *limitSinProblem`), so Redoc, Swagger UI, and the mock all show the same payload.
