import { createRequire } from "node:module";
import { cp, mkdir, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
const require = createRequire(import.meta.url);
const source = dirname(require.resolve("pdfjs-dist/package.json"));
const { version } = JSON.parse(
  await readFile(join(source, "package.json"), "utf8"),
);
const destination = new URL(`../public/pdfjs/${version}/`, import.meta.url);
await mkdir(destination, { recursive: true });
for (const directory of ["cmaps", "standard_fonts", "wasm", "iccs"]) {
  await cp(join(source, directory), new URL(`${directory}/`, destination), {
    recursive: true,
  });
}
await cp(
  join(source, "legacy/build/pdf.worker.min.mjs"),
  new URL("pdf.worker.min.mjs", destination),
);

await cp(join(source, "legacy/build/pdf.min.mjs"), new URL("pdf.min.mjs", destination));
