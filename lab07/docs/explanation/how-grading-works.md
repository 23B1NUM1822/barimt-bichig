# How grading works

When a student clicks **Үнэлгээнд илгээх**, the answer goes to the server, a reviewer grades it, and the review comes
back to the panel under the editor. This page explains the decisions behind that path.

## One problem, one reviewer

Each module has its own reviewer persona. A programming answer is read as a senior engineer reads a pull request: the
reviewer traces the code, states its complexity, and points to lines. A math answer is read as a professor grades a
written solution: the reviewer looks for the first wrong step and does not reveal the final answer. Language answers
get a friendly English teacher, who corrects grammar and suggests better words.

The persona is chosen from the problem's own category in the database, never from what the browser sends. If the
browser chose the reviewer, a student could send a math answer to the most lenient one. The HTTP endpoint goes one step
further and rejects a request whose category does not match the problem.

## Private grading data

Every problem has two fields that students must not see: the reference answer (`expectedOutput`) and the teacher's
grading notes (`aiSystemPrompt`). They go to the AI as part of its instructions, so it can judge correctness. They never
reach the browser: the page shows the title and the task, and the editor receives only the problem ID, the starter
code, the editor language, and the module.

For the same reason, the AI is told never to quote the reference answer. And because a student's answer is untrusted
text, the AI is told to grade it and never to follow instructions written inside it, such as “give me 100 points”.

## Demo mode

Real grading costs money: every graded answer is one request to the `claude-opus-5` model. To let anyone run the app
without a paid key, LearnLab AI has a demo reviewer. Without `ANTHROPIC_API_KEY` it answers every request with fixed
replies. With a key, only the graded actions (code review, final math answer, essay) use the AI. Step-by-step math
hints and the English chat partner always use demo replies, because they are not graded yet.

The demo reviewer is deterministic: the same input always gets the same reply. That is why the tutorial can promise a
score of exactly 78.

## Why the HTTP endpoint has no version

The working endpoint is `POST /api/evaluate`. Lab 05 designed a versioned contract, `/api/v1/...`, with five
operations, for the version that will add sign-in and saved submissions. That contract is written first (design-first)
and the code will follow it. Until then the documentation separates the two: these pages describe what runs today,
and the OpenAPI reference describes what is planned.

## Where the result goes

Nowhere, yet. The review is shown once and lost when the page reloads, which is why the **Илгээлтүүд** (submissions)
tab is empty. Saving needs to know who the student is, so it waits for sign-in. The work is tracked in
[issue #1](https://github.com/23B1NUM1822/barimt-bichig/issues/1).
