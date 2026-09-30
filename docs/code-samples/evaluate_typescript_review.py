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
