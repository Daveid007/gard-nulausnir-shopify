import assert from "node:assert/strict";
import { calculateCurtainPrice, CURTAIN_FABRIC_USD } from "../src/lib/curtainPricing.ts";

const base = { productId: "curtains-2828", widthCm: 241.935, heightCm: 274.32, quantity: 1, style: "standard", control: "manual" };
const factor = 2 / 0.6 * 121.16 * 1.24;
// Independently reproduce row 4 and ancillary supplier rows in all four sheets.
for (const [style, control, rail, processing, shaping, motor] of [
  ["standard", "manual", 5.58, 2.35294117647059, 1.47058823529412, 0],
  ["standard", "motorized", 11.5, 2.35294117647059, 1.47058823529412, 81],
  ["s-wave", "manual", 11.2, 5.3, 3, 0],
  ["s-wave", "motorized", 17.5, 5.3, 3, 81],
]) {
  const result = calculateCurtainPrice({ ...base, style, control });
  const expectedUsd = 76.8825788602942 + 2.41935 * rail +
    6.248375 * (processing + shaping) + 2 * 2.20588235294118 + motor;
  assert.ok(Math.abs(result.supplierUsd - expectedUsd) < 1e-9);
  assert.equal(result.unitPrice, Math.round(expectedUsd * factor));
  assert.equal(calculateCurtainPrice({ ...base, style, control, quantity: 3 }).totalPrice, result.unitPrice * 3);
}
assert.equal(Object.keys(CURTAIN_FABRIC_USD).length, 7);
for (const productId of Object.keys(CURTAIN_FABRIC_USD)) {
  assert.ok(calculateCurtainPrice({ ...base, productId }).totalPrice > 0);
}
for (const patch of [
  { widthCm: 0 }, { widthCm: -1 }, { widthCm: NaN }, { widthCm: Infinity },
  { heightCm: 0 }, { quantity: 0 }, { quantity: 1.5 }, { quantity: NaN },
  { productId: "curtains-textile-sheer" }, { productId: "toString" },
  { style: "unknown" }, { control: "unknown" },
]) assert.throws(() => calculateCurtainPrice({ ...base, ...patch }));
assert.equal(calculateCurtainPrice({ ...base, heightCm: 200 }).totalPrice, calculateCurtainPrice(base).totalPrice);
console.log("Curtain pricing: workbook parity, seven series, quantity rounding and invalid inputs passed.");
