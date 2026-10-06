# Decision report: Swagger UI vs. Redoc

**US-5.3 & US-5.4, milestone M5.** Chinchilla Ch. 4 & 6, Bhatti Ch. 7, lecture W05 "Swagger UI vs. Redoc".

## 150-word comparison write-up (M5)

> We keep both renderers, and **Redoc** is the one we publish as the reference. **Layout:** Redoc gives each operation
> three panes, so the long Mongolian descriptions, the schema, and the JSON examples stay side by side; Swagger UI
> stacks everything in one column of collapsed blocks. **Try-it-out:** only Swagger UI sends real requests. With a
> JWT entered once, we call the Prism mock and force any documented error, such as 409 or 429, which Redoc cannot do.
> **Hosting:** both are static files on GitHub Pages, Redoc at the site root and Swagger UI under /swagger/, rebuilt
> from the same openapi.yaml on every push. **Best for:** students and integrators read Redoc, because its search and
> example switcher answer questions without clicking; the team uses Swagger UI as a sandbox while building the client.
> Rendering both showed us a gap: Swagger UI displayed the wrong example until schema and operation examples matched.

*Word count: 150 (`wc -w`).*

## 100-word decision report (lab US-5.4)

> **Decision:** Redoc is our public reference, and Swagger UI is our team sandbox.
> **Search performance:** Redoc's built-in search box matches operations and descriptions as you type, while Swagger UI
> can only filter by tag. **Layout readability:** Redoc's three-panel layout keeps navigation, long Mongolian
> descriptions, and JSON examples side by side, so students follow the evaluate-then-submit flow without clicking;
> Swagger UI hides every example inside collapsed accordions. **Try-It-Out utility:** only Swagger UI sends real
> JWT-authenticated requests, which we point at the local Prism mock server to reproduce reported bugs. Therefore Redoc
> serves the site root, and Swagger UI lives at /swagger/.

*Word count: 100 (`wc -w`).*

## Comparison on the lecture's dimensions

| Dimension | Swagger UI | Redoc | Better for this platform |
|---|---|---|---|
| Layout | One column, operations collapsed under tags | Three panes per operation: navigation, description, examples | Redoc |
| Try-it-out | Sends real requests with the Bearer token | Read-only: examples are visible, nothing runs | Swagger UI |
| Hosting | Static page plus the spec file | One self-contained HTML file | Equal: both are static on GitHub Pages |
| Search | Tag filter only (`filter: true`) | Full-text search box over operations and descriptions | Redoc |
| Vendor extensions | Shows `x-changelog` on each operation (`showExtensions: true`) | Does not show operation-level extensions | Swagger UI |
| Best for | Sandbox while integrating | Public reference | Both, on different paths of one domain |

## Hosting

| Renderer | Latest | Pinned to the version |
|---|---|---|
| Redoc: public reference | <https://23b1num1822.github.io/barimt-bichig/> | `/v1.1.0/`, `/v1.0.0/` |
| Swagger UI: sandbox | <https://23b1num1822.github.io/barimt-bichig/swagger/> | `/v1.1.0/swagger/`, `/v1.0.0/swagger/` |
| Raw spec | `/openapi.yaml`, `/openapi.json` | `/v1.1.0/openapi.yaml`, `/v1.0.0/openapi.yaml` |

The [`API docs` workflow](../../.github/workflows/api-docs.yml) lints the spec, runs the code samples and the contract
tests against the mock, builds both renderers for the latest spec and for every `api-v*` tag, and deploys them to
GitHub Pages on every push to `main`.

## CLI commands

Run these from the repository root. The versions are pinned to the ones CI uses.

**1. Lint `openapi.yaml` with `@redocly/cli`**

```bash
npx @redocly/cli@2.56.0 lint docs/openapi/openapi.yaml
```

The linter reads [`redocly.yaml`](../../redocly.yaml): the `recommended` ruleset plus strict example validation. It
exits with code 1 on any error. Current result: **0 errors, 0 warnings.** The lab handout's `--watch` flag does not
exist on `redocly lint` in CLI v2, so re-run the command after each edit instead.

In the lecture demo an example that contradicts its schema only produces a warning, and lint still says "valid".
Here `no-invalid-media-type-examples` is an error, so the same mistake fails the build.

**2. Build the standalone Redoc HTML and the JSON bundle**

```bash
npx @redocly/cli@2.56.0 build-docs docs/openapi/openapi.yaml -o public/index.html
```

```bash
npx @redocly/cli@2.56.0 bundle docs/openapi/openapi.yaml -o docs/openapi/openapi.json
```

The first command produces one self-contained HTML file (about 245 KB) that opens directly in a browser. The second
resolves the YAML anchors into plain JSON for tools that need it. Run it after every change to the YAML. A test fails
when the two files differ.

**3. Run Swagger UI locally with Docker**

```bash
docker run -p 8080:8080 -v "$(pwd)/docs/openapi":/spec -e SWAGGER_JSON=/spec/openapi.json docker.swagger.io/swaggerapi/swagger-ui
```

In Windows PowerShell, use `${PWD}` instead of `$(pwd)`:

```powershell
docker run -p 8080:8080 -v "${PWD}/docs/openapi:/spec" -e SWAGGER_JSON=/spec/openapi.json docker.swagger.io/swaggerapi/swagger-ui
```

Then open <http://localhost:8080>. Without Docker, open the hosted sandbox or paste `openapi.yaml` into
<https://editor.swagger.io>.

**4. Mock server for "Try it out", the code samples, and the contract tests**

```bash
npx @stoplight/prism-cli@5.16.0 mock docs/openapi/openapi.yaml
```

Prism listens on `http://127.0.0.1:4010`, checks the Bearer header and each request body against the spec, and replays
the spec's examples. In Swagger UI, pick the `http://127.0.0.1:4010` server and authorize with any token.

**5. Force a documented error from the mock**

```bash
curl -i -H "Authorization: Bearer your_student_jwt_from_login" -H "Prefer: code=429" http://127.0.0.1:4010/api/v1/categories
```

The mock answers `429` with `Retry-After: 30` and the `rate_limited` body. Replace `429` with any status that the
operation documents. A call without the `Authorization` header gets `401`.

**6. Contract tests**

```bash
python -m unittest discover -s scripts -v
```

14 tests: the rules of the spec, the lint gate, every documented example served by the mock, and the expected
failure on the old path.
