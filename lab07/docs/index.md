# LearnLab AI Documentation

LearnLab AI is a learning platform where university students solve problems in four modules and get an AI review of
every answer: a score, the mistakes, and a next step. It is a Next.js 16 web app with a PostgreSQL database, and it
uses the Anthropic API for grading.

| Module | What students practise | Answer they submit |
|---|---|---|
| Програмчлал (Programming) | Writing and refactoring code | Source code (Python, TypeScript, and more) |
| Математик ба логик (Math & logic) | Calculus, limits, complexity analysis | A worked solution with LaTeX |
| Компьютерийн архитектур (Computer architecture) | Logic circuits, caches, assembly | Verilog, assembly, or a written explanation |
| Гадаад хэл (Foreign language) | English conversation and essays | Chat messages or an essay |

The user interface is in Mongolian. This documentation is in English, and it quotes the interface text exactly as it
appears on screen.

## Find what you need

This site follows the [Diátaxis](https://diataxis.fr/) framework. Each section answers one kind of question, so
pick the one that matches what you are trying to do.

<div class="grid cards" markdown>

-   **[Tutorials](tutorials/index.md)**

    *I am new and want to learn by doing.*
    Run LearnLab AI on your computer and get your first AI review in 10 steps.

-   **[How-to guides](how-to/index.md)**

    *I have a specific task to finish.*
    Add a practice problem, switch on real AI grading, or check what a Slack connection would need.

-   **[Reference](reference/index.md)**

    *I need exact facts.*
    The HTTP endpoint, the server action, every library function, the data model, and all settings.

-   **[Explanation](explanation/index.md)**

    *I want to understand why it works this way.*
    How an answer travels from the editor to the reviewer and back.

</div>

Use the search box at the top of every page to search all sections at once. For example, search for `askTutor`,
`DATABASE_URL`, or `binary-search`.

## What this documentation covers

The pages describe the code of the LearnLab AI web app as it was on 2026-10-16: one HTTP endpoint
(`POST /api/evaluate`), one server action (`askTutor`), and the server-side library under `lib/`.

The versioned contract `/api/v1/...` from Lab 05 is a design for a future version. It is not implemented yet and is
documented separately in the [OpenAPI reference](https://23b1num1822.github.io/barimt-bichig/).

The [Lab 07 report](reports/index.md) section holds the coursework that is not user documentation: the UI microcopy
before-and-after report, the Definition of Done, and the weekly reflection.
