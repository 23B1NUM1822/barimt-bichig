# Manual vs. AI docstring audit (US-6.3, UE-6 phase b)

Bhatti et al., *Docs for Developers*, Ch. 5. Module under audit: `lib/ai/evaluate.ts`, the platform's
primary public API (`evaluateSubmission`, `EvaluationSchema`, `Evaluation`, and two error classes).

| Version | File | How it was produced |
|---|---|---|
| Manual | [`manual_docstring.ts`](manual_docstring.ts) | Written with the whole repository open, then checked with `tsc` and TypeDoc |
| AI | [`ai_docstring.ts`](ai_docstring.ts) | Claude Haiku 4.5, one prompt, given only this file with its comments removed. Output kept as generated |
| Diff | [`manual_vs_ai.diff`](manual_vs_ai.diff) | `diff -u manual_docstring.ts ai_docstring.ts` (480 lines) |
| Final | [`../lib/ai/evaluate.ts`](../lib/ai/evaluate.ts) | Manual version plus the corrected AI passages listed below |

The code in all three files is identical. Only the comments differ. One edit was made to the AI output: the
`GRADING_RULES` text, which the prompt had shortened, was put back so that the diff shows docstrings only.

**The prompt.** "Add complete TSDoc docstrings to this TypeScript module from a Next.js learning platform. For every
exported symbol AND every internal function/constant, write: a description, @param for each parameter, @returns,
@throws for every possible error, a realistic @example showing how a caller would use it, and @see / {@link}
references to related APIs where helpful."

## Audit matrix

| Principle | Manual | AI | Evidence for the AI score |
|---|:-:|:-:|---|
| **Explained** | ★★★★★ 5 | ★★★★☆ 4 | Every symbol has a description. Several only restate the name ("TypeScript type representing a complete evaluation") or add sales language ("ensures advanced reasoning capabilities"). |
| **Concise** | ★★★★☆ 4 | ★★☆☆☆ 2 | 383 lines against 305. The seven evaluation fields are listed three times (schema, type, `@returns`). Every docstring ends with `@see` links back to its neighbours. |
| **Clear** | ★★★★★ 5 | ★★★☆☆ 3 | `language` is called a "problem domain specifier". `@throws {Error}` does not say which error. "typically due to inappropriate content" is a guess presented as fact. |
| **Usable** | ★★★★★ 5 | ★★☆☆☆ 2 | The main example does not compile: 2 `tsc` errors (see C2). 5 of the 10 examples call private symbols that a caller cannot import. Two examples contain `evaluateSubmission({...})`. |
| **Trustworthy** | ★★★★★ 5 | ★★☆☆☆ 2 | 14 findings from `test_ai_hallucinations.ts`: invented enum values, links to private symbols, and one wrong description of what the code does (see the Use-Verify-Cite log). |
| **Average** | **4.8** | **2.6** | |

Manual loses one star on Concise: the `evaluateSubmission` docstring is 44 lines, most of it the example and the
four `@throws` entries.

**A fair reading of the gap.** The AI saw one file. It could not know the real category slugs, the Prisma enums, or
the error handling in `route.ts`, so it filled those gaps with plausible values instead of saying it did not know.
The manual version had the whole repository and compiler feedback. The audit therefore measures what happens when
AI output is merged without verification. It does not show that an AI cannot write these docstrings.

## Corrections applied to the AI text

| # | AI wrote | Problem | Corrected text in the final docstring |
|---|---|---|---|
| **C1** | "Implements server-side fallback for robust structured output parsing" | Wrong. The fallback retries on another model when a safety classifier declines (`lib/ai/evaluate.ts:301-303`). It has nothing to do with parsing. | "If a safety classifier declines the request, the API retries it on a fallback model (`fallbacks: "default"`). The fallback has nothing to do with parsing the structured output." |
| **C2** | `problem: { category: { slug: "programming" }, title: "Palindrome Checker", difficulty: "easy", ... }` | Does not compile. `TS2820: Type '"easy"' is not assignable to type 'Difficulty'. Did you mean '"EASY"'?` and `TS2739: ... missing the following properties ...: name, id`. | `const problem = await getProblem("binary-search");` followed by a null check. The example now compiles in CI. |
| **C3** | `@throws {Error} When the Anthropic API call fails or network issues occur` | Too vague to handle. The route distinguishes four SDK errors (`app/api/evaluate/route.ts:135-141`). | ``@throws `Anthropic.APIError` ... Subclasses include `RateLimitError`, `AuthenticationError`, and `APIConnectionError`.`` |
| **C4** | `@see {@link buildSystemPrompt}` and `@see {@link buildUserMessage}` on the public `evaluateSubmission` | Both are private. TypeDoc reports "links to "buildSystemPrompt" which was resolved but is not included in the documentation", which fails the zero-warning build. | Links removed. The helpers carry an "Internal, not part of the public API" comment instead. |
| **C5** | "relies on `personaFor` which may throw if category is invalid" | False. `personaFor("mathematics")` returns `undefined` and does not throw (ran it). The failure appears later as a `TypeError`. | ``@throws `TypeError` `problem.category.slug` is not one of the four module slugs, so no persona exists for it.`` |

## AI passages accepted

| # | AI wrote | Verified against | Merged as |
|---|---|---|---|
| **A1** | `@see` cross-links between `EvaluationRefusedError` and `EvaluationIncompleteError` | Both classes are exported (`npm run test:hallucinations`) | `@see` on each class, with the reason added: one failure is safe to retry and the other is not |
| **A2** | "Uses Claude Opus 5", "adaptive thinking", "Max tokens set to 16000" | `lib/ai/evaluate.ts:17`, `:296`, `:295` | The `@remarks` block of `evaluateSubmission` |
| **A3** | "Automatically clamps scores to valid 0-100 range" | `lib/ai/evaluate.ts:316` | Already in the manual text ("rounded and clamped to 0-100") |

## AI passages rejected

- Docstrings and examples for the private symbols `MODEL`, `client`, `getClient`, `GRADING_RULES`,
  `buildSystemPrompt`, and `buildUserMessage`. The prompt asked for them, but they describe an API that callers do
  not have. The final code marks these symbols as internal instead.
- "A numeric score (0-100) with clamped value" on the `Evaluation` type. The type does not clamp anything. Only
  `evaluateSubmission` does.
- "typically due to inappropriate content" on `EvaluationRefusedError`. The code only checks
  `stop_reason === "refusal"` (`lib/ai/evaluate.ts:308`) and knows nothing about the reason.
