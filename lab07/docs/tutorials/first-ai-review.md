# Get your first AI review

In this tutorial you run LearnLab AI on your own computer, solve the **Хоёртын хайлт** (binary search) problem in
Python, and get your code reviewed. It takes about 20 minutes.

**At the end you will have** a running copy of LearnLab AI with 9 practice problems, and a review of your solution
that scores it **78/100**.

You do not need an Anthropic API key. Without a key, LearnLab AI answers with its built-in demo reviewer, which gives
the same review every time, so you can check that you got it right.

## Before you start

You need all of these before step 1:

- **Node.js 20.9 or newer, with npm.** Next.js 16 does not run on older versions. Check with `node --version`.
- **Docker Desktop, running.** Step 2 uses it to start PostgreSQL. If you already have PostgreSQL 15 or newer, you can
  skip step 2 and use your own server. Its database must use UTF-8 encoding, because the problems are written in
  Mongolian.
- **The LearnLab AI source code**, in a folder called `diplom`.
- **A web browser**, and about 1 GB of free disk space for the npm packages.

!!! note "Assumption: where the source code comes from"
    The LearnLab AI repository is not public yet. This tutorial assumes you received the `diplom` project folder from
    the project team.

## 1. Install the dependencies

Open a terminal in the folder that contains `diplom`, then run:

```bash
cd diplom
npm install
```

The install ends by generating the database client. The last lines include:

```text
✔ Generated Prisma Client (7.10.0) to .\lib\generated\prisma
```

## 2. Start PostgreSQL

Start a PostgreSQL 17 server in Docker, with a database called `learnlab`:

```bash
docker run --name learnlab-db -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=learnlab -e POSTGRES_DB=learnlab -p 5432:5432 -d postgres:17
```

Docker prints the ID of the new container, a long line of letters and digits.

## 3. Connect the app to the database

Create a file called `.env` in the `diplom` folder with exactly this content:

```dotenv
DATABASE_URL="postgresql://postgres:learnlab@localhost:5432/learnlab"
ANTHROPIC_API_KEY=""
```

The empty `ANTHROPIC_API_KEY` keeps LearnLab AI in demo mode. If you use your own PostgreSQL server, put its
connection string in `DATABASE_URL` instead.

## 4. Create the tables

```bash
npx prisma migrate deploy
```

The command ends with:

```text
All migrations have been successfully applied.
```

## 5. Load the practice problems

```bash
npx prisma db seed
```

You see one line per problem, and then:

```text
Seeded 4 categories and 9 problems.
```

## 6. Start LearnLab AI

```bash
npm run dev
```

Wait until the terminal shows:

```text
▲ Next.js 16.3.6 (Turbopack)
- Local:         http://localhost:3000
✓ Ready
```

Keep this terminal open. The app stops when you close it.

## 7. Open the binary search problem

Open <http://localhost:3000/problems/binary-search> in your browser.

On the left you see the task **Хоёртын хайлт**. On the right you see a code editor with the starter code, which
begins with `def search(nums: list[int], target: int) -> int:`. Under the editor the hint says:
“Кодоо бичээд “Үнэлгээнд илгээх” товчийг дараарай. AI багш энд зөвлөгөө өгнө.”

## 8. Write your solution

Click in the editor, select all the code with ++ctrl+a++, and paste this solution in its place:

```python
def search(nums: list[int], target: int) -> int:
    lo, hi = 0, len(nums) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if nums[mid] == target:
            return mid
        if nums[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1


print(search([-1, 0, 3, 5, 9, 12], 9))
```

## 9. Send your code for review

Click **Үнэлгээнд илгээх** (“Submit for review”) above the editor, or press ++ctrl+enter++.

For about a second the panel under the editor shows “AI таны кодыг шалгаж байна…” (“The AI is checking your code”).

## 10. Read your review

The panel under the editor now shows your review:

- **Оноо 78/100**: your score.
- The heading **Сайн эхлэл байна! 👏** (“A good start!”).
- **Давуу тал** (strengths), **Анхаарах зүйл** (things to check), and **Дараагийн алхам** (next step).
- At the bottom: “Демо горим: AI хараахан холбогдоогүй тул жишээ хариу харуулж байна.” This line tells you that the
  demo reviewer answered.

![The review panel with the score 78/100 and the heading “Сайн эхлэл байна!”](../assets/tutorial-result.jpg)

## What you did

You ran the whole LearnLab AI stack on your computer: the database, the practice problems, and the web app. You solved
a problem and sent it through the same review flow that students use.

Where to go next:

- Get real AI reviews instead of demo replies: [Enable real AI grading](../how-to/enable-ai-grading.md).
- Write your own problem: [Add a practice problem](../how-to/add-a-practice-problem.md).
- Learn what happened when you clicked the button: [How grading works](../explanation/how-grading-works.md).
