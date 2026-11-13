import assert from "node:assert/strict";
import test from "node:test";
import { checkoutRequestSchema, buildShopifyDraftOrderLines } from "./checkout";

test("open roll uses ordinary roller prices and preserves its identity at checkout", () => {
  for (const operation of ["manual", "motor"] as const) {
    for (const track of ["none", "u-white"] as const) {
      const configuration = {
        family: "roller", fabricCode: "RSMA0-M01", widthCm: 100, heightCm: 120,
        operation, ...(operation === "motor" ? { motorType: "battery-standard", remote: true, hub: false } : { manualControl: "cord" }),
        mountPosition: "outside", track, cassette: "Open roll",
      };
      const item = { type: "roller-workbook", qty: 2, productId: "open-roll", fabricName: "Roller", configuration };
      const lines = (value: unknown) => buildShopifyDraftOrderLines(checkoutRequestSchema.parse({ items: [value] }).items);
      const [open] = lines(item);
      const [square] = lines({ ...item, productId: "square-cassette", configuration: { ...configuration, cassette: "Square with fabric inserted" } });
      assert.equal(open.unitPriceIsk, square.unitPriceIsk);
      assert.ok(open.unitPriceIsk > 0);
      assert.equal(open.productHandle, "open-roll");
      assert.equal(open.quantity, 2);
      assert.ok(open.attributes.some(a => a.key === "Kassetta" && a.value === "Open roll"));
      assert.equal(checkoutRequestSchema.safeParse({ items: [{ ...item, configuration: { ...configuration, cassette: "Square with fabric inserted" } }] }).success, false);
      assert.equal(checkoutRequestSchema.safeParse({ items: [{ ...item, configuration: { ...configuration, widthCm: -1 } }] }).success, false);
    }
  }
});
