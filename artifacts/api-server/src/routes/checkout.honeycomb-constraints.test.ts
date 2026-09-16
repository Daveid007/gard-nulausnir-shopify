import assert from "node:assert/strict";
import test from "node:test";
import { buildShopifyDraftOrderLines, checkoutRequestSchema } from "./checkout";

const railColor = "Hvítur" as const;

function honeycombItem(overrides: Record<string, unknown> = {}) {
  return {
    type: "honeycomb",
    qty: 1,
    width: 1000,
    height: 1200,
    fabricCode: "KT401",
    operation: "manual",
    sideTrack: false,
    railColor,
    bottomRail: railColor,
    ...overrides,
  };
}

function tdbuItem(overrides: Record<string, unknown> = {}) {
  return {
    type: "tdbu",
    qty: 1,
    width: 1000,
    height: 1200,
    fabricCode: "KT401",
    operation: "manual",
    sideTrack: false,
    railColor,
    ...overrides,
  };
}

test("source checkout accepts valid workbook boundaries and rejects operation-specific sizes", () => {
  const manual45 = honeycombItem({ width: 500, height: 800 });
  assert.equal(checkoutRequestSchema.safeParse({ items: [manual45] }).success, true);

  const cordless45 = honeycombItem({ operation: "cordless", width: 2001, height: 1000 });
  assert.equal(checkoutRequestSchema.safeParse({ items: [cordless45] }).success, true);
  assert.throws(
    () => buildShopifyDraftOrderLines([cordless45 as never]),
    /workbook limits/,
  );

  const manualTdbu = tdbuItem({ width: 799, height: 1000 });
  assert.equal(checkoutRequestSchema.safeParse({ items: [manualTdbu] }).success, true);
  assert.throws(
    () => buildShopifyDraftOrderLines([manualTdbu as never]),
    /workbook limits/,
  );
});

test("source checkout exposes only supported TDBU and 25 mm operations", () => {
  assert.equal(
    checkoutRequestSchema.safeParse({ items: [tdbuItem({ operation: "cordless" })] }).success,
    true,
  );
  assert.equal(
    checkoutRequestSchema.safeParse({ items: [tdbuItem({ operation: "motor" })] }).success,
    false,
  );
  assert.equal(
    checkoutRequestSchema.safeParse({ items: [honeycombItem({ type: "honeycomb-25", operation: "motor" })] }).success,
    false,
  );
});

test("source checkout rejects unknown honeycomb inventory instead of using client rates", () => {
  assert.equal(
    checkoutRequestSchema.safeParse({ items: [honeycombItem({ fabricCode: "NOT-IN-WORKBOOK" })] }).success,
    false,
  );
  assert.equal(
    checkoutRequestSchema.safeParse({ items: [tdbuItem({ fabricCode: "NOT-IN-WORKBOOK" })] }).success,
    false,
  );
});