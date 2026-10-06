import json
import os

import requests

API_BASE_URL = os.environ.get("CODEPRACTICE_API_URL", "https://api.codepractice.mn")
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
