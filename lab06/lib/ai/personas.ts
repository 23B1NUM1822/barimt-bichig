/**
 * Reviewer personas: who the AI acts as when it grades an answer in each learning module.
 *
 * @module
 */
import type { ModuleSlug } from "@/lib/modules";

/**
 * How much reasoning the model spends on one evaluation. The value is passed to the Anthropic API as
 * `output_config.effort`. Higher values are slower and cost more.
 *
 * @example
 * The effort used for the `binary-search` problem (module `programming`):
 * ```ts
 * import { personaFor, type Effort } from "@/lib/ai/personas";
 *
 * const effort: Effort = personaFor("programming").effort; // "high"
 * ```
 */
export type Effort = "low" | "medium" | "high" | "xhigh" | "max";

/**
 * The reviewer that the model plays for one learning module, as returned by {@link personaFor}.
 *
 * @example
 * The persona that reviews the `binary-search` problem (module `programming`):
 * ```ts
 * import { personaFor, type Persona } from "@/lib/ai/personas";
 *
 * const persona: Persona = personaFor("programming");
 * persona.role; // "a Senior Software Engineer doing a code review"
 * persona.effort; // "high"
 * ```
 */
export type Persona = {
  /** Who the model is acting as. */
  role: string;
  /** How this persona reviews a submission and fills in the evaluation fields. */
  instructions: string;
  /** Reasoning depth; grading code and proofs benefits from more than chat-style feedback. */
  effort: Effort;
};

/**
 * Picks the AI reviewer's persona from a problem's category.
 *
 * | Category | Role | Effort |
 * | --- | --- | --- |
 * | `programming` | a Senior Software Engineer doing a code review | `high` |
 * | `architecture` | a Computer Architecture professor and digital hardware engineer | `high` |
 * | `math` | a Mathematics professor grading a student's written solution | `high` |
 * | `languages` | a friendly native English teacher | `medium` |
 *
 * Always pass the category stored with the problem, not a value sent by the client. Otherwise a student
 * could choose a more lenient reviewer.
 *
 * @param category - Slug of the learning module that the problem belongs to.
 * @returns The persona for that module. The function never throws. If a type cast forces in a string that
 *   is not a {@link ModuleSlug}, it returns `undefined` at runtime.
 *
 * @example
 * The reviewer for the `binary-search` problem:
 * ```ts
 * import { personaFor } from "@/lib/ai/personas";
 * import { getProblem } from "@/lib/problems";
 * import type { ModuleSlug } from "@/lib/modules";
 *
 * const problem = await getProblem("binary-search");
 * if (!problem) throw new Error("Бодлого олдсонгүй.");
 *
 * const persona = personaFor(problem.category.slug as ModuleSlug);
 * console.log(persona.role); // "a Senior Software Engineer doing a code review"
 * ```
 */
export function personaFor(category: ModuleSlug): Persona {
  switch (category) {
    case "programming":
      return {
        role: "a Senior Software Engineer doing a code review",
        effort: "high",
        instructions: `Review the student's code the way you would review a junior colleague's pull request.

Check, in this order:
1. Correctness: does it solve the task for the examples and for edge cases (empty input, one element,
   duplicates, very large values)? Trace the code mentally on at least one example. Name concrete bugs:
   off-by-one errors, infinite loops, wrong return values, unhandled cases.
2. Complexity: state the time and space complexity in Big-O and compare it with what the task requires.
   If it is worse, explain which part of the code causes it.
3. Clean code and OOP: naming, function size, duplication, single responsibility, and - when the code uses
   classes - encapsulation, cohesion, and whether the abstractions make sense. Only mention principles
   that actually apply to this code.

Point to specific lines in each issue's location, e.g. "5-р мөр" or the function name.
Do not rewrite the whole solution for them. Short snippets that illustrate a single fix are fine.`,
      };

    case "architecture":
      return {
        role: "a Computer Architecture professor and digital hardware engineer",
        effort: "high",
        instructions: `Review the student's hardware description or low-level code (Verilog, assembly) like a lab instructor.

Check that the logic matches the specification and truth table, that ports, signal widths, and names
match the task, and that the design would synthesize or assemble. For assembly, check register usage and
instruction semantics. Relate each mistake to the underlying concept (gate behavior, carry propagation,
pipeline stage, memory access) so the student learns why it is wrong, not just that it is wrong.

Point to specific lines or signal names in each issue's location.`,
      };

    case "math":
      return {
        role: "a Mathematics professor grading a student's written solution",
        effort: "high",
        instructions: `Grade the reasoning, not just the final number.

Work through the student's solution step by step and verify every transformation: algebra, limit laws,
differentiation and integration rules, substitutions and their bounds, and asymptotic arguments.
Find the FIRST step where the work goes wrong and quote it exactly in that issue's location
(e.g. "3-р алхам: $\\frac{d}{dx}\\sin 3x = \\cos 3x$"). Explain which rule was misapplied and why.
Steps after the first error may be internally consistent - say so rather than marking them all wrong.

Never give the student the final answer or a complete worked solution, even if they are far off.
Instead, in nextStep, give a hint or a guiding question that leads them to fix the first wrong step.
If the solution is correct, confirm it and mention any step that needs a better justification.
Write all mathematics in LaTeX using $...$ and $$...$$.`,
      };

    case "languages":
      return {
        role: "a friendly native English teacher",
        effort: "medium",
        instructions: `The student is a Mongolian speaker learning English (roughly A2-B1 level).
Their answer may be a chat message or an essay.

- Correct every grammar, spelling, and word-choice mistake. For each one, quote the original phrase in the
  issue's location, and give the corrected version and a one-sentence rule in suggestion.
- Expand their vocabulary: suggest 2-4 more natural or more precise words and phrases they could use,
  with a short example sentence for each.
- Put the full corrected version of their text in correctedText.
- Write feedback like a supportive conversation with the student: in simple English, warm and
  encouraging, reacting to what they actually said. Add a short Mongolian explanation in parentheses
  after any grammar rule a beginner might not understand.
- For essays, also judge task completion (topic, word count), organization, and linking words.`,
      };
  }
}
