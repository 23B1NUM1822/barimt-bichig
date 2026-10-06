/**
 * Reading problems from the database and deciding what the browser is allowed to see.
 *
 * @module
 */
import { connection } from "next/server";
import type { Category, Problem } from "@/lib/generated/prisma/browser";
import { prisma } from "@/lib/prisma";
import type { ModuleSlug } from "@/lib/modules";

/**
 * A problem row together with the learning module (category) it belongs to.
 *
 * `Problem` and `Category` are the Prisma models from `prisma/schema.prisma`. The problem carries `id`,
 * `title`, `description`, `content` (Markdown), `difficulty` (`EASY`, `MEDIUM`, `HARD`), `answerType`
 * (`CODE`, `MATH`, `TEXT`), `starterCode`, and `codeLanguage`.
 *
 * It also carries `expectedOutput` and `aiSystemPrompt`, which are **private grading data**. Never send a
 * `ProblemWithCategory` to the browser. Convert it with {@link toWorkspaceProblem} first.
 *
 * @example
 * ```ts
 * import { getProblem, type ProblemWithCategory } from "@/lib/problems";
 *
 * const problem: ProblemWithCategory | null = await getProblem("binary-search");
 * console.log(problem?.title, problem?.category.slug); // "Хоёртын хайлт" "programming"
 * ```
 */
export type ProblemWithCategory = Problem & {
  /** The learning module that the problem belongs to. Its `slug` is one of the four module slugs. */
  category: Category;
};

/**
 * Which answer UI a problem gets, decided by its category: a code editor (`code`), a math answer box
 * (`math`), or a chat and essay view (`language`).
 *
 * @example
 * ```ts
 * import { workspaceFor, type WorkspaceKind } from "@/lib/problems";
 *
 * const kind: WorkspaceKind = workspaceFor("programming"); // "code", used for `binary-search`
 * ```
 */
export type WorkspaceKind = "code" | "math" | "language";

/**
 * Maps a category slug to the answer UI that its problems use.
 *
 * `programming` and `architecture` give `code`, `math` gives `math`, and `languages` gives `language`.
 *
 * @param categorySlug - The `slug` of the problem's category, for example `problem.category.slug`.
 * @returns The workspace kind. An unknown slug falls back to `"code"`. The function never throws.
 *
 * @example
 * ```ts
 * import { getProblem, workspaceFor } from "@/lib/problems";
 *
 * const problem = await getProblem("binary-search");
 * if (problem) console.log(workspaceFor(problem.category.slug)); // "code"
 * ```
 */
export function workspaceFor(categorySlug: string): WorkspaceKind {
  switch (categorySlug as ModuleSlug) {
    case "programming":
    case "architecture":
      return "code";
    case "math":
      return "math";
    case "languages":
      return "language";
    default:
      return "code";
  }
}

/**
 * The subset of a problem that is safe to send to the browser.
 * `aiSystemPrompt` and `expectedOutput` stay on the server so students can't read the answer.
 *
 * @example
 * What the browser receives for the `binary-search` problem (starter code shortened here):
 * ```ts
 * import type { WorkspaceProblem } from "@/lib/problems";
 *
 * const workspaceProblem: WorkspaceProblem = {
 *   id: "binary-search",
 *   starterCode: "def search(nums: list[int], target: int) -> int:\n    pass\n",
 *   codeLanguage: "python",
 *   categorySlug: "programming",
 * };
 * ```
 */
export type WorkspaceProblem = Pick<Problem, "id" | "starterCode" | "codeLanguage"> & {
  /** Slug of the problem's category, for example `"programming"`. */
  categorySlug: string;
};

/**
 * Strips a problem down to the fields that are safe to send to the browser.
 *
 * @param p - The full problem, as returned by {@link getProblem}.
 * @returns A new object with only `id`, `starterCode`, `codeLanguage`, and `categorySlug`.
 *   The function never throws.
 *
 * @example
 * ```ts
 * import { getProblem, toWorkspaceProblem } from "@/lib/problems";
 *
 * const problem = await getProblem("binary-search");
 * if (!problem) throw new Error("Бодлого олдсонгүй.");
 *
 * const workspaceProblem = toWorkspaceProblem(problem);
 * // { id: "binary-search", starterCode: "def search(...", codeLanguage: "python", categorySlug: "programming" }
 * ```
 */
export function toWorkspaceProblem(p: ProblemWithCategory): WorkspaceProblem {
  return { id: p.id, starterCode: p.starterCode, codeLanguage: p.codeLanguage, categorySlug: p.category.slug };
}

// ---------------------------------------------------------------------------
// Queries. `connection()` marks callers as request-time, so pages always show the
// current database contents and `next build` doesn't need a live database.
// ---------------------------------------------------------------------------

/**
 * Loads one problem and its category by ID.
 *
 * The result includes the private grading fields, so use it on the server only. The function awaits
 * Next.js `connection()` first, which makes the calling page render at request time.
 *
 * @param id - Problem ID, for example `"binary-search"`.
 * @returns The problem with its category, or `null` when no problem has this ID.
 * @throws `Error` The promise rejects with the database client's error when the query fails, for example
 *   when the database cannot be reached.
 *
 * @example
 * ```ts
 * import { getProblem } from "@/lib/problems";
 *
 * const problem = await getProblem("binary-search");
 * if (problem) console.log(problem.difficulty, problem.codeLanguage); // "MEDIUM" "python"
 * else console.log("Бодлого олдсонгүй.");
 * ```
 */
export async function getProblem(id: string): Promise<ProblemWithCategory | null> {
  await connection();
  return prisma.problem.findUnique({ where: { id }, include: { category: true } });
}

/**
 * Lists every problem in one learning module, easiest first.
 *
 * Problems are sorted by `difficulty` (`EASY`, then `MEDIUM`, then `HARD`) and then by creation time.
 * The results include the private grading fields, so use them on the server only.
 *
 * @param slug - Category slug, for example `"programming"`.
 * @returns The problems with their category. The array is empty when the slug matches no category.
 * @throws `Error` The promise rejects with the database client's error when the query fails, for example
 *   when the database cannot be reached.
 *
 * @example
 * ```ts
 * import { getProblemsByCategory } from "@/lib/problems";
 *
 * const problems = await getProblemsByCategory("programming");
 * console.log(problems.map((p) => p.id)); // ["binary-search", "polymorphic-refactor"]
 * ```
 */
export async function getProblemsByCategory(slug: string): Promise<ProblemWithCategory[]> {
  await connection();
  return prisma.problem.findMany({
    where: { category: { slug } },
    include: { category: true },
    orderBy: [{ difficulty: "asc" }, { createdAt: "asc" }],
  });
}
