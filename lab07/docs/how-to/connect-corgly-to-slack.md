# How to Connect Corg.ly to a Slack Channel

When you need review results to appear in a Slack channel, first check what the product can do today. For LearnLab AI
the answer is that this task cannot be done yet:

- **Corg.ly** is the example product from the course's lab handouts (a pet onboarding API). It is not this project.
- **LearnLab AI has no Slack integration.** No code, setting, or dependency in the project mentions Slack.

This guide shows how to confirm that, and then what would have to be built. Everything under
[Proposed implementation](#proposed-implementation-not-built) is a proposal. None of it exists in the codebase.

## Confirm that there is no Slack integration

Run this in the `diplom` folder:

```bash
grep -rli "slack" app lib components prisma package.json
```

The command prints nothing, so no file mentions Slack. On 2026-10-16 the result was empty.

## Proposed implementation (not built)

!!! warning "Proposal only"
    The steps below describe what a developer would need to add. The file `lib/slack.ts` and the setting
    `SLACK_WEBHOOK_URL` do not exist in LearnLab AI today.

The simplest connection uses a Slack *incoming webhook*: a secret URL that posts any JSON message you send to it into
one channel. The Slack steps follow Slack's guide,
[Sending messages using incoming webhooks](https://docs.slack.dev/messaging/sending-messages-using-incoming-webhooks/).

1. In Slack, create an app, open **Incoming Webhooks**, switch **Activate Incoming Webhooks** on, click
   **Add New Webhook to Workspace**, and pick the channel. Copy the webhook URL that Slack shows. It starts with
   `https://hooks.slack.com/services/`.

2. Keep the URL secret, because anyone who has it can post to the channel. Store it in `.env` next to the other
   settings:

    ```dotenv
    SLACK_WEBHOOK_URL="your-slack-webhook-url"
    ```

3. Add a helper that posts a message. Proposed file `lib/slack.ts`:

    ```ts
    /** Posts one plain-text message to the channel behind SLACK_WEBHOOK_URL. Does nothing when it is not set. */
    export async function notifySlack(text: string): Promise<void> {
      const url = process.env.SLACK_WEBHOOK_URL;
      if (!url) return;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!response.ok) console.error("Slack webhook failed:", response.status);
    }
    ```

4. Call it after a successful review, in `app/api/evaluate/route.ts` right after `evaluateSubmission` returns. That is
   the place marked `TODO(#1)`, where submissions will also be saved:

    ```ts
    await notifySlack(`${problem.title}: ${evaluation.score}/100 (${evaluation.verdict})`);
    ```

5. Decide what may be posted before you ship it. A score is personal data about a student, so post to a private
   channel for teachers, or post totals instead of individual results.

## Verify

Today, the check in [Confirm that there is no Slack integration](#confirm-that-there-is-no-slack-integration) prints
nothing.

Once the proposal is built, verify it in two steps:

1. Check the webhook on its own. A message appears in the channel:

    ```bash
    curl -X POST -H "Content-Type: application/json" --data '{"text":"LearnLab AI is connected to this channel."}' "$SLACK_WEBHOOK_URL"
    ```

2. Submit an answer through `POST /api/evaluate`, as in [Enable real AI grading](enable-ai-grading.md#verify). A line
   such as `Хоёртын хайлт: 92/100 (correct)` appears in the channel.
