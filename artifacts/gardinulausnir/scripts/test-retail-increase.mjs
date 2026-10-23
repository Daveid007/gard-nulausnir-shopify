import assert from "node:assert/strict";
import { register } from "node:module";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

register(`data:text/javascript,${encodeURIComponent(`
  export async function resolve(specifier, context, nextResolve) {
    if (specifier === "./pricing") return nextResolve("./pricing.ts", context);
    if (specifier === "./rollerWorkbookFabrics") return nextResolve("./rollerWorkbookFabrics.ts", context);
    return nextResolve(specifier, context);
  }
`)}`, import.meta.url);

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pricing = await import(pathToFileURL(join(root, "src/lib/pricing.ts")).href);
const dual = await import(pathToFileURL(join(root, "src/lib/dualRollerPricing.ts")).href);
const windour = await import(pathToFileURL(join(root, "src/lib/windourPricing.ts")).href);
const roller = await import(pathToFileURL(join(root, "src/lib/rollerWorkbookPricing.ts")).href);
const vertical = await import(pathToFileURL(join(root, "src/lib/verticalSheerPricing.ts")).href);

const originalFactor = 2 / 0.6 * 121.16 * 1.24;
const expectedUnit = (usd) => Math.round(usd * originalFactor * 1.25);
assert.equal(pricing.RETAIL_PRICE_MULTIPLIER, 1.25);
assert.equal(pricing.increasedRetailPriceIsk(11268), 14085);
assert.equal(pricing.retailPriceFromSupplierUsd(22.5), 14085);
assert.equal(pricing.USD_TO_ISK, 121.16);
// The later REV 4 supplier import changed this baseline, independently of
// the retail uplift. Keep the confirmed supplier cost, not the old workbook.
assert.equal(pricing.honeycombSupplierRate("KT401", 45), 12.82);
assert.equal(pricing.U_TRACK_USD_PER_M, 10);
assert.equal(pricing.L_TRACK_USD_PER_M, 5);
assert.equal(pricing.MOTOR_UP_TO_4M2_USD, 34.5573219076603);
for (const supplierUsd of [0, 7, 12.5, 22.5, 34.5573219076603, 69.12, 153.98765, 1000]) {
  assert.equal(pricing.retailPriceFromSupplierUsd(supplierUsd), expectedUnit(supplierUsd));
  assert.equal(pricing.retailTotalFromSupplierUsd(supplierUsd, 3), expectedUnit(supplierUsd) * 3);
}
for (const invalid of [-1, NaN, Infinity]) {
  assert.throws(() => pricing.increasedRetailPriceIsk(invalid));
}

for (const rate of [12.5, 15.63, 16.0010700873129, 26.3427429770029]) {
  for (const options of [
    { operation: "manual" },
    { operation: "cordless", noDrill: true, mountPosition: "inside" },
    { operation: "motor", sideTrack: true, sideTrackType: "u", holder: true },
    { operation: "manual", sideTrack: true, sideTrackType: "l" },
  ]) {
    const supplierUsd = pricing.blindSupplierUsd(1200, 1500, rate, options);
    assert.equal(pricing.blindRetailPriceIsk(1200, 1500, rate, options), expectedUnit(supplierUsd));
  }
}
assert.equal(dual.DUAL_ROLLER_RETAIL_ISK, pricing.SUPPLIER_TO_RETAIL_ISK);
assert.equal(vertical.VERTICAL_SHEER_RETAIL_FACTOR, pricing.SUPPLIER_TO_RETAIL_ISK);
assert.equal(roller.rollerWorkbookFabrics.length, 338);
for (const fabric of roller.rollerWorkbookFabrics) {
  const quote = roller.quoteRollerWorkbookBlind({
    family: fabric.family, fabricCode: fabric.code, widthCm: 120, heightCm: 150,
    quantity: 3, operation: "manual", manualControl: "cord", mountPosition: "outside",
    track: "none", cassette: "Square with fabric inserted",
  });
  assert.equal(quote.ok, true, fabric.code);
  assert.equal(quote.retail.unitIsk, expectedUnit(quote.supplier.unitUsd), fabric.code);
  assert.equal(quote.retail.totalIsk, quote.retail.unitIsk * 3, fabric.code);
}
for (const productId of windour.WINDOUR_PRODUCT_IDS) {
  const quote = windour.calculateWindourQuote({
    productId, material: "honeycomb", widthCm: 90, heightCm: 90,
    quantity: 3, openingType: "single", openingDirection: "horizontal",
  });
  assert.ok(quote, productId);
  assert.equal(quote.unitIsk, Math.round(quote.totalUsd * 121.16 * 1.25), productId);
  assert.equal(quote.totalIsk, quote.unitIsk * 3, productId);
}
const cartSource = await readFile(join(root, "src/lib/cart.tsx"), "utf8");
assert.match(cartSource, /retailPriceFromSupplierUsd\(priceCartItem\(item\)\) \* item.qty/);
assert.match(cartSource, /quote\.retail\.totalIsk/);
assert.match(cartSource, /calculateWindourQuote/);
console.log(`25% retail increase passed: shared blind, cart, dual roller, vertical sheer, WINdoûr, and all ${roller.rollerWorkbookFabrics.length} workbook fabrics.`);
