# Code samples: AI-Powered Code Reviewer & Practice Platform API

Three Python samples for the most common calls to the API described in
[`openapi.yaml`](../openapi/openapi.yaml). Each one follows Bhatti's five principles for code samples
(*Docs for Developers*, Ch. 5, pp. 86–94). The audit is in [`../lab05/audit-scorecard.md`](../lab05/audit-scorecard.md).

**Before you start**

```bash
pip install requests
export CODEPRACTICE_JWT="your_student_jwt_from_login"   # the access token you get when you sign in
```

The samples call production (`https://api.codepractice.mn/v1`) by default. To run them against the local mock server
instead, start `npx @stoplight/prism-cli mock docs/openapi/openapi.yaml` and set
`export CODEPRACTICE_API_URL="http://127.0.0.1:4010"`.

**Where the responses come from.** Each response below is the exact output of running the sample against the
Prism mock server generated from `openapi.yaml`. The payload shapes mirror the platform's real `EvaluationSchema`
(`lib/ai/evaluate.ts`) and Prisma models, and the problem data comes from the platform's seed database.
CI re-runs every sample on each push ([`scripts/verify_code_samples.py`](../../scripts/verify_code_samples.py))
and fails if the code or the response shown here no longer matches what the server returns.

---

## 1. `POST /api/v1/evaluate`: AI review of a TypeScript refactor

This sample sends a student's TypeScript solution for the `polymorphic-refactor` problem to the AI reviewer and prints
the structured review. It assumes the solution is saved as [`payment_processor.ts`](payment_processor.ts) next to the
script and that your token is in `CODEPRACTICE_JWT`.

<!-- sample: evaluate_typescript_review.py -->
```python
import json
import os
from pathlib import Path

import requests

API_BASE_URL = os.environ.get("CODEPRACTICE_API_URL", "https://api.codepractice.mn/v1")
auth_token = os.environ.get("CODEPRACTICE_JWT", "your_student_jwt_from_login")

evaluation_request = {
    "problemId": "polymorphic-refactor",
    "category": "programming",
    "language": "typescript",
    "userAnswer": Path("payment_processor.ts").read_text(encoding="utf-8"),  # your refactored solution
}

review_response = requests.post(
    f"{API_BASE_URL}/api/v1/evaluate",
    json=evaluation_request,
    headers={"Authorization": f"Bearer {auth_token}"},
    timeout=60,  # an AI review can take up to 60 seconds
)
review_response.raise_for_status()
print(json.dumps(review_response.json(), ensure_ascii=False, indent=2))
```

**Server response: `200 OK`**

<!-- response: evaluate_typescript_review.py -->
```json
{
  "evaluation": {
    "score": 82,
    "verdict": "partially_correct",
    "summary": "Полиморф бүтэц зөв бөгөөд `switch` бүрэн арилсан. Гэхдээ QPay-ийн хамгийн бага 100₮ шимтгэлийн дүрэм алдагдсан тул жижиг дүн дээр буруу шимтгэл гарна.",
    "issues": [
      {
        "location": "QPayPayment.fee() — 14-р мөр",
        "problem": "`amount * 0.005` нь хамгийн бага 100₮ шимтгэлийн дүрмийг алдсан. 50,000₮ дээр 250₮ гарч шалгах код давсан ч 10,000₮ төлбөрт 100₮ биш 50₮ буцаана.",
        "suggestion": "Анхны кодын `Math.max(...)` дүрмийг QPayPayment дотор сэргээгээд 10,000₮ дүнгээр гараар шалгаарай."
      },
      {
        "location": "paymentMethods бүртгэл — 33–38, 42-р мөр",
        "problem": "PaymentProcessor модулийн түвшний глобал бүртгэлээс шууд хамаарч байгаа тул unit test дээр өөр төлбөрийн аргаар орлуулах боломжгүй.",
        "suggestion": "Бүртгэлийг PaymentProcessor-ийн constructor-оор дамжуулж (dependency injection), `private readonly` талбарт хадгалаарай."
      }
    ],
    "feedback": "**Сайн тал:** `PaymentMethod` интерфейс, 4 тусдаа класс, `switch`-гүй `PaymentProcessor` нь Open/Closed зарчмыг хангаж байна. `process()` нь O(1).\n\n**Засах зүйл:** `QPayPayment.fee()` хамгийн бага 100₮ шимтгэлийг алдсан. Бүртгэлийг constructor-оор inject хийвэл тестлэхэд хялбар болно.",
    "correctedText": null,
    "nextStep": "`processor.process(\"qpay\", 10_000)` дуудлагын гаралтыг гараар тооцоод, 100₮ шимтгэл гарахаар QPayPayment-ийг засаарай."
  }
}
```

`score` is 0–100 and `verdict` always agrees with it (`correct` ≥ 90, `partially_correct` 40–89, `incorrect` < 40).
Each `issues[].location` points to a line or function in the submitted code. A `400` means the body is invalid or
`category` does not match the problem. A `502` or `503` is safe to retry.

---

## 2. `GET /api/v1/problems`: Higher Math calculus problems

This sample lists the medium-difficulty problems in the Higher Math & Logic module (`category=math`). Today those are
the two calculus problems. Both filters are optional, so leave one out to widen the list.

<!-- sample: list_calculus_problems.py -->
```python
import json
import os

import requests

API_BASE_URL = os.environ.get("CODEPRACTICE_API_URL", "https://api.codepractice.mn/v1")
auth_token = os.environ.get("CODEPRACTICE_JWT", "your_student_jwt_from_login")

problem_filters = {"category": "math", "difficulty": "MEDIUM"}  # difficulty is upper-case: EASY, MEDIUM, HARD

problems_response = requests.get(
    f"{API_BASE_URL}/api/v1/problems",
    params=problem_filters,
    headers={"Authorization": f"Bearer {auth_token}"},
    timeout=10,
)
problems_response.raise_for_status()
print(json.dumps(problems_response.json(), ensure_ascii=False, indent=2))
```

**Server response: `200 OK`**

<!-- response: list_calculus_problems.py -->
```json
{
  "data": [
    {
      "id": "log-diff-extrema",
      "title": "Логарифм дифференциалчлал ба экстремум",
      "description": "f(x) = xˣ функцийн [0.1, 2] завсар дээрх хамгийн их, хамгийн бага утгыг ол.",
      "difficulty": "MEDIUM",
      "answerType": "MATH",
      "codeLanguage": null,
      "category": {
        "slug": "math",
        "name": "Математик ба логик"
      }
    },
    {
      "id": "limit-sin",
      "title": "Гайхамшигт хязгаар",
      "description": "sin(3x)/x-ийн x → 0 үеийн хязгаарыг ол.",
      "difficulty": "MEDIUM",
      "answerType": "MATH",
      "codeLanguage": null,
      "category": {
        "slug": "math",
        "name": "Математик ба логик"
      }
    }
  ],
  "total": 2
}
```

Summaries leave out the full statement. Fetch it with `GET /api/v1/problems/log-diff-extrema`. An unknown filter
value such as `difficulty=medium` (lower-case) returns `400` with
`{"error": "difficulty нь EASY, MEDIUM, HARD-ийн аль нэг байх ёстой."}`.

---

## 3. `POST /api/v1/submissions`: save the evaluation score

After sample 1 returns a review, this sample stores the reviewed answer together with its `score` and `feedback`, so the
student's progress is kept. The student comes from the JWT, so the body has no user ID.

<!-- sample: save_submission_score.py -->
```python
import json
import os
from pathlib import Path

import requests

API_BASE_URL = os.environ.get("CODEPRACTICE_API_URL", "https://api.codepractice.mn/v1")
auth_token = os.environ.get("CODEPRACTICE_JWT", "your_student_jwt_from_login")

# Copied from the POST /api/v1/evaluate response: evaluation["score"] and evaluation["feedback"].
evaluation_score = 82
evaluation_feedback = (
    "**Сайн тал:** `PaymentMethod` интерфейс, 4 тусдаа класс, `switch`-гүй `PaymentProcessor` нь "
    "Open/Closed зарчмыг хангаж байна. `process()` нь O(1).\n\n"
    "**Засах зүйл:** `QPayPayment.fee()` хамгийн бага 100₮ шимтгэлийг алдсан. "
    "Бүртгэлийг constructor-оор inject хийвэл тестлэхэд хялбар болно."
)

submission_payload = {
    "problemId": "polymorphic-refactor",
    "userAnswer": Path("payment_processor.ts").read_text(encoding="utf-8"),  # the answer that was reviewed
    "language": "typescript",
    "score": evaluation_score,
    "aiFeedback": evaluation_feedback,
}

submission_response = requests.post(
    f"{API_BASE_URL}/api/v1/submissions",
    json=submission_payload,
    headers={"Authorization": f"Bearer {auth_token}"},
    timeout=10,
)
submission_response.raise_for_status()
print(json.dumps(submission_response.json(), ensure_ascii=False, indent=2))
```

**Server response: `201 Created`**

<!-- response: save_submission_score.py -->
```json
{
  "id": "cmg6b3n8v0004m2k8q9z5h2uc",
  "userId": "cmg4p9x7s0000m2k8r6w1t3ya",
  "problemId": "polymorphic-refactor",
  "userAnswer": "interface PaymentMethod {\n  fee(amount: number): number;\n  validate(amount: number): boolean;\n  describe(): string;\n}\n\nclass CardPayment implements PaymentMethod {\n  fee(amount: number): number { return amount * 0.025; }\n  validate(amount: number): boolean { return amount > 0; }\n  describe(): string { return \"Card\"; }\n}\n\nclass QPayPayment implements PaymentMethod {\n  fee(amount: number): number { return amount * 0.005; }\n  validate(amount: number): boolean { return amount > 0; }\n  describe(): string { return \"QPay\"; }\n}\n\nclass BankTransfer implements PaymentMethod {\n  fee(): number { return 500; }\n  validate(amount: number): boolean { return amount >= 10_000; }\n  describe(): string { return \"Bank\"; }\n}\n\nclass CashPayment implements PaymentMethod {\n  fee(): number { return 0; }\n  validate(amount: number): boolean { return amount <= 500_000; }\n  describe(): string { return \"Cash\"; }\n}\n\ntype PaymentType = \"card\" | \"qpay\" | \"bank\" | \"cash\";\n\nconst paymentMethods: Record<PaymentType, PaymentMethod> = {\n  card: new CardPayment(),\n  qpay: new QPayPayment(),\n  bank: new BankTransfer(),\n  cash: new CashPayment(),\n};\n\nclass PaymentProcessor {\n  process(type: PaymentType, amount: number): string {\n    const method = paymentMethods[type];\n    if (!method.validate(amount)) {\n      throw new Error(`${type}: дүн буруу байна`);\n    }\n    return `${method.describe()}: ${amount}₮ + ${method.fee(amount)}₮ шимтгэл`;\n  }\n}\n\n// --- Шалгах код (өөрчлөхгүй) ---\nconst processor = new PaymentProcessor();\nfor (const type of [\"card\", \"qpay\", \"bank\", \"cash\"] as const) {\n  console.log(processor.process(type, 50_000));\n}\n",
  "language": "typescript",
  "status": "EVALUATED",
  "aiFeedback": "**Сайн тал:** `PaymentMethod` интерфейс, 4 тусдаа класс, `switch`-гүй `PaymentProcessor` нь Open/Closed зарчмыг хангаж байна. `process()` нь O(1).\n\n**Засах зүйл:** `QPayPayment.fee()` хамгийн бага 100₮ шимтгэлийг алдсан. Бүртгэлийг constructor-оор inject хийвэл тестлэхэд хялбар болно.",
  "score": 82,
  "createdAt": "2026-09-30T08:14:52.318Z"
}
```

`status` is `EVALUATED` because the score is already known. To retry safely after a network error, send the same
`Idempotency-Key` header on every attempt; the server then returns the saved submission instead of storing it twice.
