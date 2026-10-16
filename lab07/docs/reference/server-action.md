# Server action askTutor

The problem page talks to the server through one Next.js server action, `askTutor`. Every button that asks the AI tutor
for something calls it: submitting code, a math answer, or an essay, asking for a math hint, and sending a chat
message.

## askTutor

```ts
async function askTutor(req: TutorRequest): Promise<TutorResponse>
```

Source: `app/problems/[id]/actions.ts` (marked `"use server"`).

### Prerequisites

| Check | Why |
|---|---|
| Called from a client component inside LearnLab AI | Next.js runs server actions through an internal request. It is not a stable URL, so scripts should use [`POST /api/evaluate`](http-api.md) instead |
| The problem exists in the database | Otherwise the action throws “Бодлого олдсонгүй.” |
| `ANTHROPIC_API_KEY` is set, if you want real grading | Without it every request is answered by the demo reviewer |

### Parameter: TutorRequest

`kind` selects one of five shapes. Every shape also has `problemId: string`, the ID of the problem on the page.

| `kind` | Extra fields | Sent by | Graded |
|---|---|---|---|
| `code-review` | `code: string`, `language: string` | The code editor, button **Үнэлгээнд илгээх** | Yes |
| `math-help` | `answer: string` (the work so far, may be empty) | The math editor, button **Алхам алхмаар тусламж** | No |
| `math-submit` | `answer: string` | The math editor, final answer | Yes |
| `chat` | `messages: { role: "user" \| "assistant"; content: string }[]` | The English conversation | No |
| `essay` | `essay: string` | The essay editor | Yes |

The code editor does not call the action when the code is empty or only spaces.

### Return value: TutorResponse

| Field | Type | Meaning |
|---|---|---|
| `markdown` | `string` | The reply, in Markdown. May contain LaTeX |
| `score` | `number`, optional | 0 to 100. Present for graded kinds only |
| `correction` | `string`, optional | A short grammar note, for `chat` only |

### Who answers: AI or demo

| `kind` | `ANTHROPIC_API_KEY` set | `ANTHROPIC_API_KEY` empty |
|---|---|---|
| `code-review`, `math-submit`, `essay` | The AI reviewer, through `evaluateSubmission` | The demo reviewer |
| `math-help`, `chat` | The demo reviewer | The demo reviewer |

The demo reviewer waits 900 ms and then answers by fixed rules. For example, any code that differs from the starter
code and has no line that is only `pass` scores 78. The full rules are under
[`mockTutorResponse`](library.md#mocktutorresponse).

### Errors

| Error message | Meaning | Cause |
|---|---|---|
| `Бодлого олдсонгүй.` | Problem not found | `problemId` matches no problem |
| `Хариулт хэт урт байна.` | The answer is too long | The input is over 20,000 characters. For `chat`, all messages are counted together |
| Errors from `evaluateSubmission` | The AI review failed | Only when a key is set. See [`evaluateSubmission`](library.md#evaluatesubmission) |

The action throws these errors, but the browser does not show them. Each editor catches the error and shows its own
message instead:

| Editor | Message shown |
|---|---|
| Code | `Үнэлгээ ирсэнгүй. Код тань хэвээр байна, дахин илгээгээрэй.` |
| Math | `AI-аас хариу авахад алдаа гарлаа. Дахин оролдоно уу.` |
| Chat | `Хариу авахад алдаа гарлаа. Дахин илгээнэ үү.` |
| Essay | `Үнэлгээ авахад алдаа гарлаа. Дахин оролдоно уу.` |

### Example

How the code editor calls it (`components/problem/code-workspace.tsx`):

```ts
setResult(await askTutor({ kind: "code-review", problemId: problem.id, code, language: language.id }));
```

**Used in:** [Get your first AI review](../tutorials/first-ai-review.md) (steps 9 and 10),
[Enable real AI grading](../how-to/enable-ai-grading.md).
