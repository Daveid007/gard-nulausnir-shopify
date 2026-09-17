import assert from "node:assert/strict";
import { readFile, access } from "node:fs/promises";
import { rollerWorkbookFabrics } from "../src/data/rollerWorkbookFabrics.ts";
import { COLLECTIONS } from "../src/pages/storefront/_shared/fabric-collections.ts";
import { rollerWorkbookSwatchFilename } from "../src/lib/rollerWorkbookSwatches.ts";

const approved = new Set(COLLECTIONS.flatMap((collection) => collection.swatches.map((swatch) => swatch.img)));
const honeycombSource = await readFile(new URL("../src/pages/storefront/_shared/honeycomb-fabrics.ts", import.meta.url), "utf8");
const honeycombImages = new Set([...honeycombSource.matchAll(/from ["']@assets\/([^"']+)["']/g)].map((match) => match[1]));

// KN407's timestamp contains 3914; it is not the RS-3914 roller fabric.
assert.equal(rollerWorkbookSwatchFilename({ family: "roller", code: "RS-3914" }), "柔景_0000_RS_3914_1779801861209.jpg");
assert.equal(rollerWorkbookSwatchFilename({ family: "roller", code: "RSMA0-M01" }), "柔景_0123_MA0_M01_1779802167371.jpg");
for (const code of ["KT401", "KB401", "KS401", "KN407", "RS-KN407", "391", "1780356839147", "unknown"]) {
  assert.equal(rollerWorkbookSwatchFilename({ family: "roller", code }), undefined, code);
}
for (const family of ["zebra", "sheer", "butterfly"]) {
  assert.equal(rollerWorkbookSwatchFilename({ family, code: "RS-3914" }), undefined);
}
let matched = 0;
for (const fabric of rollerWorkbookFabrics) {
  const filename = rollerWorkbookSwatchFilename(fabric);
  if (!filename) continue;
  matched++;
  assert.equal(fabric.family, "roller");
  assert.ok(approved.has(filename), fabric.code);
  assert.ok(!honeycombImages.has(filename), `${fabric.code} must not use a honeycomb image`);
  await access(new URL(`../src/assets/swatches/${filename}`, import.meta.url));
}
assert.ok(matched > 0, "verified roller photos should remain available");
console.log(`PASS fabric-family separation: ${rollerWorkbookFabrics.length} codes checked, ${matched} verified roller images, no honeycomb images`);