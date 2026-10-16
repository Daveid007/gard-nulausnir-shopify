import assert from "node:assert/strict";
import { supplierRate } from "../src/lib/supplierPricesRev4.ts";
import { honeycombSupplierRate, tdbuSupplierRate, dayNightSupplierRate, retailPriceFromSupplierUsd, blindSupplierUsd, SUPPLIER_TO_RETAIL_ISK } from "../src/lib/pricing.ts";

assert.equal(honeycombSupplierRate("KT401", 45), 12.82);
assert.equal(honeycombSupplierRate("KS406", 45), 32.71);
assert.equal(honeycombSupplierRate("KS801", 25), 19.4);
assert.equal(honeycombSupplierRate("KT808", 25), 12.5, "Zero source price retains prior rate");
assert.equal(tdbuSupplierRate("KT401"), 18.82);
assert.equal(dayNightSupplierRate("KS406", "KT401"), 41.53);
assert.equal(dayNightSupplierRate("KS401", "KT401"), 28.22, "Front fabric now affects the combination price");
assert.equal(supplierRate("Honeycomb Blinds", "Bottom up", "45mm", "28HS-W-B-0506-45", 99), 99, "Conflicting rows retain previous price");
assert.equal(supplierRate("unknown", "", "", "", 12), 12);
assert.equal(retailPriceFromSupplierUsd(12.82), Math.round(12.82 * SUPPLIER_TO_RETAIL_ISK));
assert.equal(blindSupplierUsd(1000, 1000, 18.82, { operation: "cordless", productStyle: "tdbu" }), 24.82);
assert.equal(blindSupplierUsd(1000, 1000, 28.22, { operation: "cordless", productStyle: "daynight" }), 30.22);
console.log("REV 4 supplier pricing and fallback checks passed.");
