# Definition of Done

## Sprint Definition of Done (lab guide)

| Item | Status | Evidence |
|---|---|---|
| Tutorial live on docs site (≤ 10 steps) | Done | [Get your first AI review](../tutorials/first-ai-review.md): 10 steps. `check_docs.py` fails the build above 10 |
| Internal search indexes Tutorial & Reference | Done | MkDocs Material search. `check_docs.py` reads the built search index and fails if the tutorial or any reference page is missing |
| 3 How-to guides live on docs site | Done | [How-to guides](../how-to/index.md), including “How to Connect Corg.ly to a Slack Channel” |
| Microcopy refactor diff archived in Confluence | Done, with a substitute | The project has no Confluence space. The diff is archived in the repository: [`microcopy.diff`](microcopy.diff) |
| Public API Reference chapter published | Done | [Reference](../reference/index.md): HTTP API, server action, library, data model, configuration |
| Literature references cited in pull request | Done | Pull request [#2](https://github.com/23B1NUM1822/barimt-bichig/pull/2) lists the references in its description |

## User stories

| Story | Acceptance criterion | Where it is met |
|---|---|---|
| US-7.1 Tutorial | Ends with a reproducible result | Step 10: score 78/100 from the deterministic demo reviewer |
| | Copy-pasteable, unclipped commands and code | Every command and the full Python solution are in code blocks with a copy button |
| | Prerequisites stated upfront | “Before you start” comes before step 1 |
| US-7.2 How-to guides | Opens with a triggering condition | Each guide starts with “When you need …” |
| | Ends with an explicit verification step | Each guide ends with a **Verify** section |
| | No reference tables or tutorial prose | `check_docs.py` fails if a how-to contains a table |
| US-7.3 Reference | Every public symbol with signature, parameters, returns, errors | [Library functions](../reference/library.md) lists all 28 public symbols. The endpoint and the server action have their own pages |
| | Search indexability | Clear headings per symbol, checked in the built search index |
| | Cross-references to how-to guides | **Used in:** lines on each entry |
| US-7.4 Microcopy | Before/after diff with word frequency comparisons | [UI microcopy before and after](microcopy.md) |
| | One application per Chinchilla rule | The “Rules applied” table in the same report |

## Requirement map

| Requirement from the assignment | Deliverable |
|---|---|
| Inspect the project, do not invent features | Every command was run against the real app, and every error message was copied from a real response (see the log below) |
| Tutorial, at most 10 steps | `tutorials/first-ai-review.md` |
| Three how-to guides, one named “How to Connect Corg.ly to a Slack Channel” | `how-to/`. The Slack guide states that the integration does not exist and labels its implementation as a proposal |
| Public API reference | `reference/` |
| Three microcopy touchpoints | `reports/microcopy.md` and the change in the app's source |
| Diátaxis categories kept apart | Separate navigation sections. Coursework lives under **Lab 07 report**, outside the four categories |
| Documentation website with search | MkDocs Material 9.7.7, published at `https://23b1num1822.github.io/barimt-bichig/guide/` |
| Definition of Done, reflection, stand-up, retrospective | This page and [Reflection, stand-up, retrospective](reflection.md) |
| References | [References](../references.md) |

## Validation log

Checked on 2026-10-16 against the real project source.

| What | Result |
|---|---|
| `npm run dev` | Started Next.js 16.3.6 on <http://localhost:3000> |
| `npx prisma migrate deploy` | “All migrations have been successfully applied.” |
| `npx prisma db seed` | “Seeded 4 categories and 9 problems.” |
| Tutorial steps 7 to 10 in a browser | Score 78/100 and the demo review, exactly as step 10 describes |
| How-to: add a practice problem | The example object type-checks. The seed printed “Seeded 4 categories and 10 problems.” and `/problems/chain-rule-sin` opened with the title “Гинжин дүрэм”. The check ran on a temporary copy of `seed.ts`, which was deleted afterwards |
| How-to: enable real AI grading | Without a key, both the curl and the PowerShell command reach the endpoint and get HTTP 500, as the guide says. The path with a real key was not run, because it needs a paid key |
| How-to: Slack | The `grep` command prints nothing. The proposed code was not run, because it does not exist in the project |
| `POST /api/evaluate` error responses | Invalid JSON, empty answer, answer over 20,000 characters, unknown category, category mismatch, unknown problem, and missing key: each status and message matches the HTTP API page |
| Microcopy | All three new texts render in the app |
| `mkdocs build --strict` | Builds with no warnings, so every internal link and anchor resolves |

**Not run on the validation machine:** the Docker command in tutorial step 2, because Docker was not running there.
The other steps used a temporary PostgreSQL 17 server with UTF-8 encoding. A first attempt with a server that used the
Windows default encoding (WIN1252) failed during the seed, because the problems are written in Mongolian. That is why
the tutorial requires UTF-8.
