# Lab 06: Code documentation & AI auditing

**Software Project Documentation · Week 06 · National University of Mongolia**
Student: T. Sodnomdamba (23B1NUM1822) · Lead project: *AI-Powered Code Reviewer & Practice Platform* (diploma project)

**Live API reference:** <https://23b1num1822.github.io/barimt-bichig/api/>

## What was documented

The lead project is written in TypeScript, so the docstrings are TSDoc and the renderer is TypeDoc (the lab allows
"JSDoc" and "Sphinx/TypeDoc"). [`lab06/`](../../lab06) holds a snapshot of the project's server API: seven modules
with 28 public symbols. Only comments were added. The code is unchanged and still type-checks.

The deliverables that the lab names with `.py` have the same names with `.ts`.

## Deliverables

| User story | Deliverable | Result |
|---|---|---|
| US-6.1 Docstrings | Documented source in [`lab06/lib/`](../../lab06/lib) and [`lab06/app/`](../../lab06/app/api/evaluate/route.ts) | 28 of 28 public symbols documented |
| US-6.1 Quality audit | [`chinchilla_checklist.md`](../../lab06/audit/chinchilla_checklist.md) | 6 checks per symbol, generated from TypeDoc's output. 10 internal helpers marked as excluded |
| US-6.2 CI/CD | [`.gitlab-ci.yml`](../../.gitlab-ci.yml) and [`.github/workflows/api-docs.yml`](../../.github/workflows/api-docs.yml) | TypeDoc build with warnings as errors: **82 warnings before, 0 after** |
| US-6.3 (a) Manual docstrings | [`manual_docstring.ts`](../../lab06/audit/manual_docstring.ts) | |
| US-6.3 (b) AI docstrings | [`ai_docstring.ts`](../../lab06/audit/ai_docstring.ts) | Claude Haiku, output kept as generated |
| US-6.3 Diff | [`manual_vs_ai.diff`](../../lab06/audit/manual_vs_ai.diff) | 480 lines |
| US-6.3 Bhatti audit | [`bhatti_audit_table.md`](../../lab06/audit/bhatti_audit_table.md) | Manual 4.8 / 5, AI 2.6 / 5. **5 corrections** applied, 3 AI passages accepted |
| US-6.3 Hallucination log | [`use_verify_cite_log.md`](../../lab06/audit/use_verify_cite_log.md) | **3 invented API elements** found, 3 wrong statements, 4 confirmed |
| UE-6 (c) Merge & build | [`lab06/lib/ai/evaluate.ts`](../../lab06/lib/ai/evaluate.ts), [`typedoc.json`](../../lab06/typedoc.json) | Clean HTML build, zero warnings |
| UE-6 (d) Bonus | [`test_ai_hallucinations.ts`](../../lab06/test_ai_hallucinations.ts) | Reflection test: 0 findings in the final docstrings, 14 in the AI draft |
| US-6.4 Technical debt | [`tech_debt.md`](../../lab06/audit/tech_debt.md), [issue #1](https://github.com/23B1NUM1822/barimt-bichig/issues/1) | 1 TODO tracked and rewritten as `TODO(#1)`. 2 lying comments fixed |

## Platform note: GitHub instead of GitLab

The lab asks for GitLab CI, GitLab Pages, and GitLab Issues. This repository lives on GitHub, so the same pipeline
runs on GitHub Actions, GitHub Pages, and GitHub Issues.

| Lab requirement | Here |
|---|---|
| `.gitlab-ci.yml` with a build job | [`.gitlab-ci.yml`](../../.gitlab-ci.yml) is in the repository and its YAML is valid. It has not been run, because the project is not on GitLab. The GitHub workflow runs the same commands on every push. |
| `sphinx-build -W` (zero warnings) | `treatWarningsAsErrors` and `treatValidationWarningsAsErrors` in [`typedoc.json`](../../lab06/typedoc.json), with validation of undocumented symbols and broken links switched on |
| GitLab Pages | GitHub Pages, at the URL above |
| GitLab Issues, `# TODO(#123)` | GitHub Issues, `// TODO(#1)` |

## What the pipeline checks

Each push runs these steps in the `Check docstrings & build TypeDoc (zero warnings)` job. Any failure stops the
deployment.

| Step | Command | What it proves |
|---|---|---|
| Type-check | `npm run typecheck` | The documented code still compiles |
| TODO check | `npm run check:todos` | No `TODO` or `FIXME` without an issue number |
| Example check | `npm run check:examples` | All 28 `@example` blocks compile against the real code |
| Hallucination test | `npm run test:hallucinations` | Docstrings refer only to symbols and values that exist |
| TypeDoc | `npm run docs` | Every public symbol is documented and every link resolves |

## Definition of Done

- [x] TypeDoc build green in CI with zero warnings
- [x] Live documentation URL: <https://23b1num1822.github.io/barimt-bichig/api/>
- [x] `bhatti_audit_table.md` with at least 2 manual corrections of AI text (5 applied)
- [x] All `TODO` comments resolved or linked to an issue ID

## Reproduce locally

```bash
cd lab06
npm ci
npm run typecheck && npm run check:todos && npm run check:examples && npm run test:hallucinations
npm run docs        # writes the site to public/api/
```
