/**
 * Hallucination test for docstrings (Lab 06, UE-6 phase d).
 *
 * It reads every doc comment in a module and checks, by reflection on the real code, that what the
 * comment refers to exists:
 *
 *   1. `{@link Name}` points at something this module exports or imports.
 *   2. `@example` code does not use the module's private (non-exported) symbols.
 *   3. `ExportedValue.member` in an example is a real member of that export at runtime.
 *   4. `evaluation.field` in an example is a real field of `EvaluationSchema`.
 *   5. Category slugs, difficulties, and verdicts written in a comment are real enum values.
 *
 * Run: npm run test:hallucinations
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import ts from "typescript";
import * as evaluateModule from "@/lib/ai/evaluate";
import { Difficulty } from "@/lib/generated/prisma/enums";
import { modules } from "@/lib/modules";

type Finding = { check: string; name: string; owner: string };

const exportsAtRuntime = evaluateModule as Record<string, unknown>;
const evaluationFields = Object.keys(evaluateModule.EvaluationSchema.shape);

/** Real values for the enum-like strings that docstrings mention. */
const realValues = {
  "category slug": modules.map((m) => m.slug as string),
  difficulty: Object.values(Difficulty) as string[],
  verdict: [...evaluateModule.EvaluationSchema.shape.verdict.options] as string[],
};

function isExported(statement: ts.Statement): boolean {
  return ts.canHaveModifiers(statement) && !!ts.getModifiers(statement)?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
}

function declaredName(statement: ts.Statement): string | undefined {
  if (ts.isVariableStatement(statement)) return statement.declarationList.declarations[0].name.getText();
  if (ts.isFunctionDeclaration(statement) || ts.isClassDeclaration(statement) || ts.isTypeAliasDeclaration(statement)) {
    return statement.name?.getText();
  }
  return undefined;
}

/** The code of every `@example` block in a doc comment, without the leading ` * `. */
function exampleCode(comment: string): string {
  const lines = comment.split("\n").map((line) => line.replace(/^\s*\*\s?/, ""));
  const code: string[] = [];
  let inExample = false;
  for (const line of lines) {
    if (line.startsWith("@")) inExample = line.startsWith("@example");
    else if (inExample) code.push(line);
  }
  return code.join("\n");
}

function findHallucinations(path: string): Finding[] {
  const text = readFileSync(path, "utf8");
  const source = ts.createSourceFile(path, text, ts.ScriptTarget.Latest, true);

  const exported = new Set<string>();
  const privateNames = new Set<string>();
  const imported = new Set<string>();
  for (const statement of source.statements) {
    if (ts.isImportDeclaration(statement)) {
      const clause = statement.importClause;
      if (clause?.name) imported.add(clause.name.text);
      if (clause?.namedBindings && ts.isNamedImports(clause.namedBindings)) {
        for (const element of clause.namedBindings.elements) imported.add(element.name.text);
      }
      continue;
    }
    const name = declaredName(statement);
    if (name) (isExported(statement) ? exported : privateNames).add(name);
  }

  const findings: Finding[] = [];
  const report = (check: string, name: string, owner: string) => {
    if (!findings.some((f) => f.check === check && f.name === name && f.owner === owner)) findings.push({ check, name, owner });
  };

  for (const statement of source.statements) {
    const owner = declaredName(statement);
    if (!owner) continue;
    const comments = (ts.getLeadingCommentRanges(text, statement.getFullStart()) ?? [])
      .map((range) => text.slice(range.pos, range.end))
      .filter((comment) => comment.startsWith("/**"));

    for (const comment of comments) {
      // 1. Links must resolve to an export or an import.
      for (const [, name] of comment.matchAll(/\{@link\s+([A-Za-z_$][\w$]*)/g)) {
        if (!exported.has(name) && !imported.has(name)) {
          report(privateNames.has(name) ? "link to a private symbol" : "link to a symbol that does not exist", name, owner);
        }
      }

      const example = exampleCode(comment);

      // 2. Examples are written for callers, so they cannot use private symbols.
      for (const name of privateNames) {
        const usedAsWord = new RegExp(`(?<![.\\w$])${name}\\b`).test(example);
        const redeclaredInExample = new RegExp(`\\b(const|let|var)\\s+${name}\\b`).test(example);
        if (usedAsWord && !redeclaredInExample) report("example uses a private symbol", name, owner);
      }

      // 3. Members of exported values must exist at runtime.
      for (const [, name, member] of example.matchAll(/(?<![.\w$])([A-Za-z_$][\w$]*)\.([A-Za-z_$][\w$]*)/g)) {
        const value = exportsAtRuntime[name];
        if (exported.has(name) && value != null && !(member in Object(value))) {
          report("member does not exist", `${name}.${member}`, owner);
        }
      }

      // 4. Fields read from an evaluation must be fields of the schema.
      for (const [, field] of example.matchAll(/\bevaluation\.([A-Za-z_$][\w$]*)/g)) {
        if (!evaluationFields.includes(field)) report("evaluation field does not exist", field, owner);
      }

      // 5. Enum-like values must be real.
      const mentioned: [keyof typeof realValues, string][] = [
        ...[...comment.matchAll(/\bslug:\s*"([^"]+)"/g)].map(([, v]): [keyof typeof realValues, string] => ["category slug", v]),
        ...[...comment.matchAll(/\bdifficulty:\s*"([^"]+)"/g)].map(([, v]): [keyof typeof realValues, string] => ["difficulty", v]),
        ...[...comment.matchAll(/\bverdict:\s*"([^"]+)"/g)].map(([, v]): [keyof typeof realValues, string] => ["verdict", v]),
      ];
      for (const line of comment.split("\n").filter((l) => /@param\s+category\b/.test(l))) {
        for (const [, v] of line.matchAll(/"([^"]+)"/g)) mentioned.push(["category slug", v]);
      }
      for (const [kind, value] of mentioned) {
        if (!realValues[kind].includes(value)) report(`${kind} does not exist`, value, owner);
      }
    }
  }
  return findings;
}

test("final docstrings refer only to real, public API", () => {
  assert.deepEqual(findHallucinations("lib/ai/evaluate.ts"), []);
});

test("manual draft refers only to real, public API", () => {
  assert.deepEqual(findHallucinations("audit/manual_docstring.ts"), []);
});

test("the unedited AI draft is caught: ghost links, private symbols in examples, invented enum values", () => {
  const findings = findHallucinations("audit/ai_docstring.ts");
  console.log(findings.map((f) => `  ${f.owner}: ${f.check}: ${f.name}`).join("\n"));

  const names = (check: string) => findings.filter((f) => f.check === check).map((f) => f.name);
  assert.ok(names("link to a private symbol").includes("buildSystemPrompt"));
  assert.ok(names("link to a private symbol").includes("buildUserMessage"));
  assert.ok(names("example uses a private symbol").includes("getClient"));
  assert.ok(names("category slug does not exist").includes("mathematics"));
  assert.ok(names("difficulty does not exist").includes("easy"));
});
