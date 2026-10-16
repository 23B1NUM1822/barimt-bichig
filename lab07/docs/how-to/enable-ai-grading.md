# Enable real AI grading

When you need real AI reviews instead of the demo replies, give LearnLab AI an Anthropic API key and restart it.

**Before you start:**

- LearnLab AI runs on your computer, as in the [tutorial](../tutorials/first-ai-review.md).
- You have an Anthropic API key from <https://console.anthropic.com>, and billing is set up for it. Every graded
  submission is one paid request to the `claude-opus-5` model.

## Steps

1. Open the `.env` file in the `diplom` folder and put your key in the `ANTHROPIC_API_KEY` line:

    ```dotenv
    ANTHROPIC_API_KEY="your-anthropic-api-key"
    ```

    Replace `your-anthropic-api-key` with the key itself. Never commit this file: the project's `.gitignore` already
    excludes `.env*`.

2. Restart the app, because it reads the key only when it starts. In the terminal that runs it, press ++ctrl+c++, then:

    ```bash
    npm run dev
    ```

3. Open a problem, for example <http://localhost:3000/problems/binary-search>, and submit an answer.

A key turns on real grading for code reviews, final math answers, and essays. The step-by-step math hints and the
English chat partner keep using demo replies.

## Verify

1. **In the browser:** the review no longer ends with “Демо горим: AI хараахан холбогдоогүй тул жишээ хариу харуулж
   байна.”, and the score changes when you change your code. A review can take up to a minute.

2. **From a terminal:** send an answer straight to the HTTP endpoint.

    ```bash
    curl -s -X POST http://localhost:3000/api/evaluate \
      -H "Content-Type: application/json" \
      -d '{"problemId":"binary-search","category":"programming","language":"python","userAnswer":"def search(nums, target):\n    return nums.index(target)"}'
    ```

    In Windows PowerShell, use this instead:

    ```powershell
    $body = @{ problemId = "binary-search"; category = "programming"; language = "python"; userAnswer = "def search(nums, target):`n    return nums.index(target)" } | ConvertTo-Json
    Invoke-RestMethod -Method Post -Uri http://localhost:3000/api/evaluate -ContentType "application/json" -Body $body
    ```

    With a working key the response is `{"evaluation": {...}}` with a `score` between 0 and 100. Without a key, curl
    prints `{"error":"AI үнэлгээ хийхэд алдаа гарлаа."}` and PowerShell stops with an HTTP 500 error.
