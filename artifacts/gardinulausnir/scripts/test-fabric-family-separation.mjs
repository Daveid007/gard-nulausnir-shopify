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
const reviewedAdditions = new Map([
  ["RSBR17071-0001", "柔景_0036_RSBR_170710001_1779801961717.jpg"],
  ["RSBR17071-0002", "柔景_0037_RSBR_170710002_1779801961718.jpg"],
  ["RSBR17071-0006", "柔景_0038_RSBR_170710006_1779801961719.jpg"],
  ["RSBR17071-0008", "柔景_0039_RSBR_170710008_1779801961719.jpg"],
  ["RSEBR12022-0001", "柔景_0045_RSEBR_120220001_1779801961720.jpg"],
  ["RSEBR12022-0002", "柔景_0046_RSEBR_120220002_1779801961724.jpg"],
  ["RSEBR12022-0003", "柔景_0047_RSEBR_120220003_1779801961724.jpg"],
  ["RSBR20049-0804", "柔景_0035_RSBR_20049_0804_1779801961716.jpg"],
  ["RSBR20049-8608", "柔景_0031_RSBR_20049_8608_1779801913042.jpg"],
  ["RSBR13021-0001", "柔景_0044_RSBR_130210001_1779801961720.jpg"],
  ["RSBR13021-0002", "柔景_0043_RSBR_130210002_1779801961720.jpg"],
  ["RSBR13021-0003", "柔景_0042_RSBR_130210003_1779801961720.jpg"],
  ["RSBR13021-0004", "柔景_0041_RSBR_130210004_1779801961719.jpg"],
  ["RSBR13021-0006", "柔景_0040_RSBR_130210006_1779801961719.jpg"],
  ["RSGT3-0102", "柔景_0094_GT30102_1779802042322.jpg"],
  ["RSGT3-0104", "柔景_0095_GT30104_1779802042322.jpg"],
]);
for (const [code, filename] of reviewedAdditions) {
  assert.equal(rollerWorkbookSwatchFilename({ family: "roller", code }), filename, code);
}
// Similar-looking incomplete supplier codes remain unavailable: optional RS is
// the only prefix difference accepted.
for (const code of ["RSMA0-M02", "RSMA0-M16", "RSGT3-0105", "RSBR20049-4304"]) {
  assert.equal(rollerWorkbookSwatchFilename({ family: "roller", code }), undefined, code);
}
for (const code of ["KT401", "KB401", "KS401", "KN407", "RS-KN407", "391", "1780356839147", "unknown"]) {
  assert.equal(rollerWorkbookSwatchFilename({ family: "roller", code }), undefined, code);
}
for (const family of ["zebra", "sheer", "butterfly"]) {
  assert.equal(rollerWorkbookSwatchFilename({ family, code: "RS-3914" }), undefined);
  for (const code of reviewedAdditions.keys()) {
    assert.equal(rollerWorkbookSwatchFilename({ family, code }), undefined, `${family}:${code}`);
  }
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
const rollerCount = rollerWorkbookFabrics.filter((fabric) => fabric.family === "roller").length;
assert.equal(matched, 80, "only the reviewed exact roller photos should resolve");
assert.equal(rollerCount - matched, 59, "unavailable roller photos must remain undefined");
console.log(`PASS fabric-family separation: ${rollerWorkbookFabrics.length} codes checked, ${matched}/${rollerCount} verified roller images, ${rollerCount - matched} unavailable, no honeycomb images`);