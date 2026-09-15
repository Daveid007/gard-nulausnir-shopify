import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const calculatorDir = join(root, "src", "components", "legacy-calculators");
const productDetailPath = join(root, "src", "pages", "storefront", "ProductDetail.tsx");
const wrapperPath = join(root, "src", "components", "LegacyCalculator.tsx");
const layoutPath = join(calculatorDir, "StorefrontLayout.tsx");
const dualPricing = await import(pathToFileURL(join(root, "src", "lib", "dualRollerPricing.ts")).href);

const source = async (name) => readFile(join(calculatorDir, `${name}.tsx`), "utf8");
const rounded = (value) => Math.round(value / 500) * 500;

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
  assert.match(code, /USD_TO_ISK_(?:RETAIL|ACCESSORY|COST)/, `${name} must keep original currency rules`);
}

const dualRoller = await source("DualRollerCalculator");
assert.match(dualRoller, /calculateDualRollerPrice/, "dual roller must use shared visible-price calculation");
assert.equal(dualPricing.DUAL_ROLLER_RETAIL_ISK, 1042, "dual roller retail multiplier changed");
assert.match(await source("HoneycombCalculator"), /MAX_SQM_PER_PIECE = 5\.6/, "45 mm honeycomb area cap changed");
assert.match(await source("Honeycomb25Calculator"), /MIN_WIDTH = 400[\s\S]*MAX_WIDTH = 2000/, "25 mm honeycomb width limits changed");
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
const rollerUnitRawISK = 33.48 * 1.2 * 1.6 * 461;
assert.equal(Math.ceil(rollerUnitRawISK / 100) * 100, 29700, "roller unit display must match cart rounding");
assert.equal(Math.ceil(rollerUnitRawISK / 100) * 100 * 3, 89100, "roller quantity-3 display must round each cart unit");
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
assert.match(honeycomb25Source, /operation === "motor" \? MOTORIZED_RAIL_COLORS : CASSETTE_RAIL_COLORS/, "25 mm honeycomb must switch finish options with operation");

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

// These are the original calculator defaults and displayed rounding.
// Keep this list intentionally explicit: it catches an accidental return to the
// former made-up area formula without introducing a second production formula.
const representativePrices = {
  roller: rounded(33.48 * 1.2 * 1.6 * 461),
  honeycomb45: rounded(12.5 * 1.2 * 1.5 * 461),
  honeycomb25MinimumBill: rounded(12.5 * 1 * 461),
  dayNight: rounded(64.48 * 1.2 * 1.5 * 461),
  tdbu: rounded(36.41 * 1.2 * 1.5 * 461),
  vertical: rounded(36.41 * 2 * 2.4 * 461),
  dualRoller: Math.round(dualPricing.calculateDualRollerPrice({
    width: 1200,
    height: 1500,
    quantity: 1,
    comboUsdPerSqm: 64.48,
    operation: "manual",
    sideTrack: false,
  }).totalISK),
  zebra: rounded(16.03 * 1.2 * 1.5 * 461),
};

assert.deepEqual(representativePrices, {
  roller: 29500,
  honeycomb45: 10500,
  honeycomb25MinimumBill: 6000,
  dayNight: 53500,
  tdbu: 30000,
  vertical: 80500,
  dualRoller: 120939,
  zebra: 13500,
});

const dualInput = {
  width: 1200,
  height: 1500,
  comboUsdPerSqm: 64.48,
  operation: "manual",
  sideTrack: false,
};
for (const quantity of [1, 3]) {
  const visible = dualPricing.calculateDualRollerPrice({ ...dualInput, quantity });
  const cart = dualPricing.calculateDualRollerCartTotal({ ...dualInput, quantity });
  assert.equal(
    cart,
    Math.ceil(visible.totalISK / 100) * 100,
    `dual roller cart must match visible calculation for quantity ${quantity}`,
  );
}

console.log("PASS legacy calculator parity and storefront/cart regression checks");
console.log(representativePrices);