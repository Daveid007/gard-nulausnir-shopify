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
const freight = await import(pathToFileURL(join(root, "src/lib/freight.ts")).href);
const tierQuantities = [1, 3, 4, 7, 8, 10, 11, 14, 15, 18, 19, 99];
for (const [group, rates] of Object.entries({
  roller: [37, 34, 31, 27, 25, 22],
  cellular: [34.5, 31.5, 28.5, 24.5, 22.5, 19.5],
  daynight: [36.5, 33.5, 30.5, 26.5, 24.5, 21.5],
})) {
  tierQuantities.forEach((qty, i) => assert.equal(freight.freightUsd(1.8, qty, group), 1.8 * rates[Math.floor(i / 2)]));
}
const freightLine = {type: "roller", qty: 1, width: 1200, height: 1500};
assert.equal(freight.orderFreightUsd(freightLine, [freightLine, {...freightLine, qty: 3}]), 1.8 * 34);
assert.equal(freight.orderFreightUsd(freightLine, [freightLine]), 1.8 * 37);
assert.equal(freight.orderFreightUsd(freightLine, [freightLine, {...freightLine, type: "daynight", qty: 19}]), 1.8 * 37);
assert.equal(freight.orderFreightUsd({...freightLine, type: "vertical"}, [freightLine]), undefined);
const dual = await import(pathToFileURL(join(root, "src/lib/dualRollerPricing.ts")).href);
const windour = await import(pathToFileURL(join(root, "src/lib/windourPricing.ts")).href);
const roller = await import(pathToFileURL(join(root, "src/lib/rollerWorkbookPricing.ts")).href);
const vertical = await import(pathToFileURL(join(root, "src/lib/verticalSheerPricing.ts")).href);

const originalFactor = 2 / 0.6 * 121.16 * 1.24;
const expectedUnit = (usd) => Math.round(usd * originalFactor * 1.25 * 1.05);
const expectedFreightUnit = (usd, area, rate) => Math.round((usd + area * rate) * 121.16 * 1.24 / 0.65);
assert.equal(pricing.BLIND_GROSS_MARGIN, 0.35);
assert.equal(pricing.LANDED_TO_RETAIL_ISK, 121.16 * 1.24 / 0.65);
assert.equal(pricing.RETAIL_PRICE_MULTIPLIER, 1.25 * 1.05);
assert.equal(pricing.increasedRetailPriceIsk(11268), Math.round(11268 * 1.25 * 1.05));
assert.equal(pricing.retailPriceFromSupplierUsd(22.5), expectedUnit(22.5));
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
    const area = (1200 - (options.mountPosition === "inside" ? 5 : 0)) * 1500 / 1e6;
    assert.equal(pricing.blindRetailPriceIsk(1200, 1500, rate, options), expectedFreightUnit(supplierUsd, area, 34.5));
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
  assert.equal(quote.retail.unitIsk, ["roller", "zebra"].includes(fabric.family)
    ? expectedFreightUnit(quote.supplier.unitUsd, 1.8, fabric.family === "roller" ? 37 : 34.5)
    : expectedUnit(quote.supplier.unitUsd), fabric.code);
  assert.equal(quote.retail.totalIsk, quote.retail.unitIsk * 3, fabric.code);
}
for (const productId of windour.WINDOUR_PRODUCT_IDS) {
  const quote = windour.calculateWindourQuote({
    productId, material: "honeycomb", widthCm: 90, heightCm: 90,
    quantity: 3, openingType: "single", openingDirection: "horizontal",
  });
  assert.ok(quote, productId);
  assert.equal(quote.unitIsk, Math.round(quote.totalUsd * 121.16 * 1.25 * 1.05), productId);
  assert.equal(quote.totalIsk, quote.unitIsk * 3, productId);
}
const cartSource = await readFile(join(root, "src/lib/cart.tsx"), "utf8");
assert.match(cartSource, /orderFreightUsd\(item, orderItems\)/);
assert.match(cartSource, /priceLineIsk\(item, items\)/);
assert.match(cartSource, /quote\.retail\.totalIsk/);
assert.match(cartSource, /calculateWindourQuote/);
console.log(`Additional 5% over existing 25% retail increase passed: shared blind, cart, dual roller, vertical sheer, WINdoûr, and all ${roller.rollerWorkbookFabrics.length} workbook fabrics.`);
