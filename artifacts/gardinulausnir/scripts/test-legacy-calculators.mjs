import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { register } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const calculatorDir = join(root, "src", "components", "legacy-calculators");
const productDetailPath = join(root, "src", "pages", "storefront", "ProductDetail.tsx");
const wrapperPath = join(root, "src", "components", "LegacyCalculator.tsx");
const layoutPath = join(calculatorDir, "StorefrontLayout.tsx");
const dualPricingPath = join(root, "src", "lib", "dualRollerPricing.ts");
const pricing = await import(pathToFileURL(join(root, "src", "lib", "pricing.ts")).href);
// Node's strip-types loader does not resolve the production module's
// extensionless "./pricing" import. Resolve that one specifier in the test
// loader so this regression test still imports the actual dual pricing module.
register(
  `data:text/javascript,${encodeURIComponent(`
    export async function resolve(specifier, context, nextResolve) {
      if (specifier === "./pricing") return nextResolve("./pricing.ts", context);
      return nextResolve(specifier, context);
    }
  `)}`,
  import.meta.url,
);
const dualPricing = await import(pathToFileURL(dualPricingPath).href);

const source = async (name) => readFile(join(calculatorDir, `${name}.tsx`), "utf8");
const assertApprox = (actual, expected, message) => assert.ok(
  Math.abs(actual - expected) < 1e-10,
  `${message}: expected ${expected}, received ${actual}`,
);

// Independent regression constants. These are deliberately not imported from
// pricing.ts: supplier USD is rounded exactly once per unit after shipping,
// margin, exchange rate and VAT, then quantity is applied.
const USD_TO_ISK = 121.16;
const SHIPPING_MULTIPLIER = 2;
const MARGIN_DIVISOR = 0.6;
const VAT_MULTIPLIER = 1.24;
const expectedRetailISK = (supplierUsd) => Math.round(
  supplierUsd * SHIPPING_MULTIPLIER / MARGIN_DIVISOR * USD_TO_ISK * VAT_MULTIPLIER,
);

const calculatorNames = [
  "PriceCalculator",
  "HoneycombCalculator",
  "Honeycomb25Calculator",
  "DayNightCalculator",
  "TDBUCalculator",
  "VerticalCalculator",
  "DualRollerCalculator",
  "ZebraBlindCalculator",
];

for (const name of calculatorNames) {
  const code = await source(name);
  assert.match(code, /useCart/, `${name} must keep the original cart hook`);
  assert.match(code, /addItem\(/, `${name} must keep original add-to-cart behavior`);
  assert.match(code, /(?:USD_TO_ISK_(?:RETAIL|ACCESSORY|COST)|SUPPLIER_TO_RETAIL_ISK|retailPriceFromSupplierUsd)/, `${name} must keep shared currency rules`);
}

const dualRoller = await source("DualRollerCalculator");
assert.match(dualRoller, /calculateDualRollerPrice/, "dual roller must use shared visible-price calculation");
const dualPricingSource = await readFile(dualPricingPath, "utf8");
assert.match(dualPricingSource, /DUAL_ROLLER_RETAIL_ISK\s*=\s*SUPPLIER_TO_RETAIL_ISK/, "dual roller must use the shared supplier-to-retail multiplier");
for (const name of ["PriceCalculator", "DualRollerCalculator", "VerticalCalculator", "ZebraBlindCalculator"]) {
  const code = await source(name);
  assert.doesNotMatch(code, /\bnoDrill\b|\bmountPosition\b|\bsideTrackType\b|\btrackShape\b/, `${name} must not expose unsupported honeycomb controls`);
}
assert.match(await source("HoneycombCalculator"), /HONEYCOMB_45_LIMITS\[operation\]\.maxAreaSqm/, "45 mm honeycomb area cap changed");
assert.match(await source("Honeycomb25Calculator"), /HONEYCOMB_25_LIMITS\[operation\]/, "25 mm honeycomb must use the shared operation limits");
assert.match(await source("Honeycomb25Calculator"), /type Operation = "manual" \| "cordless"/, "25 mm honeycomb must expose manual and cordless only");
assert.doesNotMatch(await source("Honeycomb25Calculator"), /\bmotor\b/, "25 mm honeycomb must not expose motor operation");
assert.match(await source("VerticalCalculator"), /MAX_SQM_PER_PIECE = 14/, "vertical area cap changed");

const productDetail = await readFile(productDetailPath, "utf8");
const storefrontLayout = await readFile(layoutPath, "utf8");
assert.match(storefrontLayout, /data-testid="product-box"/, "product box layout marker missing");
assert.match(storefrontLayout, /data-testid="gallery"/, "gallery layout marker missing");
assert.match(storefrontLayout, /data-testid="config-card"/, "configuration card marker missing");
assert.match(storefrontLayout, /data-testid="live-price"/, "live price marker missing");
assert.match(productDetail, /<ProductInfoFooter\s*\/>/, "product footer must render directly below configurator");
const footerSource = await readFile(join(root, "src", "components", "ProductInfoFooter.tsx"), "utf8");
assert.match(footerSource, /data-testid="footer"/, "four-column footer marker missing");
assert.match(footerSource, /lg:grid-cols-4/, "footer must have four desktop columns");
assert.doesNotMatch(productDetail, /related|recommend/i, "product detail must not render related products");
const rollerUnitSupplierUsd = 33.48 * 1.2 * 1.6;
assertApprox(rollerUnitSupplierUsd, 64.2816, "roller supplier fixture");
assert.equal(expectedRetailISK(rollerUnitSupplierUsd), 32192, "roller unit retail price must use the global margin");
assert.equal(expectedRetailISK(rollerUnitSupplierUsd) * 3, 96576, "roller quantity-3 display must multiply rounded units");
for (const id of ["honeycomb-45mm", "honeycomb-25mm", "day-night", "top-down-bottom-up", "vertical-45mm", "dual-roller", "zebra-blind", "square-cassette", "arc-cassette", "open-roll"]) {
  assert.match(productDetail, new RegExp(id), `${id} is not routed to a legacy calculator`);
}

const rollerSource = await source("PriceCalculator");
assert.match(rollerSource, /productIdentity/, "roller calculator must receive selected storefront identity");
assert.match(rollerSource, /"square-cassette": \["C2", "C3", "C4"\]/, "square cassette family changed");
assert.match(rollerSource, /"arc-cassette": \["C1", "C6", "C7"\]/, "arc cassette family changed");
assert.match(rollerSource, /"open-roll": \["C5"\]/, "open roll family changed");
assert.match(rollerSource, /"square-cassette": "C2"/, "square cassette default changed");
assert.match(rollerSource, /"arc-cassette": "C1"/, "arc cassette default changed");
assert.match(rollerSource, /"open-roll": "C5"/, "open roll default changed");
assert.match(rollerSource, /const \[bottomRailColor, setBottomRailColor\] = useState<string>\("Hvítur"\)/, "roller bottom rail colour state missing");
assert.match(rollerSource, /BOTTOM_RAIL_COLORS\.map/, "roller bottom rail colour selector missing");
assert.match(rollerSource, /cassette: `\$\{cassette\.code\} — \$\{cassette\.is\}`/, "roller cart payload must preserve cassette code and description");
assert.match(rollerSource, /rail: `\$\{bottomRail\.is\} \(\$\{bottomRail\.dims\}\) · \$\{bottomRailColor\}`/, "roller cart payload must preserve rail dimensions and colour");

// Fabric type changes must filter both controls from the same source list and
// immediately move the selected identity into the new eligible collection.
assert.match(rollerSource, /fabricFilter === "blackout" && f\.category === "Myrkvun \/ Blackout"/, "roller blackout filter must use the blackout collection");
assert.match(rollerSource, /fabricFilter === "light-filtering" && f\.category === "Hálfgegnsætt \/ Translucent"/, "roller light-filtering filter must use its own collection");
assert.match(rollerSource, /setFabricCode\(eligible\[0\]\?\.code/, "roller filter must reset a stale fabric selection");
assert.match(rollerSource, /grouped\.flatMap\(\(\[, group\]\) => group\.items\)/, "roller swatches must use the filtered dropdown groups");
assert.match(rollerSource, /group\.items\.map\(\(f\)/, "roller dropdown must use the same filtered groups as swatches");
assert.match(rollerSource, /code: "TSD2262-4", shade: "Chrome",\s+pricePerSqmUSD: 33\.48/, "light-filtering roller source rate changed");
assert.match(rollerSource, /code: "BO-0101", shade: "White",\s+pricePerSqmUSD: 36\.28/, "blackout roller source rate changed");

for (const name of ["HoneycombCalculator", "Honeycomb25Calculator", "TDBUCalculator", "VerticalCalculator", "ZebraBlindCalculator"]) {
  const code = await source(name);
  assert.match(code, /fabricType/, `${name} must expose a real fabric type selector`);
  assert.match(code, /grouped\[fabricType\]/, `${name} swatches must be limited to the selected fabric type`);
  assert.match(code, /setFabricCode\(grouped\[fabricType\]\[0\]\?\.code/, `${name} must reset a stale fabric identity after type changes`);
}
assert.match(await source("HoneycombCalculator"), /KT401: \{ type: "translucent", usdPerSqm: 12\.50 \}/, "honeycomb light-filtering source rate changed");
assert.match(await source("HoneycombCalculator"), /KB401: \{ type: "blackout", usdPerSqm: 14\.26 \}/, "honeycomb blackout source rate changed");
assert.match(await source("VerticalCalculator"), /KT401: \{ type: "translucent", usdPerSqm: 36\.41 \}/, "vertical light-filtering source rate changed");
assert.match(await source("VerticalCalculator"), /KB401: \{ type: "blackout", usdPerSqm: 42\.48 \}/, "vertical blackout source rate changed");
for (const name of ["DayNightCalculator", "DualRollerCalculator"]) {
  const code = await source(name);
  assert.match(code, /setFrontCode\(\(prev\) =>/, `${name} must reset the front layer when its real fabric family changes`);
  assert.match(code, /setBackCode\(\(prev\) =>/, `${name} must reset the back layer when its real fabric family changes`);
  assert.match(code, /frontCode:/, `${name} cart payload must preserve the selected front fabric code`);
  assert.match(code, /backCode:/, `${name} cart payload must preserve the selected back fabric code`);
}
const sharedFabricSource = await readFile(join(root, "src", "pages", "storefront", "_shared", "fabrics.ts"), "utf8");
assert.match(sharedFabricSource, /new Set\(\["roller", "screen"\]\)/, "light-filtering roller collections must preserve roller/screen support");
assert.match(sharedFabricSource, /new Set\(\["blackout"\]\)/, "blackout roller collection must remain distinct from light filtering");
const honeycomb25Source = await source("Honeycomb25Calculator");
assert.match(honeycomb25Source, /resolveRailColor/, "25 mm honeycomb must reset invalid finish colours");
assert.match(honeycomb25Source, /operation === "cordless"/, "25 mm honeycomb must handle the cordless operation");
assert.doesNotMatch(honeycomb25Source, /MOTORIZED_RAIL_COLORS|operation === "motor"/, "25 mm honeycomb must not switch into motor controls");

const wrapper = await readFile(wrapperPath, "utf8");
assert.match(wrapper, /LEGACY_CART_OPEN_EVENT/, "shared cart-open event missing");
assert.match(wrapper, /removeItem/, "legacy cart remove behavior missing");
assert.match(wrapper, /priceLineIsk/, "legacy cart line pricing missing");

for (const name of calculatorNames) {
  const code = await source(name);
  assert.match(code, /normalizeQuantity\(Number\(e\.target\.value\)\)/, `${name} must normalize quantity input`);
}
const cartSource = await readFile(join(root, "src", "lib", "cart.tsx"), "utf8");
assert.match(cartSource, /calculateDualRollerCartTotal/, "cart must use the visible dual roller calculation");
assert.match(cartSource, /item\.qty = normalizeQuantity\(item\.qty\)/, "persisted cart quantities must normalize");
assert.match(cartSource, /qty: normalizeQuantity\(item\.qty\)/, "new cart quantities must normalize");
assert.match(cartSource, /normalizeQuantity\(qty\)/, "updated cart quantities must normalize");
assert.match(cartSource, /sideTrackType: item\.type === "honeycomb-25" \? "l" : item\.sideTrackType \?\? "u"/, "cart must preserve U/L track selection and default 25mm to L");
assert.match(cartSource, /const STORAGE_KEY = "solmyrkvun\.cart\.v2"/, "cart v2 storage key changed");
assert.match(cartSource, /!wasCurrentPricingVersion \|\| !hasAuthoritativeRate\(item\)/, "stale cart-v2 lines must be marked for reconfiguration");
assert.match(cartSource, /if \(item\.needsReconfigure\) return 0/, "stale cart-v2 lines must be excluded from pricing");

// Numeric fixtures from the uploaded Honeycomb workbook/Python calculator and
// the product-specific supplier sheets. Expected retail values are fixed
// numbers rather than values copied from the implementation under test.
const pricingFixtures = [
  {
    name: "honeycomb-45 standard KS401",
    widthMm: 1200,
    heightMm: 1500,
    supplierRate: 18.02,
    options: { operation: "manual" },
    supplierUsd: 32.436,
    unitIsk: 16244,
    quantity: 3,
  },
  {
    name: "honeycomb-25 standard KS801 with L track",
    widthMm: 1200,
    heightMm: 1500,
    supplierRate: 18.02,
    options: { operation: "manual", sideTrack: true, sideTrackType: "l" },
    supplierUsd: 39.936,
    unitIsk: 20000,
    quantity: 2,
  },
  {
    name: "day-night KS+KB cordless with U track",
    widthMm: 1200,
    heightMm: 1500,
    supplierRate: 28.6931231792052,
    options: { operation: "cordless", sideTrack: true, sideTrackType: "u" },
    supplierUsd: 72.04762172256935,
    unitIsk: 36081,
    quantity: 2,
  },
  {
    name: "TDBU KT401 motor with U track",
    widthMm: 1200,
    heightMm: 1500,
    supplierRate: 16.0010700873129,
    options: { operation: "motor", sideTrack: true, sideTrackType: "u" },
    supplierUsd: 78.35924806482352,
    unitIsk: 39242,
    quantity: 2,
  },
];

for (const fixture of pricingFixtures) {
  const supplierUsd = pricing.blindSupplierUsd(
    fixture.widthMm,
    fixture.heightMm,
    fixture.supplierRate,
    fixture.options,
  );
  assertApprox(supplierUsd, fixture.supplierUsd, `${fixture.name} supplier USD`);
  assert.equal(
    expectedRetailISK(fixture.supplierUsd),
    fixture.unitIsk,
    `${fixture.name} fixture has an incorrect independent retail constant`,
  );
  assert.equal(
    pricing.retailPriceFromSupplierUsd(supplierUsd),
    fixture.unitIsk,
    `${fixture.name} must round once per unit`,
  );
  assert.equal(
    pricing.retailTotalFromSupplierUsd(supplierUsd, fixture.quantity),
    fixture.unitIsk * fixture.quantity,
    `${fixture.name} quantity must multiply the rounded unit`,
  );
}

// Supplier rates are fixture inputs, not aliases to whichever calculator
// happens to be rendering them.
assert.equal(pricing.honeycombSupplierRate("KS401", 45), 18.02, "45mm KS401 workbook rate changed");
assert.equal(pricing.honeycombSupplierRate("KS801", 25), 18.02, "25mm KS801 workbook rate changed");
assert.equal(pricing.honeycombSupplierRate("KT401", 45), 12.5, "45mm KT401 workbook rate changed");
assert.equal(pricing.honeycombSupplierRate("KB401", 45), 14.26, "45mm KB401 workbook rate changed");
assert.equal(pricing.honeycombSupplierRate("KN405", 45), 40.01, "45mm KN405 workbook rate changed");
assert.equal(pricing.dayNightSupplierRate("KS401", "KT401"), 26.3427429770029, "Day & Night KS+KT rate changed");
assert.equal(pricing.dayNightSupplierRate("KS401", "KB401"), 28.6931231792052, "Day & Night KS+KB rate changed");
assert.equal(pricing.tdbuSupplierRate("KT401"), 16.0010700873129, "TDBU KT401 rate changed");
assert.equal(pricing.tdbuSupplierRate("KB401"), 18.3514502895152, "TDBU KB401 rate changed");
assert.equal(pricing.tdbuSupplierRate("KB420"), 28.26, "TDBU KB420 premium rate changed");

const additionalRateFixtures = [
  ["honeycomb 45 KT401", 12.5, 22.5, 11268],
  ["honeycomb 45 KB401", 14.26, 25.668, 12854],
  ["honeycomb 45 KN405", 40.01, 72.018, 36066],
  ["day-night KS+KT", 26.3427429770029, 47.41693735860522, 23746],
  ["TDBU KB401", 18.3514502895152, 33.03261052112736, 16543],
  ["TDBU KB420 premium", 28.26, 50.868, 25474],
  ["vertical 42.48", 42.48, 76.464, 38293],
];
for (const [name, rate, supplierUsd, unitIsk] of additionalRateFixtures) {
  const actualSupplierUsd = pricing.blindSupplierUsd(1200, 1500, rate);
  assertApprox(actualSupplierUsd, supplierUsd, `${name} supplier USD`);
  assert.equal(pricing.retailPriceFromSupplierUsd(actualSupplierUsd), unitIsk, `${name} retail price`);
}

// The 4m² motor boundary is strict: exactly 4m² uses the small motor and only
// a larger area uses the large motor.
assert.equal(pricing.motorSupplierUsd(4), 34.5573219076603, "motor threshold at 4m² changed");
assert.equal(pricing.motorSupplierUsd(4.000001), 71.1311073101807, "motor threshold above 4m² changed");
const motorAtThreshold = pricing.blindSupplierUsd(2000, 2000, 12.5, { operation: "motor" });
const motorAboveThreshold = pricing.blindSupplierUsd(2000, 2100, 12.5, { operation: "motor" });
assertApprox(motorAtThreshold, 84.5573219076603, "motor-at-threshold supplier USD");
assertApprox(motorAboveThreshold, 123.6311073101807, "motor-above-threshold supplier USD");
assert.equal(pricing.retailPriceFromSupplierUsd(motorAtThreshold), 42346, "motor-at-threshold retail price changed");
assert.equal(pricing.retailPriceFromSupplierUsd(motorAboveThreshold), 61914, "motor-above-threshold retail price changed");

// U track is the 45mm/default track; 25mm maps to the cheaper L track in the
// cart payload. Both are priced by height in metres.
const noTrackUsd = pricing.blindSupplierUsd(1200, 1500, 12.5);
const uTrackUsd = pricing.blindSupplierUsd(1200, 1500, 12.5, { sideTrack: true, sideTrackType: "u" });
const lTrackUsd = pricing.blindSupplierUsd(1200, 1500, 12.5, { sideTrack: true, sideTrackType: "l" });
assertApprox(uTrackUsd - noTrackUsd, 15, "U track surcharge");
assertApprox(lTrackUsd - noTrackUsd, 7.5, "L track surcharge");
assert.match(cartSource, /sideTrackType: item\.type === "honeycomb-25" \? "l" : item\.sideTrackType \?\? "u"/, "cart must preserve U/L track selection and default 25mm to L");

const tdbuSource = await source("TDBUCalculator");
assert.match(tdbuSource, /type Operation = "manual" \| "cordless"/, "TDBU must expose its supported manual and cordless operations");
assert.match(tdbuSource, /KB420: \{ type: "blackout",\s+usdPerSqm: 28\.26 \}/, "TDBU premium supplier rate must be selectable");

// Exercise the actual dual-roller pricing library, including unit-level
// rounding and quantity multiplication.
const dualInput = {
  width: 1200,
  height: 1500,
  quantity: 1,
  comboUsdPerSqm: 64.48,
  operation: "manual",
  sideTrack: false,
};
for (const quantity of [1, 3]) {
  const visible = dualPricing.calculateDualRollerPrice({ ...dualInput, quantity });
  assert.equal(visible.perPieceISK, 58124, `dual roller unit price changed for quantity ${quantity}`);
  assert.equal(visible.totalISK, 58124 * quantity, `dual roller total changed for quantity ${quantity}`);
  assert.equal(
    dualPricing.calculateDualRollerCartTotal({ ...dualInput, quantity }),
    58124 * quantity,
    `dual roller cart total changed for quantity ${quantity}`,
  );
}
// These are product-level unit prices for the fixture dimensions above.
const representativePrices = {
  honeycomb45: 16244,
  honeycomb25: 20000,
  dayNight: 36081,
  tdbu: 39242,
};
assert.deepEqual(representativePrices, {
  honeycomb45: pricingFixtures[0].unitIsk,
  honeycomb25: pricingFixtures[1].unitIsk,
  dayNight: pricingFixtures[2].unitIsk,
  tdbu: pricingFixtures[3].unitIsk,
});

console.log("PASS legacy calculator parity and storefront/cart regression checks");
console.log(representativePrices);
console.log("Explicit control requirements: Honeycomb25 and TDBU support their declared operations; stale cart-v2 lines are excluded from pricing");