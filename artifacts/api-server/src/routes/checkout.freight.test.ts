import assert from "node:assert/strict";
import test from "node:test";
import { buildShopifyDraftOrderLines, checkoutRequestSchema } from "./checkout";
import { quoteRollerWorkbookBlind, rollerWorkbookFabrics } from "../lib/rollerWorkbookPricing";
import { fixedFreightBlindRetailPrice } from "../lib/retailPolicy";

const factor = (1 / 0.6) * 121.16 * 1.24 * 1.25 * 1.05;
test("freight replaces the old allowance, including supplier costs above 100 USD", () => {
  for (const cost of [0, 15.384, 67.85, 100, 250]) {
    assert.equal(fixedFreightBlindRetailPrice(cost), Math.round((cost + 100) * factor));
  }
});
test("Honeycomb checkout embeds freight once per blind and preserves quantity", () => {
  const items = checkoutRequestSchema.parse({items: [{
    type: "honeycomb", qty: 3, width: 1000, height: 1200,
    fabricCode: "KT401", operation: "manual", sideTrack: false,
    railColor: "Hvítur", bottomRail: "Hvítur", mountPosition: "outside",
  }]}).items;
  const [line] = buildShopifyDraftOrderLines(items);
  assert.equal(line.unitPriceIsk, Math.round((1.2 * 12.82 + 100) * factor));
  assert.equal(line.quantity, 3);
});
test("checkout agrees with quotes for every workbook family; other families retain old freight", () => {
  for (const family of ["roller", "zebra", "sheer", "butterfly"] as const) {
    const fabric = rollerWorkbookFabrics.find(f => f.family === family)!;
    const configuration = {
      family, fabricCode: fabric.code, widthCm: 120, heightCm: 150,
      operation: "manual" as const, manualControl: "cord" as const,
      mountPosition: "outside" as const, track: "none" as const,
      cassette: "Square with fabric inserted",
    };
    const quote = quoteRollerWorkbookBlind({...configuration, quantity: 3});
    assert.ok(quote.ok);
    const expected = Math.round((family === "roller" || family === "zebra"
      ? quote.supplier.unitUsd + 100 : quote.supplier.unitUsd * 2) * factor);
    assert.equal(quote.retail.totalIsk, expected * 3);
    const productId = {roller:"square-cassette", zebra:"zebra-blind", sheer:"sheer-shades", butterfly:"butterfly-blinds"}[family];
    const [line] = buildShopifyDraftOrderLines(checkoutRequestSchema.parse({
      items: [{type:"roller-workbook", qty:3, productId, fabricName:fabric.code, configuration}],
    }).items);
    assert.equal(line.unitPriceIsk, expected);
    assert.equal(line.quantity, 3);
  }
});
