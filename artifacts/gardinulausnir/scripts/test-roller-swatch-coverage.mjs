import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { rollerWorkbookFabrics } from "../src/data/rollerWorkbookFabrics.ts";
import { rollerWorkbookSwatchFilename } from "../src/lib/rollerWorkbookSwatches.ts";

const skCodes = ["0101", "0105", "0107", "0404", "0405", "0406", "0505", "0540"];
for (const colour of skCodes) {
  const code = `RSSK00-${colour}`;
  const fabric = rollerWorkbookFabrics.find((item) => item.code === code);
  assert.ok(fabric, `Workbook fabric exists: ${code}`);
  const filename = rollerWorkbookSwatchFilename(fabric);
  assert.ok(filename, `Photo mapped: ${code}`);
  assert.match(filename, new RegExp(`SK[-_]${colour}_`));
  assert.ok(existsSync(new URL(`../src/assets/swatches/${filename}`, import.meta.url)));
}

// Unknown codes must never borrow another fabric's photograph.
assert.equal(rollerWorkbookSwatchFilename({ family: "roller", code: "RSHB3-9999" }), undefined);
assert.equal(rollerWorkbookSwatchFilename({ family: "sheer", code: "RSSK00-0101" }), undefined);

const roller = rollerWorkbookFabrics.filter((item) => item.family === "roller");
const missing = roller.filter((item) => !rollerWorkbookSwatchFilename(item));
assert.deepEqual(missing.map((item) => item.code), [], "Every offered roller fabric must have its own photo");
for (const fabric of roller) {
  const filename = rollerWorkbookSwatchFilename(fabric);
  if (filename) assert.ok(existsSync(new URL(`../src/assets/swatches/${filename}`, import.meta.url)), fabric.code);
}
console.log(`Roller photos: ${roller.length - missing.length}/${roller.length}; ${missing.length} still need verified photos.`);
