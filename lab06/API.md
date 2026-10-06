# LearnLab AI Server API

Reference for the server-side TypeScript API of the *AI-Powered Code Reviewer & Practice Platform*. It is generated
by TypeDoc from the TSDoc comments in the source, on every push.

## Where to start

| You want to | Read |
|---|---|
| Grade a student's answer with the AI | `evaluateSubmission` in `lib/ai/evaluate` |
| Call the HTTP endpoint from the browser | `POST` in `app/api/evaluate/route` |
| Load problems from the database | `getProblem` and `getProblemsByCategory` in `lib/problems` |
| Send a problem to the browser safely | `toWorkspaceProblem` in `lib/problems` |
| Know which reviewer grades which module | `personaFor` in `lib/ai/personas` |
| Run the tutor without an API key | `mockTutorResponse` in `lib/tutor` |

## One example, used everywhere

Every example follows the same scenario, so you can read them as one story: a student submits a Python answer to the
`binary-search` problem in the `programming` module.

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
console.log(evaluation.score, evaluation.verdict); // For example: 45 "partially_correct"
```

All 28 examples in this reference are compiled against the real code in CI.

## What is not here

Private helpers such as `buildSystemPrompt`, `buildUserMessage`, and `getClient` are left out on purpose. Each has a
comment in the source that says why it is internal.

Related: the HTTP contract for the planned `/api/v1` endpoints is in the
[Redoc reference](https://23b1num1822.github.io/barimt-bichig/) and the
[Swagger UI sandbox](https://23b1num1822.github.io/barimt-bichig/swagger/).
