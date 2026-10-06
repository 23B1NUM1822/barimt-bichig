# Technical debt cleanup (US-6.4)

Goal of US-6.4 (Bhatti et al., *Docs for Developers*, Ch. 4, p. 79): code comments must never become "lying
comments", that is, comments that no longer match the code.

## TODO and FIXME comments

Search: `grep -rnE "TODO|FIXME" lib app` over the documented source. One comment was found.

| Where | Before | Issue | After |
|---|---|---|---|
| `app/api/evaluate/route.ts:129` | `// TODO: once auth exists, save it:` followed by two lines of commented-out code | [#1 Save evaluated submissions to the database once auth exists](https://github.com/23B1NUM1822/barimt-bichig/issues/1) | `// TODO(#1): Save the evaluated submission once auth provides a userId.` |

The commented-out `prisma.submission.create(...)` call moved into the issue, where it can be discussed and changed.
In the code it would have gone stale the first time the `Submission` model changed.

CI now fails if a `TODO` or `FIXME` without an issue number is added (`npm run check:todos`).

## Lying comments found while documenting

Writing the docstrings meant reading every function against its comment. Two comments no longer matched the code.

| Where | The comment said | The code does | Fix |
|---|---|---|---|
| `lib/tutor.ts`, `mockTutorResponse` | "Placeholder tutor used until a real model is connected. The real version will send `problem.aiSystemPrompt` ..." | The real model **is** connected (`evaluateSubmission`). The mock is the fallback when no API key is set, and it always handles `chat` and `math-help`. | Docstring rewritten to describe the current behaviour, with a table of the rule for each request kind. |
| `app/api/evaluate/route.ts`, `POST` | "Returns: `{ evaluation: Evaluation }`" | It returns eight different responses, seven of them errors. | Docstring now lists every status code and when it happens. |

## Behaviour that the docstrings now state openly

These are not comments, but documenting them exposed them. They are described in the docstrings and are not yet
tracked as issues.

| Where | Behaviour |
|---|---|
| `mockTutorResponse`, `chat` | With no `user` message in `messages`, `markdown` is `undefined`. |
| `mockTutorResponse`, `math-help` | The hint is always the one for the `limit-sin` problem, whatever the problem is. |
| `POST /api/evaluate` | A database error while loading the problem is not caught, so the client gets a default 500 page instead of `{ error }`. |
| `Evaluation.verdict` | The model is told to keep `verdict` in line with `score`, but the code does not enforce it. |
