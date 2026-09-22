import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  calculateWindourQuote,
  getWindourProductConfig,
  validateWindourInput,
} from "../src/lib/windourPricing.ts";
import {
  THEDOUR_FRAME_COLOURS,
  THEDOUR_HONEYCOMB_COLOURS,
  THEDOUR_WINDOUR_SOURCES,
} from "../src/lib/thedourProductOptions.ts";
import { products } from "../src/pages/storefront/_shared/data.ts";

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
    name: "duo-999 integrated system single-opening minimum",
    productId: "windour-duo-999",
    widthCm: 20,
    heightCm: 20,
    quantity: 1,
    chargeableSqm: 1,
    supplierUsd: 37,
    unitIsk: 18529,
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

// The minimum is an opening rule, not a product-family rule. Exercise both
// families and both tiers below the minimum, plus both families above it.
for (const productId of [
  "windour-single-999",
  "windour-single-2000",
  "windour-duo-999",
  "windour-duo-2000",
]) {
  for (const [openingType, expectedMinimum] of [["single", 1], ["double", 1.2]]) {
    const quote = calculateWindourQuote({
      productId,
      widthCm: 20,
      heightCm: 20,
      quantity: 1,
      material: "honeycomb",
      openingType,
    });
    assert.ok(quote);
    assert.equal(quote.chargeableSqm, expectedMinimum, `${productId} ${openingType} minimum`);
    assert.equal(
      quote.openingSurchargeUsd,
      openingType === "double" ? 2.5 * expectedMinimum : 0,
      `${productId} ${openingType} surcharge`,
    );
  }
}

for (const productId of ["windour-single-2000", "windour-duo-2000"]) {
  for (const openingType of ["single", "double"]) {
    const quote = calculateWindourQuote({
      productId,
      widthCm: 100,
      heightCm: 150,
      quantity: 1,
      material: "honeycomb",
      openingType,
    });
    assert.ok(quote);
    assert.equal(quote.chargeableSqm, 1.5, `${productId} ${openingType} must use area above minimum`);
    assert.equal(quote.openingSurchargeUsd, openingType === "double" ? 3.75 : 0);
  }
}

const duoSingleMinimum = calculateWindourQuote({
  productId: "windour-duo-999",
  widthCm: 20,
  heightCm: 20,
  quantity: 1,
  openingType: "single",
});
const duoDoubleMinimum = calculateWindourQuote({
  productId: "windour-duo-999",
  widthCm: 20,
  heightCm: 20,
  quantity: 1,
  openingType: "double",
});
assert.ok(duoSingleMinimum && duoDoubleMinimum);
assert.equal(duoSingleMinimum.unitIsk, 18529);
assert.equal(duoDoubleMinimum.supplierProductUsd, 47.4);
assert.equal(duoDoubleMinimum.unitIsk, 23738);

const doubleOpening = calculateWindourQuote({
  productId: "windour-single-2000",
  widthCm: 100,
  heightCm: 150,
  quantity: 1,
  material: "honeycomb",
  openingType: "double",
  openingDirection: "vertical",
});
assert.ok(doubleOpening);
assert.equal(doubleOpening.openingSurchargeUsd, 3.75);
assert.equal(doubleOpening.supplierProductUsd, 48);
assert.equal(doubleOpening.openingType, "double");
assert.equal(doubleOpening.openingDirection, "vertical");
assert.equal(validateWindourInput({
  productId: "windour-duo-999",
  widthCm: 50,
  heightCm: 50,
  quantity: 1,
  openingType: "triple",
}).openingType, "Veldu einfalda eða tvöfalda opnun.");
assert.equal(validateWindourInput({
  productId: "windour-duo-999",
  widthCm: 50,
  heightCm: 50,
  quantity: 1,
  openingDirection: "up",
}).openingDirection, "Veldu lárétta eða lóðrétta opnun.");

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
assert.equal(validateWindourInput({
  productId: "windour-single-999",
  widthCm: 50,
  heightCm: 50,
  quantity: 1,
}).material, "Veldu eitt efni fyrir Ramma rúllugardínur.");
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
const duoLabelQuote = calculateWindourQuote({
  productId: "windour-duo-999",
  widthCm: 50,
  heightCm: 50,
  quantity: 1,
});
assert.ok(duoLabelQuote);
assert.equal(duoLabelQuote.materialLabel, "Ramma flugnanet og myrkvunargardínur · myrkvun + net");

// WINdoûr exposes material (single only), verified frame/honeycomb colours,
// dimensions and quantity.
// Motors, cordless operation, side tracks and no-drill are not quote controls;
// keep that boundary explicit until supplier data and a cart contract exist.
const windourSource = await readFile(new URL("../src/components/WindourCalculator.tsx", import.meta.url), "utf8");
const wizardSource = await readFile(new URL("../src/components/ThedourScreenWizard.tsx", import.meta.url), "utf8");
for (const control of ["motor", "cordless", "sideTrack", "noDrill"]) {
  assert.doesNotMatch(windourSource, new RegExp(control, "i"), `WINdoûr unexpectedly exposes ${control}`);
}

assert.equal(THEDOUR_FRAME_COLOURS.length, 9, "only currently named supplier frame colours should be selectable");
assert.deepEqual(
  THEDOUR_HONEYCOMB_COLOURS.map((option) => option.name),
  ["Black", "Light Grey", "Off White", "Sky Blue"],
);
assert.equal(new Set(THEDOUR_FRAME_COLOURS.map((option) => option.name)).size, THEDOUR_FRAME_COLOURS.length);
for (const option of [...THEDOUR_FRAME_COLOURS, ...THEDOUR_HONEYCOMB_COLOURS]) {
  assert.match(option.image, /^https:\/\/option\.nyc3\.digitaloceanspaces\.com\//);
}
for (const [productId, sourceUrl] of Object.entries(THEDOUR_WINDOUR_SOURCES)) {
  const product = products.find((candidate) => candidate.id === productId);
  assert.ok(product, `${productId} storefront mapping is missing`);
  assert.equal(product.sourceUrl, sourceUrl);
  assert.equal(product.shopifyHandle, new URL(sourceUrl).pathname.split("/").pop());
}
assert.match(windourSource, /frameColor/);
assert.match(windourSource, /materialColor/);
assert.match(windourSource, /Einföld opnun/);
assert.match(windourSource, /Tvöföld opnun/);
assert.match(windourSource, /Lárétt · til hliðar/);
assert.match(windourSource, /Lóðrétt · upp\/niður/);
assert.match(windourSource, /WINDOUR_DOUBLE_OPENING_USD_PER_SQM/);
assert.match(windourSource, /Senda stillingar í fyrirspurn/);
assert.match(windourSource, /Senda þetta val í fyrirspurn/);
// Guided measurement records all six raw readings. Only the minimum feeds the
// supported recessed WINdoûr estimate; overlap remains confirmation-only.
assert.match(wizardSource, /Math\.min\(\.\.\.numericWidths\)/);
assert.match(wizardSource, /Math\.min\(\.\.\.numericHeights\)/);
assert.match(wizardSource, /widthReadingsMm/);
assert.match(wizardSource, /heightReadingsMm/);
assert.match(wizardSource, /Engin frádráttur eða skörun hefur verið ágiskuð/);
assert.match(wizardSource, /DUO er myrkvun og net í einu kerfi\. Það er ekki tvöföld opnun/);
assert.match(wizardSource, /roldour-slimline-horizontal/);
const cartSource = await readFile(new URL("../src/lib/cart.tsx", import.meta.url), "utf8");
assert.match(cartSource, /rammi: \$\{item\.frameColor/);
assert.match(cartSource, /honeycomb: \$\{item\.materialColor/);
assert.match(cartSource, /item\.openingType/);
assert.match(cartSource, /item\.openingDirection/);
assert.match(cartSource, /item\.widthReadingsMm/);
assert.match(cartSource, /item\.heightReadingsMm/);
assert.equal(
  cartSource.match(/openingType: item\.openingType/g)?.length,
  3,
  "line price, supplier price and persisted-cart validation must all re-quote the selected opening type",
);
assert.match(cartSource, /chargeableSqm: quote\.chargeableSqm/);
assert.match(cartSource, /unitIsk: quote\.unitIsk/);
assert.match(cartSource, /needsReconfigure: false/);
assert.doesNotMatch(
  cartSource,
  /quote\.chargeableSqm !== item\.chargeableSqm/,
  "stale persisted WINdoûr totals must be repriced instead of silently dropped",
);
assert.match(wizardSource, /lágmarksverð miðast við 1 m²/);
assert.match(wizardSource, /lágmarksverð miðast við 1,2 m²/);
assert.match(wizardSource, /ræðst af opnun, ekki DUO/);
// WINdoûr remains an estimate/inquiry-only family. The API checkout schema
// intentionally has no WINdoûr line type, so no server path can omit the
// surcharge while creating a commercial order.
const checkoutSource = await readFile(new URL("../../api-server/src/routes/checkout.ts", import.meta.url), "utf8");
const checkoutUnion = checkoutSource.match(/const cartItemSchema = z\.discriminatedUnion\("type", \[(.*?)\]\);/s)?.[1] ?? "";
assert.doesNotMatch(checkoutUnion, /windour/i, "WINdoûr must not enter server checkout without server-side re-quoting");
const productDetailSource = await readFile(new URL("../src/pages/storefront/ProductDetail.tsx", import.meta.url), "utf8");
assert.match(productDetailSource, /product\.id === "netdour-trackless-door" \|\| product\.id === "blinddour-trackless-door"/);
assert.match(productDetailSource, /isBlinddour && renderThedourColours/);
assert.match(productDetailSource, /Senda litaval í fyrirspurn/);
for (const productId of ["netdour-trackless-door", "blinddour-trackless-door"]) {
  const product = products.find((candidate) => candidate.id === productId);
  assert.ok(product?.sourceUrl?.startsWith("https://www.thedour.com/products/"));
  assert.ok(product.description, `${productId} needs a source-derived Icelandic description`);
}
assert.doesNotMatch(productDetailSource, /isVerticalSheer[^;]*THEDOUR_/i, "Thedoûr colours must not be assigned to Vertical Sheer");

console.log("PASS WINdoûr formula, product/material fixtures, verified colours, cart fields, sources, validation, tiers and quantity");
console.log("UNIMPLEMENTED WINdoûr pricing controls: motor, cordless, sideTrack, noDrill");