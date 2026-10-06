/**
 * Extracts every ```ts block from the doc comments of the documented modules into .doc-examples/,
 * one file per example, so `tsc` can type-check them against the real code.
 *
 * Run: npm run check:examples
 */
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import typedocConfig from "./typedoc.json";

const outDir = ".doc-examples";
rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir);

let count = 0;
for (const file of typedocConfig.entryPoints) {
  const text = readFileSync(file, "utf8");
  for (const match of text.matchAll(/```ts\n([\s\S]*?)```/g)) {
    const code = match[1].replace(/^\s*\* ?/gm, "");
    const line = text.slice(0, match.index).split("\n").length;
    const name = `${file.replace(/[\/.]/g, "_")}_L${line}.ts`;
    // `export {}` makes each example its own module, so top-level names cannot clash.
    writeFileSync(`${outDir}/${name}`, `// From ${file}:${line}\n${code}\nexport {};\n`);
    count++;
  }
}
console.log(`Extracted ${count} examples to ${outDir}/`);
