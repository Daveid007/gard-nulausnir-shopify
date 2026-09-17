import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pricing = await import(pathToFileURL(join(root, "src", "lib", "pricing.ts")).href);

assert.deepEqual(pricing.HONEYCOMB_45_LIMITS, {
  manual: { minWidthMm: 500, maxWidthMm: 2750, minHeightMm: 800, maxHeightMm: 3000, maxAreaSqm: 5.6 },
  cordless: { minWidthMm: 500, maxWidthMm: 2000, minHeightMm: 500, maxHeightMm: 1800, maxAreaSqm: 3 },
  motor: { minWidthMm: 550, maxWidthMm: 2000, minHeightMm: 500, maxHeightMm: 2500, maxAreaSqm: 4 },
}, "45 mm workbook limits changed");
assert.deepEqual(pricing.HONEYCOMB_25_LIMITS, {
  manual: { minWidthMm: 500, maxWidthMm: 2750, minHeightMm: 800, maxHeightMm: 3000, maxAreaSqm: 5.6 },
  cordless: { minWidthMm: 500, maxWidthMm: 2000, minHeightMm: 500, maxHeightMm: 1800, maxAreaSqm: 3 },
}, "25 mm workbook limits changed");
assert.deepEqual(pricing.DAYNIGHT_45_LIMITS, pricing.HONEYCOMB_45_LIMITS, "Day & Night must use the 45 mm envelope");
assert.deepEqual(pricing.TDBU_45_LIMITS, {
  manual: { minWidthMm: 800, maxWidthMm: 2750, minHeightMm: 800, maxHeightMm: 3000, maxAreaSqm: 5.6 },
  cordless: { minWidthMm: 500, maxWidthMm: 2000, minHeightMm: 500, maxHeightMm: 1800, maxAreaSqm: 3 },
}, "TDBU workbook limits changed");

for (const [product, operation, widthMm, heightMm] of [
  ["honeycomb-45", "manual", 500, 800],
  ["honeycomb-45", "cordless", 2000, 1500],
  ["honeycomb-45", "motor", 2000, 2000],
  ["honeycomb-25", "manual", 2750, 2000],
  ["honeycomb-25", "cordless", 1666, 1800],
  ["daynight", "motor", 2000, 2000],
  ["tdbu", "manual", 800, 800],
  ["tdbu", "cordless", 2000, 1500],
]) {
  assert.equal(
    pricing.validateHoneycombSize({ product, operation, widthMm, heightMm }).ok,
    true,
    `${product} ${operation} boundary should be accepted`,
  );
}

assert.equal(pricing.validateHoneycombSize({
  product: "honeycomb-45",
  operation: "manual",
  widthMm: 500,
  heightMm: 799,
}).ok, false, "manual 45 mm minimum height must be 800 mm");
assert.equal(pricing.validateHoneycombSize({
  product: "honeycomb-45",
  operation: "cordless",
  widthMm: 2001,
  heightMm: 1000,
}).ok, false, "cordless 45 mm maximum width must be 2000 mm");
assert.equal(pricing.validateHoneycombSize({
  product: "honeycomb-45",
  operation: "motor",
  widthMm: 500,
  heightMm: 1000,
}).ok, false, "motor 45 mm minimum width must be 550 mm");
assert.equal(pricing.validateHoneycombSize({
  product: "tdbu",
  operation: "manual",
  widthMm: 799,
  heightMm: 1000,
}).ok, false, "TDBU cord minimum width must be 800 mm");
assert.equal(pricing.validateHoneycombSize({
  product: "tdbu",
  operation: "motor",
  widthMm: 1200,
  heightMm: 1500,
}).ok, false, "45 mm TDBU motor must be unsupported");
assert.equal(pricing.validateHoneycombSize({
  product: "honeycomb-25",
  operation: "motor",
  widthMm: 1200,
  heightMm: 1500,
}).ok, false, "25 mm motor must be unsupported");
assert.equal(pricing.validateHoneycombSize({
  product: "honeycomb-45",
  operation: "manual",
  widthMm: 500,
  heightMm: 800,
  mountPosition: "inside",
}).ok, false, "inside mount must apply the 5 mm width deduction");

assert.equal(pricing.tdbuSupplierRate("KB420"), 28.26, "TDBU premium workbook rate changed");
assert.equal(pricing.SUPPLIER_TO_RETAIL_ISK, 2 / 0.6 * 121.16 * 1.24, "retail conversion changed");
assert.equal(pricing.blindAccessorySupplierUsd(1000, 1000, 1, { noDrill: true }), 3, "no-drill price changed");
assert.equal(
  pricing.blindAccessorySupplierUsd(1000, 1000, 1, { sideTrack: true, sideTrackType: "u" }) -
  pricing.blindAccessorySupplierUsd(1000, 1000, 1, { sideTrack: true, sideTrackType: "l" }),
  5,
  "U/L track prices changed",
);

const cartSource = await readFile(join(root, "src", "lib", "cart.tsx"), "utf8");
assert.match(cartSource, /tdbuSupplierRate\(item\.fabricCode\)/, "cart must use the authoritative TDBU rate");
assert.doesNotMatch(cartSource, /tdbuSupplierRate\(item\.fabricCode\)\s*\?\?\s*item\.fabricUsdPerSqm/, "cart must not fall back to client TDBU rates");
assert.match(cartSource, /operation !== "manual" && item\.operation !== "cordless"/, "cart must reject TDBU motor operation");

console.log("PASS honeycomb workbook constraint checks");