import assert from "node:assert/strict";
import test from "node:test";
import { quoteRollerWorkbookBlind } from "../lib/rollerWorkbookPricing";
import { buildShopifyDraftOrderLines, checkoutRequestSchema } from "./checkout";

const railColor = "Hvítur" as const;

const cartItems = [
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
    fabricCode: "KB801",
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
];

test("all calculator cart types validate for Shopify checkout", () => {
  const parsed = checkoutRequestSchema.parse({
    items: cartItems,
  });
  assert.equal(parsed.items.length, 6);
});

test("Shopify Draft Order lines keep product links, exact prices, and configuration", () => {
  const parsed = checkoutRequestSchema.parse({
    items: cartItems,
  });
  const lines = buildShopifyDraftOrderLines(parsed.items);

  assert.equal(lines.length, 7);
  assert.deepEqual(
    lines.slice(0, -1).map((line) => line.productHandle),
    [
      "day-night",
      "dual-roller",
      "honeycomb-45mm",
      "honeycomb-25mm",
      "top-down-bottom-up",
      "vertical-45mm",
    ],
  );
  assert.equal(lines[0]?.attributes.find((attribute) => attribute.key === "Litur brautar")?.value, "Hvítur");
  assert.equal(lines.at(-1)?.title, "Uppsetning / Professional installation");
  assert.equal(lines.at(-1)?.unitPriceIsk, 15000);
  assert.equal(lines.at(-1)?.requiresShipping, false);
});

test("legacy roller and zebra requests are rejected instead of receiving stale rates", () => {
  const parsedLegacy = checkoutRequestSchema.safeParse({
    items: [{
      type: "zebra",
      qty: 1,
      width: 1000,
      height: 1200,
      fabricCode: "ZT-B1",
      operation: "chain",
      railColor,
    }],
  });
  assert.equal(parsedLegacy.success, false);
});

test("Roller Blinds workbook validates product family and prices server-side custom lines", () => {
  const workbookItem = {
    type: "roller-workbook" as const,
    qty: 2,
    productId: "butterfly-blinds" as const,
    configuration: {
      family: "butterfly" as const,
      fabricCode: "BFHLA2501-1",
      widthCm: 100,
      heightCm: 120,
      operation: "motor" as const,
      motorType: "wired" as const,
      remote: true,
      hub: true,
      mountPosition: "outside" as const,
      cassette: "Arc with fabric inserted" as const,
    },
    fabricName: "forged client display name",
  };
  const parsed = checkoutRequestSchema.parse({ items: [workbookItem] });
  const lines = buildShopifyDraftOrderLines(parsed.items);
  assert.equal(lines[0]?.productHandle, null);
  assert.equal(lines[0]?.unitPriceIsk, 40326);
  assert.equal(lines[0]?.attributes.find((attribute) => attribute.key === "Efni")?.value, "BFHLA2501-1");
  assert.equal(lines[0]?.attributes.find((attribute) => attribute.key === "Miðstöð")?.value, "Já");
  assert.equal(
    checkoutRequestSchema.safeParse({
      items: [{ ...workbookItem, productId: "sheer-shades" }],
    }).success,
    false,
  );
  assert.equal(
    checkoutRequestSchema.safeParse({
      items: [{ ...workbookItem, configuration: { ...workbookItem.configuration, remote: false, hub: false, fabricCode: "NOT-IN-WORKBOOK" } }],
    }).success,
    false,
  );
  assert.equal(
    checkoutRequestSchema.safeParse({
      items: [{ ...workbookItem, configuration: { ...workbookItem.configuration, fabricCode: "SS-TR-75-110" } }],
    }).success,
    false,
  );
});

test("server workbook fixtures preserve all four family totals and option validation", () => {
  const fixtures = [
    [{ family: "roller", fabricCode: "RSMA0-M01", widthCm: 100, heightCm: 120, quantity: 2, operation: "manual", manualControl: "cord", mountPosition: "outside", cassette: "Square with fabric inserted" }, 14.3538691625538, 14376],
    [{ family: "zebra", fabricCode: "DS-TR-G31-001", widthCm: 100, heightCm: 120, quantity: 2, operation: "manual", manualControl: "cord", mountPosition: "outside", cassette: "Arc with fabric inserted" }, 19.349408790064683, 19380],
    [{ family: "sheer", fabricCode: "SS-TR-75-110", widthCm: 100, heightCm: 120, quantity: 2, operation: "manual", manualControl: "cord", mountPosition: "outside", cassette: "Square with fabric inserted" }, 18.98371732222932, 19014],
    [{ family: "butterfly", fabricCode: "BFHLA2501-1", widthCm: 100, heightCm: 120, quantity: 2, operation: "motor", motorType: "wired", remote: true, hub: true, mountPosition: "outside", cassette: "Arc with fabric inserted" }, 80.52501692978863, 80652],
  ] as const;
  for (const [input, unitUsd, totalIsk] of fixtures) {
    const quote = quoteRollerWorkbookBlind(input);
    assert.equal(quote.ok, true);
    if (quote.ok) {
      assert.equal(quote.supplier.unitUsd, unitUsd);
      assert.equal(quote.retail.totalIsk, totalIsk);
    }
  }
  const invalidTrack = quoteRollerWorkbookBlind({
    family: "butterfly",
    fabricCode: "BFHLA2501-1",
    widthCm: 100,
    heightCm: 120,
    quantity: 1,
    operation: "manual",
    manualControl: "cord",
    mountPosition: "outside",
    track: "u-white",
    cassette: "Arc with fabric inserted",
  });
  assert.equal(invalidTrack.ok, false);
});