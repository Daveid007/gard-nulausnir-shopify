import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { rollerWorkbookFabrics } from "../src/data/rollerWorkbookFabrics.ts";
import { rollerWorkbookSwatchFilename } from "../src/lib/rollerWorkbookSwatches.ts";

const root = new URL("../", import.meta.url);
const calculator = await readFile(new URL("src/components/legacy-calculators/RollerWorkbookCalculator.tsx", root), "utf8");
const card = await readFile(new URL("src/components/legacy-calculators/WorkbookFabricSwatch.tsx", root), "utf8");
const swatchGrid = calculator.slice(
  calculator.indexOf('data-testid="rw-swatches"'),
  calculator.indexOf("{visibleFabrics.length === 0"),
);

assert.match(swatchGrid, /visibleFabrics\.map\(/, "every search-matching fabric must get a card");
assert.doesNotMatch(swatchGrid, /\.filter\(/, "missing photographs must never hide fabric choices");
assert.match(swatchGrid, /onSelect=\{\(\) => setFabricCode\(item\.code\)\}/, "all cards must remain selectable");
assert.match(card, /onError=\{\(\) => setFailedImage\(image\)\}/, "failed image requests must fall back without removing the card");
assert.match(card, /image !== failedImage/, "a replacement image must not inherit an earlier image's failure");
assert.match(card, /Mynd ekki tiltæk/, "missing photos must be labelled, not replaced with invented colors");
assert.match(card, /Litur samkvæmt efniskóða/, "unspecified supplier colors must have a clear label");
assert.match(card, /aria-pressed=\{selected\}/, "selection must be accessible even without a photo");

const counts = { roller: 139, zebra: 168, sheer: 22, butterfly: 9 };
for (const [family, count] of Object.entries(counts)) {
  assert.equal(rollerWorkbookFabrics.filter((fabric) => fabric.family === family).length, count);
}
assert.equal(new Set(rollerWorkbookFabrics.map((fabric) => fabric.code)).size, 338);

let mappedPhotos = 0;
for (const fabric of rollerWorkbookFabrics) {
  const filename = rollerWorkbookSwatchFilename(fabric);
  if (!filename) continue;
  assert.equal(fabric.family, "roller", "never borrow unrelated photos for other product families");
  const path = new URL("src/assets/swatches/" + filename, root);
  await readFile(path);
  mappedPhotos++;
}
assert.equal(mappedPhotos, 80, "preserve every existing confirmed image mapping");
console.log(`PASS: 338 selectable fabrics, 80 confirmed photos; no image-based hiding (${fileURLToPath(root)}).`);
