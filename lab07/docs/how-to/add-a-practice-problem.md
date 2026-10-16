# Add a practice problem

When you need a new problem for students, add it to the seed script and run the seed again. This guide adds a calculus
problem called **Гинжин дүрэм** (chain rule) to the Math & logic module.

**Before you start:** LearnLab AI must be able to reach its database, as after step 5 of the
[tutorial](../tutorials/first-ai-review.md).

## Steps

1. Open `prisma/seed.ts` in your editor.

2. Find the line `const demoProblems: SeedProblem[] = [`. Scroll to the end of that list, and paste this object just
   before the closing `];`:

    ```ts
      {
        id: "chain-rule-sin",
        category: "math",
        title: "Гинжин дүрэм",
        description: "f(x) = sin(x²) функцийн уламжлалыг ол.",
        difficulty: "EASY",
        answerType: "MATH",
        expectedOutput: "2x cos(x^2)",
        content: `Дараах функцийн уламжлалыг ол:

    $$
    f(x) = \\sin(x^2)
    $$

    Гинжин дүрмийг ашиглаж, алхам бүрээ тайлбарлаарай.`,
        aiSystemPrompt: `You are a calculus tutor. The answer is f'(x) = 2x cos(x^2), by the chain rule.
    Check that the student differentiates the outer function (sin) and multiplies by the derivative of the inner function (x^2).
    Do not reveal the final answer; point to the first incorrect step instead.`,
      },
    ```

    For your own problem, change the values. `id` becomes the page address, so use lower-case words joined by
    hyphens. `category` must be `programming`, `math`, `architecture`, or `languages`. A code problem also needs
    `codeLanguage` and `starterCode`. The [data model reference](../reference/data-model.md#problem) lists every field.

3. Save the file, then run the seed:

    ```bash
    npx prisma db seed
    ```

## Verify

1. The seed output lists your problem and the new total:

    ```text
      ✓ math         chain-rule-sin
    Seeded 4 categories and 10 problems.
    ```

2. With the app running (`npm run dev`), open <http://localhost:3000/problems/chain-rule-sin>. The page shows the title
   **Гинжин дүрэм** and the formula for f(x).

The seed updates a problem that already has the same `id`, so you can edit the object and run the seed again to
change the problem.
