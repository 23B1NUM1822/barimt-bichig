# Docstring quality checklist (US-6.1)

Six checks per public symbol, taken from the US-6.1 acceptance criteria (Chinchilla Ch. 7; the consistent
domain example is pp. 89–90). The table is generated from TypeDoc's JSON output, not filled in by hand.

**Result: 28 public symbols in 7 modules. Every one has a description and a compiled example.**

| Check | What it means | Result |
|---|---|---|
| 1. Description | A summary sentence says what the symbol is for | 28/28 |
| 2. Parameters | Every parameter has a description | 10/10 functions |
| 3. Return value | `@returns` says what comes back, including the empty or `null` case | 10/10 functions |
| 4. Errors | `@throws` for each error, or an explicit "never throws" | 10/10 functions |
| 5. Example | A realistic `@example` that type-checks (`npm run check:examples`) | 28/28 |
| 6. Consistent domain | The example uses the shared scenario: a Python answer to the `binary-search` problem | 25/28 |

The 3 symbols outside the shared scenario are `modules`, `siteConfig`, `ChatMessage`. They are not about a
problem (a chat message, the module list, the site name), so forcing `binary-search` into them would mislead.

## Per-symbol results

| Module | Symbol | Kind | Description | Parameters | Returns | Errors | Example | Consistent domain |
|---|---|---|:-:|:-:|:-:|:-:|:-:|:-:|
| `app/api/evaluate/route` | `maxDuration` | variable | ✓ | n/a | n/a | n/a | ✓ | ✓ |
| `app/api/evaluate/route` | `POST` | function | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `lib/ai/evaluate` | `evaluateSubmission` | function | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `lib/ai/evaluate` | `Evaluation` | type | ✓ | n/a | n/a | n/a | ✓ | ✓ |
| `lib/ai/evaluate` | `EvaluationIncompleteError` | class | ✓ | n/a | n/a | n/a | ✓ | ✓ |
| `lib/ai/evaluate` | `EvaluationRefusedError` | class | ✓ | n/a | n/a | n/a | ✓ | ✓ |
| `lib/ai/evaluate` | `EvaluationSchema` | variable | ✓ | n/a | n/a | n/a | ✓ | ✓ |
| `lib/ai/personas` | `Effort` | type | ✓ | n/a | n/a | n/a | ✓ | ✓ |
| `lib/ai/personas` | `Persona` | type | ✓ | n/a | n/a | n/a | ✓ | ✓ |
| `lib/ai/personas` | `personaFor` | function | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `lib/modules` | `getModule` | function | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `lib/modules` | `LearningModule` | type | ✓ | n/a | n/a | n/a | ✓ | ✓ |
| `lib/modules` | `modules` | variable | ✓ | n/a | n/a | n/a | ✓ | ✗ |
| `lib/modules` | `ModuleSlug` | type | ✓ | n/a | n/a | n/a | ✓ | ✓ |
| `lib/modules` | `siteConfig` | variable | ✓ | n/a | n/a | n/a | ✓ | ✗ |
| `lib/prisma` | `prisma` | variable | ✓ | n/a | n/a | n/a | ✓ | ✓ |
| `lib/problems` | `getProblem` | function | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `lib/problems` | `getProblemsByCategory` | function | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `lib/problems` | `ProblemWithCategory` | type | ✓ | n/a | n/a | n/a | ✓ | ✓ |
| `lib/problems` | `toWorkspaceProblem` | function | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `lib/problems` | `workspaceFor` | function | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `lib/problems` | `WorkspaceKind` | type | ✓ | n/a | n/a | n/a | ✓ | ✓ |
| `lib/problems` | `WorkspaceProblem` | type | ✓ | n/a | n/a | n/a | ✓ | ✓ |
| `lib/tutor` | `ChatMessage` | type | ✓ | n/a | n/a | n/a | ✓ | ✗ |
| `lib/tutor` | `evaluationToTutorResponse` | function | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `lib/tutor` | `mockTutorResponse` | function | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `lib/tutor` | `TutorRequest` | type | ✓ | n/a | n/a | n/a | ✓ | ✓ |
| `lib/tutor` | `TutorResponse` | type | ✓ | n/a | n/a | n/a | ✓ | ✓ |

`n/a`: types, constants, and classes have no parameters, return value, or thrown errors of their own.

## Internal helpers excluded from the public API

These symbols are not exported, so TypeDoc leaves them out. Each has a comment in the code that says why.

| Symbol | Where | Why it is internal |
|---|---|---|
| `MODEL` | `lib/ai/evaluate.ts:16` | Callers never choose the model. Change it here only. |
| `client` | `lib/ai/evaluate.ts:156` | The Anthropic client is created lazily and reused, so importing this module never fails when the API key is missing. Only evaluateSubmission may call it. |
| `GRADING_RULES` | `lib/ai/evaluate.ts:175` | Prompt text shared by every persona. Exposing it would let callers build prompts that skip the injection and answer-secrecy rules below. |
| `buildSystemPrompt` | `lib/ai/evaluate.ts:193` | Prompt assembly is an implementation detail of evaluateSubmission. |
| `buildUserMessage` | `lib/ai/evaluate.ts:203` | It fences untrusted student text, so it must not be bypassed. |
| `DEMO_NOTE` | `lib/tutor.ts:163` | Footer text that marks demo replies. Only mockTutorResponse uses it. |
| `globalForPrisma` | `lib/prisma.ts:9` | A slot on globalThis that keeps the client alive across hot reloads in development, so we don't exhaust DB connections. |
| `createClient` | `lib/prisma.ts:13` | Import the shared `prisma` instead of creating more clients. |
| `BodySchema` | `app/api/evaluate/route.ts:29` | The request contract is documented on POST below. |
| `error` | `app/api/evaluate/route.ts:38` | Builds the `{ error }` body that every failure returns. |
