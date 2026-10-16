# Configuration and commands

## Environment variables

Set them in a `.env` file in the project folder. The app reads them when it starts, so restart it after a change.

| Variable | Required | Example | Effect |
|---|---|---|---|
| `DATABASE_URL` | Yes | `postgresql://postgres:learnlab@localhost:5432/learnlab` | PostgreSQL connection string. The database must use UTF-8 |
| `ANTHROPIC_API_KEY` | No | empty | Empty: demo replies, and `POST /api/evaluate` fails with `500`. Set: real AI grading |

The project's `.gitignore` excludes `.env*`, so these values are never committed.

**Used in:** [Get your first AI review](../tutorials/first-ai-review.md) (step 3),
[Enable real AI grading](../how-to/enable-ai-grading.md).

## npm scripts

Run them with `npm run <name>` in the project folder.

| Script | Runs | Use it to |
|---|---|---|
| `dev` | `next dev` | Start the app with live reload on <http://localhost:3000> |
| `build` | `next build` | Build the production version |
| `start` | `next start` | Run the production build |
| `lint` | `eslint` | Check the code style |
| `db:migrate` | `prisma migrate dev` | Create a new migration while developing the schema |
| `db:studio` | `prisma studio` | Browse and edit the tables in a web UI |
| `postinstall` | `prisma generate` | Runs by itself after `npm install` and generates the database client |

## Database commands

| Command | Effect | Output when it works |
|---|---|---|
| `npx prisma migrate deploy` | Creates or updates the tables from `prisma/migrations` | `All migrations have been successfully applied.` |
| `npx prisma db seed` | Runs `tsx prisma/seed.ts`, which creates or updates the 4 modules and every problem in it | `Seeded 4 categories and 9 problems.` |

**Used in:** [Get your first AI review](../tutorials/first-ai-review.md) (steps 4 and 5),
[Add a practice problem](../how-to/add-a-practice-problem.md).

## Page routes

| Route | Page |
|---|---|
| `/` | Home page with the four modules |
| `/modules/programming`, `/modules/math`, `/modules/architecture`, `/modules/languages` | One module and its problems |
| `/problems/{id}` | One problem with its editor, for example `/problems/binary-search`. An unknown ID gives the 404 page |
| `/api/evaluate` | The [HTTP API](http-api.md) |
