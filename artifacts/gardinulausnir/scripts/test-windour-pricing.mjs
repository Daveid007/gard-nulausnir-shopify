import assert from "node:assert/strict";
import { calculateDualRollerPrice } from "../src/lib/dualRollerPricing.ts";
import {
  calculateWindourQuote,
  getWindourProductConfig,
  validateWindourInput,
} from "../src/lib/windourPricing.ts";

const singleMinimum = calculateWindourQuote({
  productId: "windour-single-999",
  widthCm: 20,
  heightCm: 20,
  quantity: 1,
  material: "honeycomb",
});
assert.ok(singleMinimum);
assert.equal(singleMinimum.chargeableSqm, 1, "single uses the provisional 1 m² minimum");
assert.equal(
  singleMinimum.unitIsk,
  Math.round(29.5 * 1 * 2 * 121.16 * 1.5 * 1.24),
  "single formula must include product, 100% shipping, markup and VAT",
);

const duoMinimum = calculateWindourQuote({
  productId: "windour-duo-999",
  widthCm: 20,
  heightCm: 20,
  quantity: 1,
});
assert.ok(duoMinimum);
assert.equal(duoMinimum.chargeableSqm, 1.2, "Duo uses the provisional 1.2 m² minimum");
assert.equal(duoMinimum.supplierUsdPerSqm, 37, "Duo uses the integrated 37 USD/m² rate");
assert.equal(
  duoMinimum.unitIsk,
  Math.round(37 * 1.2 * 2 * 121.16 * 1.5 * 1.24),
  "Duo must not apply a dual-opening surcharge",
);

const singleNetRates = [
  ["polyester-net", 27],
  ["taiwan-pet-net", 25.5],
];
for (const [material, rate] of singleNetRates) {
  const quote = calculateWindourQuote({
    productId: "windour-single-2000",
    widthCm: 100,
    heightCm: 100,
    quantity: 1,
    material,
  });
  assert.ok(quote);
  assert.equal(quote.supplierUsdPerSqm, rate);
}

assert.equal(getWindourProductConfig("windour-single-999").maxDimensionCm, 99.9);
assert.equal(getWindourProductConfig("windour-single-2000").maxDimensionCm, 200);
assert.ok(calculateWindourQuote({
  productId: "windour-single-999",
  widthCm: 99.9,
  heightCm: 99.9,
  quantity: 1,
  material: "honeycomb",
}));
assert.equal(calculateWindourQuote({
  productId: "windour-single-999",
  widthCm: 100,
  heightCm: 80,
  quantity: 1,
  material: "honeycomb",
}), null, "999 tier must reject a dimension above 99.9 cm");
assert.equal(calculateWindourQuote({
  productId: "windour-duo-2000",
  widthCm: 200.1,
  heightCm: 100,
  quantity: 1,
}), null, "2000 tier must reject a dimension above 200 cm");

assert.ok(validateWindourInput({
  productId: "windour-single-999",
  widthCm: 0,
  heightCm: 50,
  quantity: 1,
  material: "honeycomb",
}).width);
assert.ok(validateWindourInput({
  productId: "windour-single-999",
  widthCm: 50,
  heightCm: 50,
  quantity: 1,
}).material);
assert.ok(validateWindourInput({
  productId: "windour-duo-999",
  widthCm: 50,
  heightCm: 50,
  quantity: 0,
}).quantity);

const quantityOne = calculateWindourQuote({
  productId: "windour-single-2000",
  widthCm: 100,
  heightCm: 150,
  quantity: 1,
  material: "honeycomb",
});
const quantityThree = calculateWindourQuote({
  productId: "windour-single-2000",
  widthCm: 100,
  heightCm: 150,
  quantity: 3,
  material: "honeycomb",
});
assert.ok(quantityOne && quantityThree);
assert.equal(quantityThree.unitIsk, quantityOne.unitIsk, "quantity must not change unit rounding");
assert.equal(quantityThree.totalIsk, quantityOne.unitIsk * 3);

// Legacy parity guard: adding WINdoûr must not alter the existing dual-roller
// pricing helper or its visible representative price.
const legacy = calculateDualRollerPrice({
  width: 1200,
  height: 1500,
  quantity: 1,
  comboUsdPerSqm: 64.48,
  operation: "manual",
  sideTrack: false,
});
assert.equal(Math.round(legacy.totalISK), 120939, "legacy dual-roller parity changed");

console.log("PASS WINdoûr estimate formula, validation, tiers, quantity and legacy parity");