import json
import os
from pathlib import Path

import requests

API_BASE_URL = os.environ.get("CODEPRACTICE_API_URL", "https://api.codepractice.mn")
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
