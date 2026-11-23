import test from "node:test";
import assert from "node:assert/strict";
import { buildShopifyDraftOrderLines, checkoutRequestSchema } from "./checkout";
import { increasedRetailPriceIsk } from "../lib/retailPolicy";

test("global 15% follows the existing Honeycomb U-track increase", () => {
  const base = { type: "honeycomb", qty: 1, width: 1400, height: 1245,
    fabricCode: "KT401", operation: "manual", mountPosition: "outside",
    sideTrack: true, sideTrackType: "u", railColor: "Hvítur", bottomRail: "Hvítur" };
  const parse = (item: object) => checkoutRequestSchema.parse({ items: [item] }).items;
  assert.equal(buildShopifyDraftOrderLines(parse(base))[0].unitPriceIsk, 34170);
  assert.equal(buildShopifyDraftOrderLines(parse({...base, sideTrack:false}))[0].unitPriceIsk, Math.round(20652*1.15));
  const lines = buildShopifyDraftOrderLines(parse({...base, qty:3}));
  assert.equal(lines[0].unitPriceIsk, 34170);
  assert.equal(lines[0].quantity, 3);
  for (const line of lines.slice(1)) assert.equal(line.unitPriceIsk, 0);
});
test("global increase preserves zero and rounds existing prices per unit", () => {
  for (const price of [0, 1, 1250, 23770, 29713, 31093, 123450]) {
    assert.equal(increasedRetailPriceIsk(price), Math.round(price * 1.15));
  }
});
