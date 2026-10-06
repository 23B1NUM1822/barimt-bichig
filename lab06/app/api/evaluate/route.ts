/**
 * The HTTP endpoint `POST /api/evaluate`.
 *
 * @module
 */
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { EvaluationIncompleteError, EvaluationRefusedError, evaluateSubmission } from "@/lib/ai/evaluate";
import { getProblem } from "@/lib/problems";

/**
 * Next.js route segment config: the longest this route may run, in seconds.
 *
 * It is 60 because adaptive thinking on a hard submission can take a while. Set client timeouts to at
 * least this value.
 *
 * @example
 * ```ts
 * const code = "def search(nums, target):\n    return nums.index(target)";
 * const response = await fetch("/api/evaluate", {
 *   method: "POST",
 *   body: JSON.stringify({ problemId: "binary-search", userAnswer: code, category: "programming" }),
 *   signal: AbortSignal.timeout(60_000),
 * });
 * ```
 */
export const maxDuration = 60;

// Internal, not part of the public API: the request contract is documented on POST below.
const BodySchema = z.object({
  problemId: z.string().min(1),
  userAnswer: z.string().trim().min(1, "Хариулт хоосон байна.").max(20_000, "Хариулт хэт урт байна."),
  category: z.enum(["programming", "math", "architecture", "languages"]),
  /** Programming language of a code answer, e.g. "python". */
  language: z.string().max(40).optional(),
});

// Internal, not part of the public API: builds the `{ error }` body that every failure returns.
function error(status: number, message: string) {
  return Response.json({ error: message }, { status });
}

/**
 * Handles `POST /api/evaluate`: grades one answer and returns `{ evaluation }`.
 *
 * **Request body (JSON)**
 *
 * | Field | Type | Rule |
 * | --- | --- | --- |
 * | `problemId` | string | Required, not empty |
 * | `userAnswer` | string | Required. Trimmed, then 1 to 20,000 characters |
 * | `category` | string | Required. `programming`, `math`, `architecture`, or `languages`. Must equal the problem's stored category |
 * | `language` | string | Optional, at most 40 characters. Programming language of a code answer |
 *
 * `category` is only checked against the problem. The reviewer persona always comes from the stored
 * category, so a student cannot pick a more lenient grader.
 *
 * **Responses**
 *
 * | Status | Body | When |
 * | --- | --- | --- |
 * | 200 | `{ evaluation }` | The answer was graded |
 * | 400 | `{ error }` | The body is not valid JSON, a field is invalid, or `category` does not match the problem |
 * | 404 | `{ error }` | No problem has this `problemId` |
 * | 422 | `{ error }` | The AI declined to evaluate the answer (`EvaluationRefusedError`) |
 * | 429 | `{ error }` | The Anthropic API rate limit was hit |
 * | 500 | `{ error }` | The AI service is not configured, or an unexpected error happened |
 * | 502 | `{ error }` | The AI returned an incomplete evaluation or an API error |
 * | 503 | `{ error }` | The AI service could not be reached |
 *
 * Error messages are in Mongolian and are shown to the student as they are. Every failure of the AI call
 * becomes one of the responses above. A database error while loading the problem is not caught, so Next.js
 * answers with its default 500 page instead of an `{ error }` body. The handler does not save the
 * submission yet.
 *
 * @param request - The incoming request with a JSON body.
 * @returns A JSON response as listed above.
 * @throws `Error` The promise rejects when loading the problem from the database fails. Next.js then
 *   answers with its default 500 response.
 *
 * @example
 * Grade a Python answer to the `binary-search` problem from the browser:
 * ```ts
 * const response = await fetch("/api/evaluate", {
 *   method: "POST",
 *   headers: { "Content-Type": "application/json" },
 *   body: JSON.stringify({
 *     problemId: "binary-search",
 *     category: "programming",
 *     language: "python",
 *     userAnswer: "def search(nums, target):\n    return nums.index(target)",
 *   }),
 * });
 *
 * if (!response.ok) {
 *   const { error } = await response.json(); // for example "Ангилал бодлоготой таарахгүй байна."
 *   throw new Error(error);
 * }
 * const { evaluation } = await response.json();
 * console.log(evaluation.score, evaluation.verdict); // For example: 45 "partially_correct"
 * ```
 */
export async function POST(request: Request) {
  let body: z.infer<typeof BodySchema>;
  try {
    const parsed = BodySchema.safeParse(await request.json());
    if (!parsed.success) return error(400, parsed.error.issues[0]?.message ?? "Буруу хүсэлт.");
    body = parsed.data;
  } catch {
    return error(400, "JSON бүтэц буруу байна.");
  }

  const problem = await getProblem(body.problemId);
  if (!problem) return error(404, "Бодлого олдсонгүй.");

  // The persona comes from the problem's stored category. The client's value is only checked,
  // so a student can't pick a more lenient grader by sending a different category.
  if (problem.category.slug !== body.category) {
    return error(400, "Ангилал бодлоготой таарахгүй байна.");
  }

  try {
    const evaluation = await evaluateSubmission({
      problem,
      userAnswer: body.userAnswer,
      language: body.language,
    });

    // TODO(#1): Save the evaluated submission once auth provides a userId.

    return Response.json({ evaluation });
  } catch (e) {
    if (e instanceof EvaluationRefusedError) return error(422, "AI энэ хариултыг үнэлэхээс татгалзлаа.");
    if (e instanceof EvaluationIncompleteError) return error(502, "AI бүрэн үнэлгээ буцаасангүй. Дахин оролдоно уу.");
    if (e instanceof Anthropic.RateLimitError) return error(429, "Хэт олон хүсэлт ирлээ. Түр хүлээгээд дахин оролдоно уу.");
    if (e instanceof Anthropic.AuthenticationError) {
      console.error("Anthropic authentication failed - check ANTHROPIC_API_KEY");
      return error(500, "AI үйлчилгээ тохируулагдаагүй байна.");
    }
    if (e instanceof Anthropic.APIConnectionError) return error(503, "AI үйлчилгээтэй холбогдож чадсангүй.");
    if (e instanceof Anthropic.APIError) {
      console.error("Anthropic API error", e.status, e.message);
      return error(502, "AI үйлчилгээнд алдаа гарлаа.");
    }
    // Anything else, including client setup problems such as a missing API key.
    console.error("Evaluation failed:", e);
    return error(500, "AI үнэлгээ хийхэд алдаа гарлаа.");
  }
}
