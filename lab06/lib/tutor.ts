/**
 * The request and response shapes of the problem page's AI tutor, and the offline demo tutor.
 *
 * @module
 */
import type { Evaluation } from "@/lib/ai/evaluate";
import type { ProblemWithCategory } from "@/lib/problems";

/**
 * One message in a language-practice conversation.
 *
 * @example
 * ```ts
 * import type { ChatMessage } from "@/lib/tutor";
 *
 * const messages: ChatMessage[] = [
 *   { role: "assistant", content: "What time do you usually wake up on weekdays?" },
 *   { role: "user", content: "i usually wake up at 7." },
 * ];
 * ```
 */
export type ChatMessage = {
  /** Who wrote the message: the student (`user`) or the tutor (`assistant`). */
  role: "user" | "assistant";
  /** The message text. */
  content: string;
};

/**
 * What the student asks the tutor to do on a problem page. `kind` selects the variant:
 *
 * | `kind` | Used by | Payload |
 * | --- | --- | --- |
 * | `code-review` | code workspace | `code`, `language` |
 * | `math-help` | math workspace, "step-by-step help" | `answer` so far |
 * | `math-submit` | math workspace, final answer | `answer` |
 * | `chat` | language workspace, conversation | `messages` |
 * | `essay` | language workspace, essay | `essay` |
 *
 * @example
 * Ask for a review of a Python answer to the `binary-search` problem:
 * ```ts
 * import type { TutorRequest } from "@/lib/tutor";
 *
 * const request: TutorRequest = {
 *   kind: "code-review",
 *   problemId: "binary-search",
 *   code: "def search(nums, target):\n    return nums.index(target)",
 *   language: "python",
 * };
 * ```
 */
export type TutorRequest =
  | {
      /** Review source code against the problem. Graded. */
      kind: "code-review";
      /** ID of the problem being solved. */
      problemId: string;
      /** The student's source code. */
      code: string;
      /** Programming language of `code`, for example `"python"`. */
      language: string;
    }
  | {
      /** Ask for the next step-by-step hint. Not graded. */
      kind: "math-help";
      /** ID of the problem being solved. */
      problemId: string;
      /** The student's work so far. May be empty. */
      answer: string;
    }
  | {
      /** Submit a final math answer. Graded. */
      kind: "math-submit";
      /** ID of the problem being solved. */
      problemId: string;
      /** The student's final answer or full derivation. */
      answer: string;
    }
  | {
      /** Continue a language-practice conversation. Not graded. */
      kind: "chat";
      /** ID of the problem being solved. */
      problemId: string;
      /** The whole conversation so far, oldest first. It must contain at least one `user` message. */
      messages: ChatMessage[];
    }
  | {
      /** Submit an essay. Graded. */
      kind: "essay";
      /** ID of the problem being solved. */
      problemId: string;
      /** The essay text. */
      essay: string;
    };

/**
 * The tutor's reply, shown in the feedback panel.
 *
 * @example
 * The reply to a code review of the `binary-search` problem:
 * ```ts
 * import type { TutorResponse } from "@/lib/tutor";
 *
 * const response: TutorResponse = {
 *   score: 45,
 *   markdown: "**Хариу зөв гарч байгаа ч хайлт O(n) хугацаатай.**",
 * };
 * ```
 */
export type TutorResponse = {
  /** Tutor's reply in Markdown (may contain LaTeX). */
  markdown: string;
  /** 0–100, only for graded requests. */
  score?: number;
  /** Short grammar note for chat replies, in Mongolian. */
  correction?: string;
};

/**
 * Renders a structured AI evaluation as Markdown for the feedback panel.
 *
 * The Markdown has, in this order: the summary in bold, an "Анхаарах зүйлс" list (only when there are
 * issues), the feedback, a "Засварласан хувилбар" quote (only when `correctedText` is set), and a
 * "Дараагийн алхам" section with the next step.
 *
 * @param e - The evaluation returned by `evaluateSubmission` in `lib/ai/evaluate`.
 * @returns A response with the evaluation's `score` and the rendered `markdown`. `correction` is never set.
 *   The function never throws.
 *
 * @example
 * Grade a `binary-search` answer and render the result:
 * ```ts
 * import { evaluateSubmission } from "@/lib/ai/evaluate";
 * import { getProblem } from "@/lib/problems";
 * import { evaluationToTutorResponse } from "@/lib/tutor";
 *
 * const problem = await getProblem("binary-search");
 * if (!problem) throw new Error("Бодлого олдсонгүй.");
 *
 * const code = "def search(nums, target):\n    return nums.index(target)";
 * const evaluation = await evaluateSubmission({ problem, userAnswer: code, language: "python" });
 * const response = evaluationToTutorResponse(evaluation);
 * console.log(response.score); // For example: 45
 * console.log(response.markdown.split("\n")[0]); // "**Хариу зөв гарч байгаа ч хайлт O(n) хугацаатай.**"
 * ```
 */
export function evaluationToTutorResponse(e: Evaluation): TutorResponse {
  const parts = [`**${e.summary}**`];
  if (e.issues.length > 0) {
    const list = e.issues.map((i, n) => `${n + 1}. **${i.location}** — ${i.problem}\n   _Зөвлөмж:_ ${i.suggestion}`);
    parts.push(`#### Анхаарах зүйлс\n\n${list.join("\n")}`);
  }
  parts.push(e.feedback);
  if (e.correctedText) {
    const quoted = e.correctedText.split("\n").map((line) => `> ${line}`);
    parts.push(`#### Засварласан хувилбар\n\n${quoted.join("\n")}`);
  }
  parts.push(`#### Дараагийн алхам\n\n${e.nextStep}`);
  return { score: e.score, markdown: parts.join("\n\n") };
}

// Internal, not part of the public API: footer text that marks demo replies. Only mockTutorResponse uses it.
const DEMO_NOTE = "\n\n---\n_Демо горим: AI хараахан холбогдоогүй тул жишээ хариу харуулж байна._";

/**
 * The offline demo tutor. It answers from fixed rules, without calling any AI model or the network.
 *
 * The problem page uses it when no `ANTHROPIC_API_KEY` is configured, and always for `chat` and
 * `math-help` requests. Graded requests go to `evaluateSubmission` when a key exists.
 *
 * | `kind` | `score` | Rule |
 * | --- | --- | --- |
 * | `code-review` | 10 or 78 | 10 when the code still equals the starter code or has a line that is only `pass` |
 * | `math-help` | none | Always the same hint, written for the `limit-sin` problem |
 * | `math-submit` | 95 or 40 | 95 when the answer contains `problem.expectedOutput`, ignoring spaces and case |
 * | `chat` | none | One of five follow-up questions, chosen by the number of `user` messages |
 * | `essay` | 82 or 55 | 82 when the essay has 120 to 150 words |
 *
 * For `chat`, `correction` is set when the last `user` message contains a lower-case "i" used as a word.
 * Every reply except `chat` ends with a note that says it is a demo reply.
 *
 * @param problem - The problem being solved. Only `starterCode` and `expectedOutput` are read.
 * @param req - The tutor request. A `chat` request must contain at least one `user` message, otherwise
 *   `markdown` is `undefined`.
 * @returns The demo reply. The function never throws.
 *
 * @example
 * Untouched starter code for the `binary-search` problem scores 10:
 * ```ts
 * import { getProblem } from "@/lib/problems";
 * import { mockTutorResponse } from "@/lib/tutor";
 *
 * const problem = await getProblem("binary-search");
 * if (!problem) throw new Error("Бодлого олдсонгүй.");
 *
 * const response = mockTutorResponse(problem, {
 *   kind: "code-review",
 *   problemId: "binary-search",
 *   code: problem.starterCode ?? "",
 *   language: "python",
 * });
 * console.log(response.score); // 10
 * ```
 */
export function mockTutorResponse(problem: ProblemWithCategory, req: TutorRequest): TutorResponse {
  switch (req.kind) {
    case "code-review": {
      const unfinished =
        req.code.trim() === (problem.starterCode ?? "").trim() || /^\s*pass\s*$/m.test(req.code);
      if (unfinished) {
        return {
          score: 10,
          markdown:
            "### Код дутуу байна\n\nЗагвар код хэвээрээ байна. Эхлээд үндсэн логикоо бичээд дахин шалгуулаарай.\n\n" +
            "**Эхлэх санаа:** асуудлыг хамгийн жижиг жишээн дээр гараар бодож үзээд, алхам бүрийг код болгоорой." +
            DEMO_NOTE,
        };
      }
      return {
        score: 78,
        markdown:
          "### Сайн эхлэл байна! 👏\n\n" +
          "**Давуу тал**\n- Кодын бүтэц ойлгомжтой, нэршил тодорхой байна.\n- Үндсэн тохиолдлыг зөв шийдсэн.\n\n" +
          "**Анхаарах зүйл**\n- Хилийн утгуудыг (хоосон оролт, ганц элемент) шалгасан уу?\n" +
          "- Давталт бүрт хайлтын муж заавал багасч байгаа эсэхийг нягтлаарай.\n\n" +
          "**Дараагийн алхам:** `lo` болон `hi` хоорондоо 1-ээр ялгаатай үед юу болохыг гараар мөшгөөд үзээрэй." +
          DEMO_NOTE,
      };
    }
    case "math-help":
      return {
        markdown:
          "### Алхам алхмаар\n\n" +
          "**1-р алхам.** Хувьсагч солих аргыг ашиглая: $t = 3x$ гэвэл $x \\to 0$ үед $t \\to 0$.\n\n" +
          "**2-р алхам.** Илэрхийллийг $t$-ээр бичвэл:\n\n" +
          "$$\\frac{\\sin 3x}{x} = 3 \\cdot \\frac{\\sin t}{t}$$\n\n" +
          "**3-р алхам.** Одоо эхний гайхамшигт хязгаарыг хэрэглээд үзээрэй. Хариу нь юу болох вэ? 🤔" +
          DEMO_NOTE,
      };
    case "math-submit": {
      const expected = problem.expectedOutput?.replace(/\s+/g, "").toLowerCase();
      const correct = !!expected && req.answer.replace(/\s+/g, "").toLowerCase().includes(expected);
      return correct
        ? {
            score: 95,
            markdown:
              "### Зөв байна! ✅\n\nЭцсийн хариу зөв бөгөөд үндэслэл тань ойлгомжтой байна. " +
              "Алхам бүрдээ ашигласан дүрмээ нэрлэвэл илүү бүрэн болно." +
              DEMO_NOTE,
          }
        : {
            score: 40,
            markdown:
              "### Бараг л болж байна\n\nЭцсийн хариу хүлээгдэж буй утгатай таарахгүй байна. " +
              "Завсрын алхмуудаа дахин нягтлаад үзээрэй, эсвэл **Алхам алхмаар тусламж** товчийг дараарай." +
              DEMO_NOTE,
          };
    }
    case "chat": {
      const last = [...req.messages].reverse().find((m) => m.role === "user")?.content ?? "";
      const followUps = [
        "That sounds nice! What time do you usually wake up on weekdays?",
        "Interesting! How do you usually get to school or work?",
        "Cool. What do you like to do in your free time?",
        "Great! Do you do anything different on weekends?",
        "You're doing really well! Can you tell me about your evening routine?",
      ];
      const turn = req.messages.filter((m) => m.role === "user").length;
      return {
        markdown: followUps[(turn - 1) % followUps.length],
        correction: /(^|\s)i(\s|')/.test(last)
          ? "Англи хэлэнд “I” (би) гэдэг үгийг үргэлж том үсгээр бичнэ."
          : undefined,
      };
    }
    case "essay": {
      const words = req.essay.trim().split(/\s+/).filter(Boolean).length;
      const inRange = words >= 120 && words <= 150;
      return {
        score: inRange ? 82 : 55,
        markdown:
          `### Эссэний үнэлгээ\n\n**Үгийн тоо:** ${words} ${inRange ? "✅" : "— 120–150 үг байх ёстой"}\n\n` +
          "**Бүтэц:** Оршил, гол хэсэг, дүгнэлт гэсэн хэсгүүдээ догол мөрөөр тусгаарлаарай.\n\n" +
          "**Дүрэм:** Present Simple цагийн 3-р биеийн төгсгөл (*he play**s***) дээр анхаараарай.\n\n" +
          "**Үгийн сан:** *usually, sometimes, after that* зэрэг холбох үгсийг илүү ашиглаарай." +
          DEMO_NOTE,
      };
    }
  }
}
