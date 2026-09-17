import assert from "node:assert/strict";
import test from "node:test";
import { buildShopifyDraftOrderLines, checkoutRequestSchema } from "./checkout";

const railColor = "Hvítur" as const;

const cartItems = [
  {
    type: "roller" as const,
    qty: 2,
    width: 1000,
    height: 1200,
    cassette: "C5 — Opin rúlla með yfirhlíf",
    rail: "Ferningsstöng (32 mm) · Hvítur",
    fabricCode: "TSD2261-1",
    fabricColor: "Pure White",
    fabricType: "light-filtering" as const,
    bottomRailType: "Álbotnlisti" as const,
    bottomRailColor: "Hvítur" as const,
    mountType: "Smellifesting" as const,
    operation: "chain" as const,
    sideTrack: false,
  },
  {
    type: "daynight" as const,
    qty: 1,
    width: 1000,
    height: 1200,
    comboKey: "KT+KB" as const,
    frontCode: "KT401",
    backCode: "KB401",
    operation: "manual" as const,
    sideTrack: false,
    railColor,
  },
  {
    type: "dualroller" as const,
    qty: 1,
    width: 1000,
    height: 1200,
    comboKey: "KS+KB" as const,
    frontCode: "KS401",
    backCode: "KB401",
    operation: "manual" as const,
    sideTrack: false,
    railColor,
  },
  {
    type: "honeycomb" as const,
    qty: 1,
    width: 1000,
    height: 1200,
    fabricCode: "KT401",
    operation: "manual" as const,
    sideTrack: false,
    railColor,
    bottomRail: railColor,
  },
  {
    type: "honeycomb-25" as const,
    qty: 1,
    width: 1000,
    height: 1200,
    fabricCode: "KB401",
    operation: "manual" as const,
    sideTrack: false,
    railColor,
    bottomRail: railColor,
  },
  {
    type: "tdbu" as const,
    qty: 1,
    width: 1000,
    height: 1200,
    fabricCode: "KT401",
    operation: "manual" as const,
    sideTrack: false,
    railColor,
  },
  {
    type: "vertical" as const,
    qty: 1,
    width: 1000,
    height: 2000,
    fabricCode: "KT401",
    operation: "manual" as const,
    openingType: "centre" as const,
    railColor,
  },
  {
    type: "zebra" as const,
    qty: 1,
    width: 1000,
    height: 1200,
    fabricCode: "ZT-B1",
    operation: "chain" as const,
    railColor,
  },
];

test("all calculator cart types validate for Shopify checkout", () => {
  const parsed = checkoutRequestSchema.parse({
    items: cartItems,
  });
  assert.equal(parsed.items.length, 8);
});

test("Shopify Draft Order lines keep product links, exact prices, and configuration", () => {
  const parsed = checkoutRequestSchema.parse({
    items: cartItems,
  });
  const lines = buildShopifyDraftOrderLines(parsed.items);

  assert.equal(lines.length, 9);
  assert.deepEqual(
    lines.slice(0, -1).map((line) => line.productHandle),
    [
      "open-roll",
      "day-night",
      "dual-roller",
      "honeycomb-45mm",
      "honeycomb-25mm",
      "top-down-bottom-up",
      "vertical-45mm",
      "zebra-blind",
    ],
  );
  assert.equal(lines[0]?.quantity, 2);
  assert.equal(lines[0]?.unitPriceIsk, 20120);
  assert.equal(lines[0]?.attributes.find((attribute) => attribute.key === "Breidd (mm)")?.value, "1000");
  assert.equal(lines[0]?.attributes.find((attribute) => attribute.key === "Hæð (mm)")?.value, "1200");
  assert.equal(lines[0]?.attributes.find((attribute) => attribute.key === "Botnlisti")?.value, "Álbotnlisti");
  assert.equal(lines[0]?.attributes.find((attribute) => attribute.key === "Litur botnlista")?.value, "Hvítur");
  assert.equal(lines[0]?.attributes.find((attribute) => attribute.key === "Litur")?.value, "Pure White");
  assert.equal(lines[0]?.attributes.find((attribute) => attribute.key === "Dúkagerð")?.value, "light-filtering");
  assert.equal(lines[0]?.attributes.find((attribute) => attribute.key === "Festing")?.value, "Smellifesting");
  assert.equal(lines[7]?.unitPriceIsk, 8546);
  assert.equal(lines[7]?.attributes.find((attribute) => attribute.key === "Litur brautar")?.value, "Hvítur");
  assert.equal(lines.at(-1)?.title, "Uppsetning / Professional installation");
  assert.equal(lines.at(-1)?.unitPriceIsk, 15000);
  assert.equal(lines.at(-1)?.requiresShipping, false);
});

test("unknown Zebra fabrics and unsupported operation sizes are rejected", () => {
  const unknownFabric = { ...cartItems[7], fabricCode: "ZT-NOT-REAL" };
  const parsedUnknown = checkoutRequestSchema.safeParse({
    items: [unknownFabric],
  });
  assert.equal(parsedUnknown.success, false);

  const oversizedCordless = checkoutRequestSchema.parse({
    items: [{ ...cartItems[7], operation: "cordless", width: 2000 }],
  });
  assert.throws(
    () => buildShopifyDraftOrderLines(oversizedCordless.items),
    /exceeds supported limits/,
  );
});