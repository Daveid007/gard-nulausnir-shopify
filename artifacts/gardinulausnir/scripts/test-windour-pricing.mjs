import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  calculateWindourQuote,
  getWindourProductConfig,
  validateWindourInput,
} from "../src/lib/windourPricing.ts";

const assertApprox = (actual, expected, message) => assert.ok(
  Math.abs(actual - expected) < 1e-10,
  `${message}: expected ${expected}, received ${actual}`,
);

// Independent constants for the global requirement:
// supplierUSD × 2 ÷ .6 × 121.16 × 1.24, rounded once per unit, then quantity.
const SHIPPING_MULTIPLIER = 2;
const MARGIN_DIVISOR = 0.6;
const USD_TO_ISK = 121.16;
const VAT_MULTIPLIER = 1.24;
const expectedRetailISK = (supplierUsd) => Math.round(
  supplierUsd * SHIPPING_MULTIPLIER / MARGIN_DIVISOR * USD_TO_ISK * VAT_MULTIPLIER,
);

// Real numeric fixtures for every WINdoûr product tier and material option.
const windourFixtures = [
  {
    name: "single-999 honeycomb minimum",
    productId: "windour-single-999",
    widthCm: 20,
    heightCm: 20,
    quantity: 2,
    material: "honeycomb",
    chargeableSqm: 1,
    supplierUsd: 29.5,
    unitIsk: 14773,
  },
  {
    name: "single-2000 honeycomb",
    productId: "windour-single-2000",
    widthCm: 100,
    heightCm: 150,
    quantity: 3,
    material: "honeycomb",
    chargeableSqm: 1.5,
    supplierUsd: 44.25,
    unitIsk: 22160,
  },
  {
    name: "duo-999 integrated system minimum",
    productId: "windour-duo-999",
    widthCm: 20,
    heightCm: 20,
    quantity: 1,
    chargeableSqm: 1.2,
    supplierUsd: 44.4,
    unitIsk: 22235,
  },
  {
    name: "duo-2000 integrated system",
    productId: "windour-duo-2000",
    widthCm: 100,
    heightCm: 150,
    quantity: 2,
    chargeableSqm: 1.5,
    supplierUsd: 55.5,
    unitIsk: 27794,
  },
  {
    name: "single-2000 polyester net",
    productId: "windour-single-2000",
    widthCm: 100,
    heightCm: 150,
    quantity: 1,
    material: "polyester-net",
    chargeableSqm: 1.5,
    supplierUsd: 40.5,
    unitIsk: 20282,
  },
  {
    name: "single-2000 Taiwan PET net",
    productId: "windour-single-2000",
    widthCm: 100,
    heightCm: 150,
    quantity: 1,
    material: "taiwan-pet-net",
    chargeableSqm: 1.5,
    supplierUsd: 38.25,
    unitIsk: 19155,
  },
];

for (const fixture of windourFixtures) {
  const quote = calculateWindourQuote(fixture);
  assert.ok(quote, `${fixture.name} should produce a quote`);
  assert.equal(quote.chargeableSqm, fixture.chargeableSqm, `${fixture.name} chargeable area changed`);
  assert.equal(quote.supplierProductUsd, fixture.supplierUsd, `${fixture.name} supplier USD changed`);
  assert.equal(
    expectedRetailISK(fixture.supplierUsd),
    fixture.unitIsk,
    `${fixture.name} fixture has an incorrect independent retail constant`,
  );
  assert.equal(quote.unitIsk, fixture.unitIsk, `${fixture.name} must round once per unit`);
  assert.equal(quote.totalIsk, fixture.unitIsk * fixture.quantity, `${fixture.name} quantity must multiply rounded units`);
  assertApprox(
    quote.totalUsd,
    fixture.supplierUsd * SHIPPING_MULTIPLIER / MARGIN_DIVISOR * VAT_MULTIPLIER,
    `${fixture.name} USD landed/margin/VAT total`,
  );
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

// WINdoûr currently exposes material (single only), dimensions and quantity.
// Motors, cordless operation, side tracks and no-drill are not quote controls;
// keep that boundary explicit until supplier data and a cart contract exist.
const windourSource = await readFile(new URL("../src/components/WindourCalculator.tsx", import.meta.url), "utf8");
for (const control of ["motor", "cordless", "sideTrack", "noDrill"]) {
  assert.doesNotMatch(windourSource, new RegExp(control, "i"), `WINdoûr unexpectedly exposes ${control}`);
}

console.log("PASS WINdoûr formula, product/material fixtures, validation, tiers and quantity");
console.log("UNIMPLEMENTED WINdoûr pricing controls: motor, cordless, sideTrack, noDrill");