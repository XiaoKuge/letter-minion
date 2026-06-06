// Prepend the "use client" directive to the bundled output.
// esbuild strips module-level directives when bundling, and ESM import hoisting
// pushes imports above any banner — so we add it back here as the true first line,
// which is what the Next.js App Router looks for.
import { readFileSync, writeFileSync } from "node:fs";

const file = new URL("../dist/index.js", import.meta.url);
const src = readFileSync(file, "utf8");
if (!src.startsWith('"use client"') && !src.startsWith("'use client'")) {
  writeFileSync(file, '"use client";\n' + src);
  console.log('add-directive: prepended "use client" to dist/index.js');
} else {
  console.log("add-directive: directive already present");
}
