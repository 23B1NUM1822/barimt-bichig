# barimt-bichig

Lab work for the **Software Project Documentation** course (National University of Mongolia, Department of Computer
Science). The guiding project is the *AI-Powered Code Reviewer & Practice Platform*, a diploma project where students
solve programming, math, computer-architecture, and language problems and receive structured AI feedback.

**Live API docs:** [Redoc reference](https://23b1num1822.github.io/barimt-bichig/) · [Swagger UI sandbox](https://23b1num1822.github.io/barimt-bichig/swagger/) · [TypeDoc code reference](https://23b1num1822.github.io/barimt-bichig/api/)

## Labs

| Week | Topic | Start here |
|---|---|---|
| 05 | OpenAPI 3.0, Bhatti code samples, Swagger UI vs. Redoc | [`docs/lab05/README.md`](docs/lab05/README.md) |
| 06 | Code documentation (TSDoc + TypeDoc), manual vs. AI docstring audit | [`docs/lab06/README.md`](docs/lab06/README.md) |

## Repository layout

```text
docs/openapi/openapi.yaml         OpenAPI 3.0.3 specification (5 endpoints)
docs/code-samples/                Python samples + the responses they return
docs/lab05/                       Audit scorecard, decision report, lab index
public/swagger/index.html         Swagger UI sandbox page (Redoc is built into public/index.html by CI)
scripts/verify_code_samples.py    Runs every code sample and checks the documented responses
lab06/                            Documented snapshot of the project's server API, TypeDoc config, audit files
redocly.yaml                      Lint rules for the spec
.github/workflows/api-docs.yml    Lint, run samples, check docstrings, build all three sites, deploy to GitHub Pages
.gitlab-ci.yml                    The Lab 06 docstring pipeline for GitLab CI/CD and GitLab Pages
```
