import assert from "node:assert/strict";
import test from "node:test";
import { buildShopifyDraftOrderLines, checkoutRequestSchema } from "./checkout";
import { quoteRollerWorkbookBlind, rollerWorkbookFabrics } from "../lib/rollerWorkbookPricing";
import { freightBlindRetailPrice } from "../lib/retailPolicy";
import { freightUsd, orderFreightUsd } from "../lib/freight";

const factor = 121.16 * 1.24 / 0.65;
test("35% gross margin replaces fixed freight and stacked retail adjustments", () => {
  for (const cost of [0, 15.384, 67.85, 100, 250]) {
    const price = freightBlindRetailPrice(cost, 40.8);
    assert.equal(price, Math.round((cost + 40.8) * factor));
    const net = price / 1.24;
    assert.ok(Math.abs((net - (cost + 40.8) * 121.16) / net - 0.35) < 0.0001);
  }
});
test("all REV 5 tier boundaries and invalid inputs", () => {
  const quantities = [1, 3, 4, 7, 8, 10, 11, 14, 15, 18, 19, 99];
  const rates = {roller: [37,34,31,27,25,22], cellular: [34.5,31.5,28.5,24.5,22.5,19.5], daynight: [36.5,33.5,30.5,26.5,24.5,21.5]};
  for (const group of ["roller", "cellular", "daynight"] as const) {
    quantities.forEach((qty, i) => assert.equal(freightUsd(2, qty, group), rates[group][Math.floor(i / 2)] * 2));
  }
  for (const qty of [0, -1, 1.5, Infinity, NaN]) assert.throws(() => freightUsd(2, qty, "roller"));
  for (const area of [0, -1, Infinity, NaN]) assert.throws(() => freightUsd(area, 1, "roller"));
});
test("four different roller sizes total 94,189 ISK including free installation", () => {
  const items = checkoutRequestSchema.parse({items: [[128.8,144.3],[132.3,144.1],[196.7,144.1],[128.5,144.1]].map(([widthCm,heightCm]) => ({
    type: "roller-workbook", qty: 1, productId: "open-roll", fabricName: "RSSK00-0101",
    configuration: {family: "roller", fabricCode: "RSSK00-0101", widthCm, heightCm, operation: "manual",
      manualControl: "plastic-chain", mountPosition: "outside", track: "none", cassette: "Open roll"},
  }))}).items;
  const lines = buildShopifyDraftOrderLines(items, true);
  assert.deepEqual(lines.map(line => line.unitPriceIsk), [20714,21248,31590,20637,0]);
  assert.equal(lines.reduce((sum, line) => sum + line.unitPriceIsk * line.quantity, 0), 94189);
});
test("checkout matches workbook quotes; unrelated families retain their policy", () => {
  for (const family of ["roller", "zebra", "sheer", "butterfly"] as const) {
    const fabric = rollerWorkbookFabrics.find(f => f.family === family)!;
    const configuration = {family, fabricCode: fabric.code, widthCm: 120, heightCm: 150,
      operation: "manual" as const, manualControl: "cord" as const, mountPosition: "outside" as const,
      track: "none" as const, cassette: "Square with fabric inserted"};
    const quote = quoteRollerWorkbookBlind({...configuration, quantity: 4});
    assert.ok(quote.ok);
    const productId = {roller:"square-cassette",zebra:"zebra-blind",sheer:"sheer-shades",butterfly:"butterfly-blinds"}[family];
    const [line] = buildShopifyDraftOrderLines(checkoutRequestSchema.parse({items: [
      {type:"roller-workbook", qty:4, productId, fabricName:fabric.code, configuration},
    ]}).items);
    const expected = family === "roller" || family === "zebra"
      ? Math.round((quote.supplier.unitUsd + 1.8 * (family === "roller" ? 34 : 31.5)) * factor)
      : Math.round(quote.supplier.unitUsd * 2 / 0.6 * 121.16 * 1.24 * 1.25 * 1.05);
    assert.equal(line.unitPriceIsk, expected);
    assert.equal(quote.retail.totalIsk, expected * 4);
  }
});
test("split lines and edits share tariffs only within a group", () => {
  const a = {type:"honeycomb", qty:1, width:1000, height:1200, mountPosition:"outside"};
  assert.equal(orderFreightUsd(a, [a, {...a, qty:3}]), 1.2 * 31.5);
  assert.equal(orderFreightUsd(a, [a]), 1.2 * 34.5);
  assert.equal(orderFreightUsd(a, [a, {...a, qty:7}]), 1.2 * 28.5);
  assert.equal(orderFreightUsd(a, [a, {...a, type:"roller", qty:19}]), 1.2 * 34.5);
});
