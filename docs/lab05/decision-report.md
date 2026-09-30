# Decision report: Swagger UI vs. Redoc

**US-5.3 & US-5.4.** Chinchilla Ch. 4 & 6, Bhatti Ch. 7.

## 100-word decision report

> **Decision:** Redoc is our public reference, and Swagger UI is our team sandbox.
> **Search performance:** Redoc's built-in search box matches operations and descriptions as you type, while Swagger UI
> can only filter by tag. **Layout readability:** Redoc's three-panel layout keeps navigation, long Mongolian
> descriptions, and JSON examples side by side, so students follow the evaluate-then-submit flow without clicking;
> Swagger UI hides every example inside collapsed accordions. **Try-It-Out utility:** only Swagger UI sends real
> JWT-authenticated requests, which we point at the local Prism mock server to reproduce reported bugs. Therefore Redoc
> serves the site root, and Swagger UI lives at /swagger/.

*Word count: 100 (`wc -w`).*

| Criterion | Swagger UI | Redoc | Better for this platform |
|---|---|---|---|
| Search performance | Tag filter only (`filter: true`) | Full-text search box over operations and descriptions | Redoc |
| Layout readability | Single column, collapsed accordions | Three panels: navigation, description, examples | Redoc |
| "Try it out" sandbox | Sends real requests with the Bearer token | None in the open-source version | Swagger UI |

## Hosting

| Renderer | URL (GitHub Pages) | Source |
|---|---|---|
| Redoc: public reference | `https://23b1num1822.github.io/barimt-bichig/` | built by CI into `public/index.html` |
| Swagger UI: sandbox | `https://23b1num1822.github.io/barimt-bichig/swagger/` | [`public/swagger/index.html`](../../public/swagger/index.html) |
| Raw spec | `https://23b1num1822.github.io/barimt-bichig/openapi.yaml` | copied by CI from `docs/openapi/openapi.yaml` |

The [`API docs` workflow](../../.github/workflows/api-docs.yml) lints the spec, re-runs the code samples, builds both
renderers, and deploys them to GitHub Pages on every push to `main`.

## CLI commands

Run these from the repository root. The versions are pinned to the ones CI uses.

**1. Lint `openapi.yaml` with `@redocly/cli`**

```bash
npx @redocly/cli@2.56.0 lint docs/openapi/openapi.yaml
```

The linter reads [`redocly.yaml`](../../redocly.yaml): the `recommended` ruleset plus strict example validation. It
exits with code 1 on any error. Current result: **0 errors, 0 warnings.** The lab handout's `--watch` flag does not
exist on `redocly lint` in CLI v2, so re-run the command after each edit instead.

**2. Build the standalone Redoc HTML**

```bash
npx @redocly/cli@2.56.0 build-docs docs/openapi/openapi.yaml -o public/index.html
```

This produces one self-contained HTML file (about 200 KB) that opens directly in a browser.

**3. Run Swagger UI locally with Docker**

```bash
docker run --rm -p 8080:8080 -e SWAGGER_JSON=/spec/openapi.yaml -v "$(pwd)/docs/openapi:/spec" swaggerapi/swagger-ui
```

In Windows PowerShell, use `${PWD}` instead of `$(pwd)`:

```powershell
docker run --rm -p 8080:8080 -e SWAGGER_JSON=/spec/openapi.yaml -v "${PWD}/docs/openapi:/spec" swaggerapi/swagger-ui
```

Then open <http://localhost:8080>.

**4. Mock server for "Try it out" and the code samples**

```bash
npx @stoplight/prism-cli@5.16.0 mock docs/openapi/openapi.yaml
```

Prism listens on `http://127.0.0.1:4010`, checks the Bearer header and each request body against the spec, and replays
the spec's examples. In Swagger UI, pick the `http://127.0.0.1:4010` server and authorize with any token.
