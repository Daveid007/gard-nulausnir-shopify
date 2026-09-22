import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pricing = await import(pathToFileURL(join(root, "src", "lib", "verticalSheerPricing.ts")).href);
const categories = await import(pathToFileURL(join(root, "src", "pages", "storefront", "_shared", "collectionCategories.ts")).href);

assert.equal(Object.keys(pricing.VERTICAL_SHEER_FABRIC_RATES).length, 17, "workbook has 17 fabric codes");
assert.equal(
  new Set(Object.values(pricing.VERTICAL_SHEER_FABRIC_RATES).map(({ rateUsdPerSqm }) => rateUsdPerSqm)).size,
  1,
  "all 17 workbook rows must retain their exact shared rate",
);
assert.deepEqual(pricing.VERTICAL_SHEER_LIMITS["manual-chain"], {
  minWidthMm: 500,
  maxWidthMm: 4000,
  minHeightMm: 500,
  maxHeightMm: 4000,
  maxAreaSqm: 12,
});
assert.deepEqual(pricing.VERTICAL_SHEER_LIMITS.motor, {
  minWidthMm: 1000,
  maxWidthMm: 6000,
  minHeightMm: 500,
  maxHeightMm: 4000,
  maxAreaSqm: 24,
});

// Cached workbook example: 40 × 56 inches -> 1011 × 1422.4 mm and 1.4380464 m².
const manual = pricing.calculateVerticalSheerQuote({
  widthCm: 101.6,
  heightCm: 142.24,
  operation: "manual-chain",
  installation: "inmount",
  fabricCode: "MC-B-100102",
});
assert.equal(manual.productionWidthMm, 1011);
assert.equal(manual.productionHeightMm, 1422.4);
assert.equal(manual.areaSqm, 1.4380464);
assert.equal(manual.billedAreaSqm, 1.4380464);
assert.ok(Math.abs(manual.fabricSupplierUsd - 26.4580332497597) < 1e-12);
assert.ok(Math.abs(manual.supplierCostUsd - 26.4580332497597) < 1e-12);

// The independent retail check intentionally does not call the pricing helper.
const independentRetail = Math.round((26.4580332497597 * 2 / 0.6) * 121.16 * 1.24);
assert.equal(manual.unitIsk, independentRetail, "retail must be 2/.6 × USD/ISK × VAT");
const quantityQuote = pricing.calculateVerticalSheerQuote({
  widthCm: 101.6,
  heightCm: 142.24,
  operation: "manual-chain",
  installation: "inmount",
  fabricCode: "MC-B-100102",
  quantity: 3,
});
assert.equal(quantityQuote.totalIsk, quantityQuote.unitIsk * 3, "quantity multiplies after unit rounding");
const motor = pricing.calculateVerticalSheerQuote({
    widthCm: 101.6,
    heightCm: 142.24,
    operation: "motor",
    installation: "inmount",
    fabricCode: "MC-B-100102",
  });
assert.ok(
  Math.abs(motor.supplierCostUsd - 114.4580332497597) < 1e-12,
  "motor sheet must add its documented $88 motor",
);
const motorWithRemote = pricing.calculateVerticalSheerQuote({
    widthCm: 101.6,
    heightCm: 142.24,
    operation: "motor",
    installation: "inmount",
    fabricCode: "MC-B-100102",
    remoteController: true,
  });
assert.ok(
  Math.abs(motorWithRemote.supplierCostUsd - 121.4580332497597) < 1e-12,
  "remote must add the documented $7 supplier line once",
);
assert.equal(
  pricing.calculateVerticalSheerQuote({
    widthCm: 50.5,
    heightCm: 50,
    operation: "manual-wand",
    installation: "inmount",
    fabricCode: "MC-A-100601",
  }).billedAreaSqm,
  1,
  "each blind under 1 m² is billed at the workbook's 1 m² minimum",
);
assert.equal(
  pricing.validateVerticalSheerDimensions({
    widthCm: 100,
    heightCm: 100,
    operation: "motor",
  }).ok,
  false,
  "motor minimum production width is 1000 mm after the workbook deduction",
);

assert.equal(categories.resolveProductCategory({ id: "vertical-sheer-shades" }), "vertical-sheer");
assert.equal(categories.resolveProductCategory({ id: "vertical-45mm" }), "honeycomb", "existing vertical 45 mm stays honeycomb");
assert.equal(categories.collectionHref("vertical-sheer"), "/collection#vertical-sheer-shades");

const fabricDir = join(root, "src", "assets", "vertical-sheer-shades", "fabrics");
const fabricFiles = (await readdir(fabricDir)).filter((file) => file.toLowerCase().endsWith(".jpg"));
assert.equal(fabricFiles.length, 17, "only the 17 supplier swatch photos should be shipped");
assert.equal((await readdir(fabricDir)).some((file) => file.toLowerCase().endsWith(".db")), false, "Thumbs.db must stay excluded");
const caseDir = join(root, "src", "assets", "vertical-sheer-shades", "cases");
const caseFiles = await readdir(caseDir);
assert.equal(caseFiles.filter((file) => file.toLowerCase().endsWith(".mp4")).length, 0, "case videos must stay excluded");
assert.ok(caseFiles.some((file) => file.includes("Vertical sheer shades (2)")), "real case photo must be present");

const cartSource = await readFile(join(root, "src", "lib", "cart.tsx"), "utf8");
assert.match(cartSource, /type: "vertical-sheer"/, "cart has a distinct persisted type");
assert.match(cartSource, /const STORAGE_KEY = "solmyrkvun\.cart\.v2"/, "vertical sheer uses the existing persistent cart store");
assert.match(cartSource, /calculateVerticalSheerQuote\(/, "cart total must recompute from authoritative pricing");
assert.match(cartSource, /item\.type === "vertical-sheer"/, "cart migration and display must retain the new type");

const calculatorSource = await readFile(join(root, "src", "components", "VerticalSheerCalculator.tsx"), "utf8");
assert.match(calculatorSource, /VERTICAL_SHEER_FABRICS\.filter/, "fabric type tabs must filter the verified swatch set");
assert.match(calculatorSource, /typeFabrics\.map/, "the filtered supplier swatches must render as selectors");
assert.match(calculatorSource, /onClick=\{\(\) => setFabricCode\(fabric\.code\)\}/, "each rendered swatch must update the selected fabric");
assert.match(calculatorSource, /aria-pressed=\{fabric\.code === fabricCode\}/, "swatches must expose their selected state");
assert.doesNotMatch(calculatorSource, /Birgjablaðið nefnir 20 mm/, "the verbose provisional supplier warning must not be shown in the customer UI");
assert.match(calculatorSource, /verðið er áætlun sem þarf endanlega mælingastaðfestingu/, "estimate acknowledgement and purchase guard must remain");
assert.match(calculatorSource, /Mál utan birgjatakmarka/, "dimension safety warning must remain");

console.log("PASS Vertical Sheer Shades workbook, assets, category, cart and retail regression checks");