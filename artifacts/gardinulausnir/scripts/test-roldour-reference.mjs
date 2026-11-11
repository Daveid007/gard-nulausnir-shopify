import assert from "node:assert/strict";
import { getRoldourReferencePrice, ROLDOUr_REFERENCE } from "../src/lib/roldourReferencePrice.ts";

const selection = {
  mappedProductId: ROLDOUr_REFERENCE.productId, family: "roldour",
  direction: "vertical", system: "duo", material: "honeycomb",
  openingType: "single", fitting: "recessed", measurementMode: "opening",
  frameColor: "Dark Grey", materialColor: "Dark Grey", widthMm: 1530, heightMm: 1220,
};
assert.equal(getRoldourReferencePrice(selection), 37951);
for (const change of [
  { widthMm: 1499 }, { widthMm: 1600 }, { heightMm: 1199 }, { heightMm: 1300 },
  { widthMm: NaN }, { heightMm: Infinity }, { frameColor: "White" },
  { materialColor: "White" }, { mappedProductId: "roldour-duo-vertical-large" },
  { family: "windour" }, { direction: "horizontal" }, { system: "single" },
  { material: "polyester-net" }, { openingType: "double" }, { fitting: "overlap" },
  { measurementMode: "outer-frame" },
]) assert.equal(getRoldourReferencePrice({ ...selection, ...change }), null, JSON.stringify(change));
assert.equal(getRoldourReferencePrice({ ...selection, widthMm: 1500, heightMm: 1200 }), 37951);
assert.equal(getRoldourReferencePrice({ ...selection, widthMm: 1599, heightMm: 1299 }), 37951);
console.log("ROLdoûr reference pricing and configuration boundaries passed.");
