# Use-Verify-Cite log (US-6.3)

Every statement from the AI draft ([`ai_docstring.ts`](ai_docstring.ts)) that was a candidate for the final
docstrings. **Use** is what the AI wrote. **Verify** is the check that was run. **Cite** is the place in the real
code that settles it.

**Result: 3 invented API elements, 3 wrong or unsupported statements, 4 statements confirmed.**

## Invented API elements ("ghost APIs")

| # | Use: what the AI wrote | Verify: how it was checked | Cite: source of truth | Verdict |
|---|---|---|---|---|
| **H1** | The category slug `"mathematics"`: `@param category - ... (e.g., "programming", "mathematics")` | `npm run test:hallucinations` compares it with the real module list by reflection: `category slug does not exist: mathematics` | `lib/modules.ts:36`: `"programming" \| "math" \| "architecture" \| "languages"` | **Invented value.** The real slug is `math`. Rejected. |
| **H2** | The difficulty values `"easy"` and `"medium"` in three examples | `tsc --noEmit` on the example: `TS2820: Type '"easy"' is not assignable to type 'Difficulty'. Did you mean '"EASY"'?` The reflection test reports the same against the Prisma enum. | `prisma/schema.prisma:19-23`: `enum Difficulty { EASY MEDIUM HARD }` | **Invented values.** Replaced by loading a real problem (correction C2). |
| **H3** | `{@link buildSystemPrompt}` and `{@link buildUserMessage}` in the public docstring of `evaluateSubmission`, presented as related APIs | TypeDoc in strict mode: `The comment for evaluateSubmission links to "buildSystemPrompt" which was resolved but is not included in the documentation`. The reflection test: `link to a private symbol`. | `lib/ai/evaluate.ts:194` and `:204`: both are declared without `export` | **Ghost public API.** A reader would look for functions they cannot import. Links removed (correction C4). |

## Wrong or unsupported statements

| # | Use: what the AI wrote | Verify: how it was checked | Cite: source of truth | Verdict |
|---|---|---|---|---|
| **W1** | "Implements server-side fallback for robust structured output parsing" | Read the request options and the comment above them | `lib/ai/evaluate.ts:301-303`: "If a safety classifier declines, the API retries on a recommended fallback model." | **Wrong.** Rewritten (correction C1). |
| **W2** | "relies on `personaFor` which may throw if category is invalid" | Ran `personaFor("mathematics")`: it returned `undefined` and did not throw | `lib/ai/personas.ts:76`: a `switch` with four cases and no `default` | **Wrong.** The real failure is a `TypeError` later, now documented (correction C5). |
| **W3** | `EvaluationRefusedError` is raised "typically due to inappropriate content" | Read the only place that throws it | `lib/ai/evaluate.ts:308`: `if (response.stop_reason === "refusal")` | **Unsupported.** The code does not know the reason. Removed. |

## Confirmed statements

| # | Use: what the AI wrote | Verify: how it was checked | Cite: source of truth | Verdict |
|---|---|---|---|---|
| **T1** | "Uses Claude Opus 5" | Read the constant | `lib/ai/evaluate.ts:17`: `const MODEL = "claude-opus-5"` | True. Used in `@remarks`. |
| **T2** | "Max tokens set to 16000", "adaptive thinking" | Read the request options | `lib/ai/evaluate.ts:295-296` | True. Used in `@remarks`. |
| **T3** | "Automatically clamps scores to valid 0-100 range" | Read the return statement | `lib/ai/evaluate.ts:316`: `Math.round(Math.min(100, Math.max(0, evaluation.score)))` | True. Also rounds, which the AI left out. |
| **T4** | `EvaluationSchema.parse(data)` in an example | Reflection at runtime: `"parse" in EvaluationSchema` | The test's check 3 ("member does not exist") reports nothing for it | True. |

## How to repeat the checks

```bash
cd lab06
npm ci
npm run test:hallucinations   # reflection test: 0 findings in the final docstrings, 14 in the AI draft
npm run check:examples        # compiles all 28 examples of the final docstrings
npm run docs                  # TypeDoc, warnings are errors
```

The full list of 14 findings that the reflection test prints for the AI draft:

```text
MODEL: example uses a private symbol: MODEL
getClient: example uses a private symbol: getClient
GRADING_RULES: link to a private symbol: buildSystemPrompt
GRADING_RULES: example uses a private symbol: GRADING_RULES
GRADING_RULES: example uses a private symbol: buildSystemPrompt
buildSystemPrompt: example uses a private symbol: buildSystemPrompt
buildSystemPrompt: difficulty does not exist: medium
buildSystemPrompt: category slug does not exist: mathematics
buildUserMessage: link to a private symbol: buildSystemPrompt
buildUserMessage: example uses a private symbol: buildUserMessage
buildUserMessage: difficulty does not exist: medium
evaluateSubmission: link to a private symbol: buildSystemPrompt
evaluateSubmission: link to a private symbol: buildUserMessage
evaluateSubmission: difficulty does not exist: easy
```

Eleven of the 14 sit in docstrings of private symbols. The prompt asked for those docstrings, and the final code
does not keep them. The three on the public `evaluateSubmission` are the ones a reader of the published reference
would hit: two ghost links and the invented `"easy"`.
