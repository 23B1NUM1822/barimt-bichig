# Lab 07: User documentation & UX writing

**Software Project Documentation · Week 07 · National University of Mongolia**
Student: T. Sodnomdamba (23B1NUM1822) · Lead project: *AI-Powered Code Reviewer & Practice Platform* (LearnLab AI)

**Live documentation site:** <https://23b1num1822.github.io/barimt-bichig/guide/>

## Deliverables

| Requirement | Page on the site | Source file |
|---|---|---|
| US-7.1 Tutorial, at most 10 steps | [Get your first AI review](https://23b1num1822.github.io/barimt-bichig/guide/tutorials/first-ai-review/) | [`lab07/docs/tutorials/first-ai-review.md`](../../lab07/docs/tutorials/first-ai-review.md) |
| US-7.2 How-to guide 1 | [Add a practice problem](https://23b1num1822.github.io/barimt-bichig/guide/how-to/add-a-practice-problem/) | [`lab07/docs/how-to/add-a-practice-problem.md`](../../lab07/docs/how-to/add-a-practice-problem.md) |
| US-7.2 How-to guide 2 | [Enable real AI grading](https://23b1num1822.github.io/barimt-bichig/guide/how-to/enable-ai-grading/) | [`lab07/docs/how-to/enable-ai-grading.md`](../../lab07/docs/how-to/enable-ai-grading.md) |
| US-7.2 How-to guide 3 | [How to Connect Corg.ly to a Slack Channel](https://23b1num1822.github.io/barimt-bichig/guide/how-to/connect-corgly-to-slack/) | [`lab07/docs/how-to/connect-corgly-to-slack.md`](../../lab07/docs/how-to/connect-corgly-to-slack.md) |
| US-7.3 Public API reference | [Reference](https://23b1num1822.github.io/barimt-bichig/guide/reference/) | [`lab07/docs/reference/`](../../lab07/docs/reference/index.md) |
| Explanation | [How grading works](https://23b1num1822.github.io/barimt-bichig/guide/explanation/how-grading-works/) | [`lab07/docs/explanation/how-grading-works.md`](../../lab07/docs/explanation/how-grading-works.md) |
| US-7.4 UI microcopy before/after | [UI microcopy before and after](https://23b1num1822.github.io/barimt-bichig/guide/reports/microcopy/) | [`lab07/docs/reports/microcopy.md`](../../lab07/docs/reports/microcopy.md), [`microcopy.diff`](../../lab07/docs/reports/microcopy.diff) |
| Definition of Done and validation log | [Definition of Done](https://23b1num1822.github.io/barimt-bichig/guide/reports/definition-of-done/) | [`lab07/docs/reports/definition-of-done.md`](../../lab07/docs/reports/definition-of-done.md) |
| Reflection, stand-up, retrospective | [Reflection](https://23b1num1822.github.io/barimt-bichig/guide/reports/reflection/) | [`lab07/docs/reports/reflection.md`](../../lab07/docs/reports/reflection.md) |
| References | [References](https://23b1num1822.github.io/barimt-bichig/guide/references/) | [`lab07/docs/references.md`](../../lab07/docs/references.md) |

## Documentation framework

The project had no documentation framework, so this lab adds **MkDocs Material 9.7.7**:

- Built-in full-text search over every page, with no extra service.
- Navigation tabs, one per Diátaxis category, so tutorials, how-to guides, reference, and explanation stay apart.
- `mkdocs build --strict` fails on any broken internal link or anchor.
- Plain Markdown in the repository, next to the code, which is the docs-as-code setup the course builds towards.

A Node-based framework such as Docusaurus or Nextra would match the app's Next.js stack. MkDocs was chosen because its
search and strict link checking work without configuration, and because CI already runs Python.

## Run the site locally

From the repository root:

```bash
python -m venv .venv
```

Activate the environment. In Windows PowerShell run `.venv\Scripts\Activate.ps1`. In bash run
`source .venv/bin/activate`. Then:

```bash
pip install -r lab07/requirements.txt
mkdocs serve -f lab07/mkdocs.yml
```

Open <http://127.0.0.1:8000/barimt-bichig/guide/>. The page reloads when you edit a file under `lab07/docs/`.

Build and check it exactly as CI does:

```bash
python lab07/check_docs.py
mkdocs build --strict -f lab07/mkdocs.yml -d ../public/guide
python lab07/check_docs.py --site public/guide
```

## Changes in the LearnLab AI source

The microcopy rewrite changes text only, in two files of the app (`diplom`):

- `components/problem/code-workspace.tsx`: the error message and the onboarding hint.
- `components/problem/description-panel.tsx`: the empty state of the submissions tab.

The exact change is [`microcopy.diff`](../../lab07/docs/reports/microcopy.diff). To undo it, run
`git apply -R microcopy.diff` in the project folder.
