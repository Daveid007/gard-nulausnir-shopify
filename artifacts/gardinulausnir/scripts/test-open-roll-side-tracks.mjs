import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import ts from "typescript";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(pathToFileURL(join(root, "package.json")));
const pricing = await import(pathToFileURL(join(root, "src/lib/openRollExamplePricing.ts")).href);
const retailPricing = await import(pathToFileURL(join(root, "src/lib/pricing.ts")).href);
const source = await readFile(join(root, "src/components/OpenRollExampleCalculator.tsx"), "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022,
    jsx: ts.JsxEmit.ReactJSX,
    esModuleInterop: true,
  },
  reportDiagnostics: true,
});
assert.equal(compiled.diagnostics?.length ?? 0, 0);

const states = [];
let index = 0;
const mockReact = {
  useMemo: (calculate) => calculate(),
  useState: (initial) => {
    const slot = index++;
    if (!(slot in states)) states[slot] = typeof initial === "function" ? initial() : initial;
    return [states[slot], (value) => {
      states[slot] = typeof value === "function" ? value(states[slot]) : value;
    }];
  },
};
const module = { exports: {} };
const load = (specifier) => {
  if (specifier === "react") return mockReact;
  if (specifier === "@/lib/openRollExamplePricing") return pricing;
  if (specifier === "@/lib/pricing") return retailPricing;
  if (specifier === "@/components/legacy-calculators/StorefrontLayout") {
    return { StorefrontLayout: () => null };
  }
  return require(specifier);
};
new Function("require", "module", "exports", compiled.outputText)(load, module, module.exports);
const render = () => {
  index = 0;
  return module.exports.default({ product: { id: "open-roll" } });
};
const nodes = (element) => {
  if (element == null || typeof element !== "object") return [];
  if (Array.isArray(element)) return element.flatMap(nodes);
  return [element, ...nodes(element.props?.children)];
};
const find = (tree, id) => nodes(tree.props.controls).find((node) => node.props?.["data-testid"] === id);
const text = (element) => {
  if (element == null || typeof element === "boolean") return "";
  if (typeof element !== "object") return String(element);
  if (Array.isArray(element)) return element.map(text).join("");
  return text(element.props?.children);
};

const initial = render();
const initialPrice = initial.props.priceISK;
assert.equal(initialPrice, 26_425);
assert.equal(initial.props.priceLabel, "Verð");
assert.doesNotMatch(source, /Dæmiverð|lýsandi dæmi|dæmatölu|dæmatöluna|dæmareikni/);
assert.match(text(find(initial, "open-roll-price-notice")), /Verð eftir máli/);
assert.doesNotMatch(source, /sideTracks|sideTrackImage|hliðarlist/i);
assert.equal(find(initial, "open-roll-side-tracks"), undefined);
assert.equal(find(initial, "open-roll-side-track-summary"), undefined);
assert.doesNotMatch(text(initial.props.controls), /hliðarlist/i);
assert.match(decodeURIComponent(initial.props.action.props.href), /Söluverð:/);
assert.doesNotMatch(decodeURIComponent(initial.props.action.props.href), /hliðarlist/i);
assert.equal(initial.props.canAddToCart, false, "keep the enquiry flow without enabling unsupported Shopify checkout");

find(initial, "open-roll-color").props.onChange({ target: { value: "c-grey-blackout" } });
const colored = render();
assert.equal(colored.props.priceISK, 29_550);
find(colored, "open-roll-rail").props.onChange({ target: { value: "br-aluminum" } });
const railed = render();
assert.equal(railed.props.priceISK, 31_800);
find(railed, "open-roll-holder").props.onChange({ target: { value: "h-metal-chrome" } });
const configured = render();
assert.equal(configured.props.priceISK, 36_175);
configured.props.setQuantity(2);
const doubled = render();
assert.equal(doubled.props.priceISK, 72_350);
const enquiry = decodeURIComponent(doubled.props.action.props.href);
assert.match(enquiry, /Magn: 2/);
assert.match(enquiry, /Söluverð:/);
assert.doesNotMatch(enquiry, /hliðarlist/i);
assert.equal(find(doubled, "open-roll-color").props.value, "c-grey-blackout");
assert.equal(find(doubled, "open-roll-rail").props.value, "br-aluminum");
assert.equal(find(doubled, "open-roll-holder").props.value, "h-metal-chrome");
console.log("Open-roll passed: no side-track option or enquiry references; retail prices, other options and quantity unchanged.");
