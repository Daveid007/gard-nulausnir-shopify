import assert from "node:assert/strict";
import {
  OPEN_ROLL_EXAMPLE_COLORS,
  OPEN_ROLL_EXAMPLE_HOLDERS,
  OPEN_ROLL_EXAMPLE_RAILS,
  quoteOpenRollExample,
} from "../src/lib/openRollExamplePricing.ts";

const basic = quoteOpenRollExample({ widthCm: 120, heightCm: 160, quantity: 2, colorId: "c-white", railId: "br-sewn", holderId: "h-std-white" });
assert.equal(basic.ok, true);
assert.equal(basic.unitIsk, 21_140);
assert.equal(basic.totalIsk, 42_280);

const rounding = quoteOpenRollExample({ widthCm: 31, heightCm: 41, quantity: 3, colorId: "c-grey-blackout", railId: "br-aluminum", holderId: "h-metal-chrome" });
assert.equal(rounding.ok, true);
assert.equal(rounding.unitIsk, Math.round(12_500 + 4_500 * 31 * 41 / 10_000 + 2_500 + 1_800 + 3_500));
assert.equal(rounding.totalIsk, rounding.unitIsk * 3, "round each unit before multiplying quantity");

for (const color of OPEN_ROLL_EXAMPLE_COLORS) {
  for (const rail of OPEN_ROLL_EXAMPLE_RAILS) {
    for (const holder of OPEN_ROLL_EXAMPLE_HOLDERS) {
      const quote = quoteOpenRollExample({ widthCm: 30, heightCm: 40, quantity: 1, colorId: color.id, railId: rail.id, holderId: holder.id });
      assert.equal(quote.ok, true, `${color.id}/${rail.id}/${holder.id}`);
      assert.equal(quote.unitIsk, Math.round(12_500 + 540 + color.modifierIsk + rail.modifierIsk + holder.modifierIsk));
    }
  }
}

for (const [field, value] of [["widthCm", 29.9], ["widthCm", 300.1], ["heightCm", 39.9], ["heightCm", 350.1], ["quantity", 0], ["quantity", 100], ["quantity", 1.5], ["widthCm", Number.NaN], ["heightCm", Infinity], ["quantity", Number.NaN]]) {
  const quote = quoteOpenRollExample({ widthCm: 30, heightCm: 40, quantity: 1, colorId: "c-white", railId: "br-sewn", holderId: "h-std-white", [field]: value });
  assert.equal(quote.ok, false, `${field}=${value} must be rejected`);
}

assert.equal(quoteOpenRollExample({ widthCm: 30, heightCm: 40, quantity: 1, colorId: "bad", railId: "br-sewn", holderId: "h-std-white" }).ok, false);
console.log("PASS open-roll example formula, options, bounds, finite values and quantity");