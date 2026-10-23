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
  if (specifier.endsWith("roller-side-track.png")) {
    return { __esModule: true, default: "/test/roller-side-track.png" };
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
assert.equal(find(initial, "open-roll-side-tracks").props.checked, false);
assert.equal(text(find(initial, "open-roll-side-track-summary")), "Ekki valdir");
assert.match(decodeURIComponent(initial.props.action.props.href), /Hliðarlistar: Ekki óskað eftir/);
assert.ok(nodes(initial.props.controls).some((node) => node.type === "img" && node.props.src === "/test/roller-side-track.png"));

find(initial, "open-roll-side-tracks").props.onChange({ target: { checked: true } });
const selected = render();
assert.equal(find(selected, "open-roll-side-tracks").props.checked, true);
assert.equal(selected.props.priceISK, initialPrice, "unpriced side tracks must not change the approved retail total");
assert.match(text(find(selected, "open-roll-side-track-summary")), /verð bíður staðfestingar/);
assert.ok(find(selected, "open-roll-side-track-selection"));
assert.match(decodeURIComponent(selected.props.action.props.href), /Hliðarlistar: Óskað eftir — verð bíður staðfestingar og er ekki innifalið í heildarverði/);
assert.match(decodeURIComponent(selected.props.action.props.href), /Söluverð án hliðarlista:/);
assert.equal(selected.props.canAddToCart, false, "keep the enquiry flow without enabling unsupported Shopify checkout");

find(selected, "open-roll-side-tracks").props.onChange({ target: { checked: false } });
const cleared = render();
assert.equal(cleared.props.priceISK, initialPrice);
assert.equal(text(find(cleared, "open-roll-side-track-summary")), "Ekki valdir");
assert.equal(find(cleared, "open-roll-side-track-selection"), undefined);
assert.match(decodeURIComponent(cleared.props.action.props.href), /Hliðarlistar: Ekki óskað eftir/);
console.log("Open-roll side tracks passed: select, deselect, unchanged total, visible image, price notice and enquiry details.");
