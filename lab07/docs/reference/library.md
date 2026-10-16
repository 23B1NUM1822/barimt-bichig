# Library functions

Server-side TypeScript functions under `lib/`. Import them with the `@/` path alias, for example
`import { getProblem } from "@/lib/problems"`. All of them run on the server only. Several read private grading data,
so never pass their results to the browser unfiltered.

The generated [TypeDoc reference](https://23b1num1822.github.io/barimt-bichig/api/) from Lab 06 has the same symbols
with type details, source links, and longer examples that CI compiles against the real code.

## All public symbols

| Symbol | Kind | Module | Entry |
|---|---|---|---|
| `evaluateSubmission` | function | `lib/ai/evaluate` | [evaluateSubmission](#evaluatesubmission) |
| `EvaluationSchema` | Zod schema | `lib/ai/evaluate` | [Evaluation](http-api.md#the-evaluation-object) |
| `Evaluation` | type | `lib/ai/evaluate` | [Evaluation](http-api.md#the-evaluation-object) |
| `EvaluationRefusedError` | error class | `lib/ai/evaluate` | [evaluateSubmission](#evaluatesubmission) |
| `EvaluationIncompleteError` | error class | `lib/ai/evaluate` | [evaluateSubmission](#evaluatesubmission) |
| `personaFor` | function | `lib/ai/personas` | [personaFor](#personafor) |
| `Persona`, `Effort` | types | `lib/ai/personas` | [personaFor](#personafor) |
| `getProblem` | function | `lib/problems` | [getProblem](#getproblem) |
| `getProblemsByCategory` | function | `lib/problems` | [getProblemsByCategory](#getproblemsbycategory) |
| `toWorkspaceProblem` | function | `lib/problems` | [toWorkspaceProblem](#toworkspaceproblem) |
| `workspaceFor` | function | `lib/problems` | [workspaceFor](#workspacefor) |
| `ProblemWithCategory`, `WorkspaceProblem`, `WorkspaceKind` | types | `lib/problems` | [getProblem](#getproblem) |
| `evaluationToTutorResponse` | function | `lib/tutor` | [evaluationToTutorResponse](#evaluationtotutorresponse) |
| `mockTutorResponse` | function | `lib/tutor` | [mockTutorResponse](#mocktutorresponse) |
| `TutorRequest`, `TutorResponse`, `ChatMessage` | types | `lib/tutor` | [Server action askTutor](server-action.md) |
| `getModule` | function | `lib/modules` | [getModule](#getmodule) |
| `modules`, `siteConfig`, `ModuleSlug`, `LearningModule` | constants and types | `lib/modules` | [getModule](#getmodule) |
| `prisma` | database client | `lib/prisma` | [Data model](data-model.md) |
| `POST`, `maxDuration` | route handler | `app/api/evaluate/route` | [HTTP API](http-api.md) |

## evaluateSubmission

```ts
evaluateSubmission(input: {
  problem: ProblemWithCategory;
  userAnswer: string;
  language?: string;
}): Promise<Evaluation>
```

Grades one answer with the AI reviewer. The reviewer persona comes from `problem.category.slug`. The problem's
`expectedOutput` and `aiSystemPrompt` go to the model as private grading material and are not returned. Nothing is saved.

**Prerequisites:** `ANTHROPIC_API_KEY` is set. `problem` comes from [`getProblem`](#getproblem).

| Parameter | Type | Required | Description |
|---|---|---|---|
| `input.problem` | `ProblemWithCategory` | Yes | The problem with its category |
| `input.userAnswer` | `string` | Yes | The answer as the student typed it. The length is not checked here |
| `input.language` | `string` | No | Programming language of a code answer, for example `"python"` |

**Returns:** an [`Evaluation`](http-api.md#the-evaluation-object) with `score` rounded and clamped to 0 to 100.

| Error | When | Retry? |
|---|---|---|
| `EvaluationRefusedError` | The model declined to grade the answer | No |
| `EvaluationIncompleteError` | The model ran out of tokens or returned no valid evaluation | Yes |
| `Anthropic.APIError` and its subclasses `RateLimitError`, `AuthenticationError`, `APIConnectionError` | The Anthropic API call failed | Depends on the subclass |
| `TypeError` | `problem.category.slug` is not one of the four module slugs | No |
| An SDK error about the missing key | `ANTHROPIC_API_KEY` is empty | After setting the key |

```ts
import { evaluateSubmission } from "@/lib/ai/evaluate";
import { getProblem } from "@/lib/problems";

const problem = await getProblem("binary-search");
if (!problem) throw new Error("Бодлого олдсонгүй.");

const evaluation = await evaluateSubmission({
  problem,
  userAnswer: "def search(nums, target):\n    return nums.index(target)",
  language: "python",
});
console.log(evaluation.score, evaluation.verdict);
```

**Used in:** [Enable real AI grading](../how-to/enable-ai-grading.md).

## getProblem

```ts
getProblem(id: string): Promise<ProblemWithCategory | null>
```

Loads one problem and its category. The result includes the private fields `expectedOutput` and `aiSystemPrompt`.
Convert it with [`toWorkspaceProblem`](#toworkspaceproblem) before sending anything to the browser.

**Prerequisites:** `DATABASE_URL` points to a migrated database.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `id` | `string` | Yes | Problem ID, for example `"binary-search"` |

**Returns:** the problem with its `category`, or `null` when no problem has this ID.

| Error | When |
|---|---|
| The database client's error (the promise rejects) | The query fails, for example because the database is unreachable |

```ts
import { getProblem } from "@/lib/problems";

const problem = await getProblem("binary-search");
if (problem) console.log(problem.difficulty, problem.codeLanguage); // "MEDIUM" "python"
else console.log("Бодлого олдсонгүй.");
```

**Used in:** [Add a practice problem](../how-to/add-a-practice-problem.md#verify).

## getProblemsByCategory

```ts
getProblemsByCategory(slug: string): Promise<ProblemWithCategory[]>
```

Lists every problem in one module, sorted by difficulty (`EASY`, then `MEDIUM`, then `HARD`) and then by creation
time.

**Prerequisites:** `DATABASE_URL` points to a migrated database.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `slug` | `string` | Yes | Module slug, for example `"programming"` |

**Returns:** the problems with their category. The list is empty when the slug matches no category.

| Error | When |
|---|---|
| The database client's error (the promise rejects) | The query fails |

```ts
import { getProblemsByCategory } from "@/lib/problems";

const problems = await getProblemsByCategory("programming");
console.log(problems.map((p) => p.id)); // ["binary-search", "polymorphic-refactor"]
```

**Used in:** [Add a practice problem](../how-to/add-a-practice-problem.md) (a new problem appears in its module's list).

## toWorkspaceProblem

```ts
toWorkspaceProblem(p: ProblemWithCategory): WorkspaceProblem
```

Keeps only the fields that are safe to send to the browser: `id`, `starterCode`, `codeLanguage`, and `categorySlug`.

**Prerequisites:** none.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `p` | `ProblemWithCategory` | Yes | The full problem from `getProblem` |

**Returns:** a new `WorkspaceProblem` object. **Errors:** never throws.

## workspaceFor

```ts
workspaceFor(categorySlug: string): "code" | "math" | "language"
```

Decides which editor a problem gets: `programming` and `architecture` give `code`, `math` gives `math`, and
`languages` gives `language`.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `categorySlug` | `string` | Yes | The problem's category slug |

**Returns:** the workspace kind. An unknown slug gives `"code"`. **Errors:** never throws.

**Used in:** [Add a practice problem](../how-to/add-a-practice-problem.md) (the `category` you choose decides the editor).

## personaFor

```ts
personaFor(category: "programming" | "math" | "architecture" | "languages"): Persona
```

Returns the reviewer that the AI plays for a module.

| `category` | Role | Effort |
|---|---|---|
| `programming` | a Senior Software Engineer doing a code review | `high` |
| `architecture` | a Computer Architecture professor and digital hardware engineer | `high` |
| `math` | a Mathematics professor grading a student's written solution | `high` |
| `languages` | a friendly native English teacher | `medium` |

**Returns:** `{ role: string; instructions: string; effort: Effort }`. **Errors:** never throws. A value outside the
four slugs, forced in by a type cast, returns `undefined`.

## evaluationToTutorResponse

```ts
evaluationToTutorResponse(e: Evaluation): TutorResponse
```

Turns an AI evaluation into the Markdown shown in the review panel: the summary in bold, the issues as a numbered list,
the feedback, the corrected text if there is one, and the next step.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `e` | `Evaluation` | Yes | The result of `evaluateSubmission` |

**Returns:** `{ score, markdown }`. **Errors:** never throws.

**Used in:** [Enable real AI grading](../how-to/enable-ai-grading.md) (this is how a real review is displayed).

## mockTutorResponse

```ts
mockTutorResponse(problem: ProblemWithCategory, req: TutorRequest): TutorResponse
```

The demo reviewer. It answers from fixed rules, without any network call.

| `req.kind` | `score` | Rule |
|---|---|---|
| `code-review` | 10 or 78 | 10 when the code equals the starter code or has a line that is only `pass`. Otherwise 78 |
| `math-help` | none | Always the same step-by-step hint, written for the `limit-sin` problem |
| `math-submit` | 95 or 40 | 95 when the answer contains `expectedOutput`, ignoring spaces and letter case |
| `chat` | none | One of five follow-up questions. `correction` is set when the last message has a lower-case “i” as a word |
| `essay` | 82 or 55 | 82 when the essay has 120 to 150 words |

Every reply except `chat` ends with “Демо горим: AI хараахан холбогдоогүй тул жишээ хариу харуулж байна.”

**Prerequisites:** none. **Errors:** never throws. A `chat` request with no `user` message returns `markdown` as
`undefined`.

**Used in:** [Get your first AI review](../tutorials/first-ai-review.md) (step 10 shows its 78-point reply).

## getModule

```ts
getModule(slug: "programming" | "math" | "architecture" | "languages"): LearningModule
```

Returns the display data of a module: titles, description, topics, icon, and colours. `modules` holds all four in
sidebar order, and `siteConfig` holds the site name `LearnLab AI` and its tagline.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `slug` | `ModuleSlug` | Yes | The module ID |

**Returns:** the matching `LearningModule`.

| Error | When |
|---|---|
| `Error: Unknown module: <slug>` | A value outside the four slugs, forced in by a type cast |
