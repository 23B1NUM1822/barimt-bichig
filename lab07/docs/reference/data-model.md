# Data model

The PostgreSQL tables, defined in `prisma/schema.prisma`. Field names are camelCase in code and snake_case in the
database, for example `answerType` is stored as `answer_type`.

## Problem

Table `problems`. One practice problem.

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | `string` | Yes | Page address, for example `binary-search` gives `/problems/binary-search`. A new ID gets a CUID when none is given |
| `title` | `string` | Yes | Shown at the top of the problem page |
| `description` | `string` | Yes | One-line summary shown in problem lists |
| `content` | `string` | Yes | The full task in Markdown. May contain code blocks, tables, and LaTeX |
| `difficulty` | `Difficulty` | Yes (default `EASY`) | `EASY`, `MEDIUM`, or `HARD` |
| `answerType` | `AnswerType` | Yes (default `CODE`) | `CODE`, `MATH`, or `TEXT` |
| `expectedOutput` | `string \| null` | No | Reference answer. Private: sent to the AI, never to the browser |
| `aiSystemPrompt` | `string` | Yes | Grading notes for the AI. Private: never sent to the browser |
| `starterCode` | `string \| null` | No | Code loaded into the editor. For `CODE` problems |
| `codeLanguage` | `string \| null` | No | Editor language, for example `python` or `verilog` |
| `categoryId` | `string` | Yes | The module. In `prisma/seed.ts` you give the slug in `category` instead |
| `createdAt`, `updatedAt` | `DateTime` | Set automatically | |

**Used in:** [Add a practice problem](../how-to/add-a-practice-problem.md).

## Category

Table `categories`. One of the four learning modules.

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | `string` | Yes | CUID |
| `name` | `string` | Yes, unique | Module name in Mongolian, for example `Програмчлал` |
| `slug` | `string` | Yes, unique | `programming`, `math`, `architecture`, or `languages`. Also the route `/modules/{slug}` |

## Submission

Table `submissions`. A stored answer with its evaluation. The table exists, but the app does not write to it yet: see
[issue #1](https://github.com/23B1NUM1822/barimt-bichig/issues/1).

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | `string` | Yes | CUID |
| `userId` | `string` | Yes | The student |
| `problemId` | `string` | Yes | The problem |
| `userAnswer` | `string` | Yes | The answer exactly as typed |
| `language` | `string \| null` | No | Programming language of a code answer |
| `status` | `SubmissionStatus` | Yes (default `PENDING`) | `PENDING`, `EVALUATED`, or `FAILED` |
| `aiFeedback` | `string \| null` | No | The AI review in Markdown |
| `score` | `number \| null` | No | 0 to 100 |
| `createdAt` | `DateTime` | Set automatically | |

## User

Table `users`. Not used by any page yet, because the app has no sign-in.

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | `string` | Yes | CUID |
| `name` | `string` | Yes | |
| `email` | `string` | Yes, unique | |
| `role` | `Role` | Yes (default `STUDENT`) | `STUDENT`, `TEACHER`, or `ADMIN` |
| `createdAt` | `DateTime` | Set automatically | |
