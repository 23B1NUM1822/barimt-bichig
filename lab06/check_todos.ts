/**
 * Fails when a TODO or FIXME in the documented source has no issue number.
 * Allowed form: `// TODO(#123): what is left to do`.
 *
 * Run: npm run check:todos
 */
import { readFileSync } from "node:fs";
import typedocConfig from "./typedoc.json";

const untracked: string[] = [];
for (const file of typedocConfig.entryPoints) {
  readFileSync(file, "utf8")
    .split("\n")
    .forEach((line, index) => {
      if (/\b(TODO|FIXME)\b(?!\(#\d+\))/.test(line)) untracked.push(`${file}:${index + 1}: ${line.trim()}`);
    });
}

if (untracked.length > 0) {
  console.error(`TODO/FIXME without an issue number:\n${untracked.join("\n")}`);
  process.exit(1);
}
console.log("Every TODO/FIXME links to an issue.");
