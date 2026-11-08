import assert from "node:assert/strict";
import { quoteRollerWorkbookBlind, getRollerWorkbookSizeLimits } from "../src/lib/rollerWorkbookPricing.ts";
import { quoteRollerWorkbookBlind as serverQuote } from "../../api-server/src/lib/rollerWorkbookPricing.ts";

const input = {
  family: "roller", fabricCode: "RS-TSD2265-2", widthCm: 127, heightCm: 203.2,
  quantity: 2, operation: "manual", manualControl: "plastic-chain",
  mountPosition: "inside", track: "u-white", cassette: "Square with fabric inserted",
};
for (const quote of [quoteRollerWorkbookBlind, serverQuote]) {
  const inside = quote(input);
  const outside = quote({ ...input, mountPosition: "outside" });
  assert.equal(inside.ok, true);
  assert.equal(outside.ok, true);
  assert.equal(inside.effectiveWidthMm, 1270);
  assert.equal(inside.enteredWidthMm, 1270);
  assert.equal(inside.actualAreaSqm, 1.27 * 2.032);
  assert.deepEqual(inside.retail, outside.retail);
  assert.doesNotMatch(inside.notes.join(" "), /deducts 5/);
  assert.deepEqual(inside, quoteRollerWorkbookBlind(input));
  const limits = getRollerWorkbookSizeLimits("roller", "manual", input.fabricCode);
  assert.equal(quote({ ...input, widthCm: limits.minWidthMm / 10, heightCm: 100 }).ok, true);
  assert.equal(quote({ ...input, widthCm: (limits.maxWidthMm + 1) / 10, heightCm: 100 }).ok, false);
}
console.log("Roller entered measurements and server parity passed");
