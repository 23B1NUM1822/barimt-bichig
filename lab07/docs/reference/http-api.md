# HTTP API

LearnLab AI exposes one HTTP endpoint. It grades one answer with the AI reviewer and returns a structured evaluation.
It does not use the demo reviewer, so it needs an Anthropic API key.

## POST /api/evaluate

```http
POST /api/evaluate
Content-Type: application/json
```

Source: `app/api/evaluate/route.ts`.

### Prerequisites

| Check | Why |
|---|---|
| The app runs (`npm run dev` or `npm run start`) | The endpoint is part of the Next.js app, on port 3000 by default |
| The problem exists in the database | Otherwise the endpoint answers `404` |
| `ANTHROPIC_API_KEY` is set in `.env` and the app was restarted | Without it every valid request answers `500` |

No sign-in is needed. The endpoint does not check who calls it.

### Request body

| Field | Type | Required | Rules |
|---|---|---|---|
| `problemId` | `string` | Yes | At least 1 character. A problem ID such as `binary-search` |
| `userAnswer` | `string` | Yes | Spaces at both ends are removed, then 1 to 20,000 characters |
| `category` | `string` | Yes | `programming`, `math`, `architecture`, or `languages`. Must equal the problem's own category |
| `language` | `string` | No | At most 40 characters. Programming language of a code answer, for example `python` |

The reviewer is chosen from the problem's stored category. The `category` field is only compared with it, so a client
cannot choose a more lenient reviewer.

### Responses

| Status | Body | When |
|---|---|---|
| `200` | `{ "evaluation": Evaluation }` | The answer was graded |
| `400` | `{ "error": "JSON бүтэц буруу байна." }` (invalid JSON) | The body is not valid JSON |
| `400` | `{ "error": "Хариулт хоосон байна." }` (the answer is empty) | `userAnswer` is empty after trimming |
| `400` | `{ "error": "Хариулт хэт урт байна." }` (the answer is too long) | `userAnswer` is longer than 20,000 characters |
| `400` | `{ "error": "Invalid option: expected one of \"programming\"\|\"math\"\|\"architecture\"\|\"languages\"" }` | `category` is not one of the four values. This message comes from the validation library and is not translated |
| `400` | `{ "error": "Ангилал бодлоготой таарахгүй байна." }` (category does not match the problem) | `category` differs from the problem's category |
| `404` | `{ "error": "Бодлого олдсонгүй." }` (problem not found) | No problem has this `problemId` |
| `422` | `{ "error": "AI энэ хариултыг үнэлэхээс татгалзлаа." }` (the AI declined) | The model refused to grade the answer. Do not retry |
| `429` | `{ "error": "Хэт олон хүсэлт ирлээ. Түр хүлээгээд дахин оролдоно уу." }` (too many requests) | The Anthropic API rate limit was hit. Retry later |
| `500` | `{ "error": "AI үйлчилгээ тохируулагдаагүй байна." }` (AI service not configured) | Anthropic rejected the API key |
| `500` | `{ "error": "AI үнэлгээ хийхэд алдаа гарлаа." }` (evaluation failed) | Any other failure, including a missing API key |
| `502` | `{ "error": "AI бүрэн үнэлгээ буцаасангүй. Дахин оролдоно уу." }` (incomplete evaluation) | The model stopped before finishing. Safe to retry |
| `502` | `{ "error": "AI үйлчилгээнд алдаа гарлаа." }` (AI service error) | The Anthropic API returned another error |
| `503` | `{ "error": "AI үйлчилгээтэй холбогдож чадсангүй." }` (could not reach the AI service) | No connection to the Anthropic API. Retry later |

A database error while loading the problem is not caught by the handler, so Next.js answers with its own error page
instead of `{ "error": ... }`.

The `400`, `404`, and missing-key `500` responses above were checked against the running app on 2026-10-16.

### The Evaluation object

| Field | Type | Meaning |
|---|---|---|
| `score` | `number` | Integer from 0 to 100 |
| `verdict` | `"correct"` \| `"partially_correct"` \| `"incorrect"` | Overall judgement. The model is told to use `correct` from 90 and `incorrect` below 40 |
| `summary` | `string` | One or two sentences, in Mongolian |
| `issues` | `{ location, problem, suggestion }[]` | Concrete mistakes, most important first. Empty when there are none |
| `feedback` | `string` | Detailed review in Markdown, which may contain LaTeX |
| `correctedText` | `string \| null` | The corrected text, for problems in the `languages` module only |
| `nextStep` | `string` | One hint, question, or exercise for the student |

### Limits and side effects

- A request may run for up to 60 seconds (`maxDuration = 60`). Set your client timeout to at least that.
- Each successful request makes one paid call to the `claude-opus-5` model.
- The result is not saved. Saving is planned in [issue #1](https://github.com/23B1NUM1822/barimt-bichig/issues/1).

### Example

```bash
curl -s -X POST http://localhost:3000/api/evaluate \
  -H "Content-Type: application/json" \
  -d '{"problemId":"binary-search","category":"programming","language":"python","userAnswer":"def search(nums, target):\n    return nums.index(target)"}'
```

**Used in:** [Enable real AI grading](../how-to/enable-ai-grading.md#verify),
[How to Connect Corg.ly to a Slack Channel](../how-to/connect-corgly-to-slack.md#proposed-implementation-not-built).
