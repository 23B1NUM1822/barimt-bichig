# Reference

Exact facts about every public interface of LearnLab AI, as implemented on 2026-10-16. Each entry lists its
prerequisites, its inputs and outputs, every error it can produce, and the how-to guides that use it.

| Interface | Kind | Who calls it | Page |
|---|---|---|---|
| `POST /api/evaluate` | HTTP endpoint | Scripts and other services | [HTTP API](http-api.md) |
| `askTutor` | Next.js server action | The problem page in the browser | [Server action askTutor](server-action.md) |
| `evaluateSubmission`, `getProblem`, and 7 more functions | TypeScript functions under `lib/` | Server code inside the app | [Library functions](library.md) |
| `Problem`, `Category`, `Submission`, `User` | Database tables (Prisma models) | The seed script and the library | [Data model](data-model.md) |
| `DATABASE_URL`, `ANTHROPIC_API_KEY`, npm scripts, page routes | Settings and commands | Whoever runs the app | [Configuration and commands](configuration.md) |

## Prerequisites shared by every interface

| Check | How to check it | What happens if it fails |
|---|---|---|
| The database is reachable at `DATABASE_URL` | `npx prisma migrate deploy` ends with “All migrations have been successfully applied.” | Problem pages and both APIs fail with a server error |
| The problems are loaded | `npx prisma db seed` ends with “Seeded 4 categories and 9 problems.” | Every problem ID returns “Бодлого олдсонгүй.” (problem not found) |
| `ANTHROPIC_API_KEY` is set, for real grading | The review does not end with the “Демо горим” line | `askTutor` answers with demo replies, and `POST /api/evaluate` fails with HTTP 500 |

## Conventions on these pages

- Error messages are quoted exactly as the app returns them, in Mongolian, with an English meaning next to them.
- “Required” means the call fails without the field.
- Types use TypeScript notation, for example `string | null`.
- The full generated reference for the library, with every type and source link, is in the
  [TypeDoc API reference](https://23b1num1822.github.io/barimt-bichig/api/) from Lab 06.
