import assert from "node:assert/strict";
import { quoteRollerWorkbookBlind as frontend, rollerWorkbookFabrics } from "../src/lib/rollerWorkbookPricing.ts";
import { quoteRollerWorkbookBlind as backend } from "../../api-server/src/lib/rollerWorkbookPricing.ts";

for (const family of ["roller", "zebra", "sheer", "butterfly"]) {
  const fabric = rollerWorkbookFabrics.find((f) => f.family === family);
  for (const motorType of ["battery-standard", "battery-wifi", "battery-zigbee", "wired", "wired-wifi"]) {
    for (const remote of [undefined, false, true]) {
      const input = {
        family, fabricCode: fabric.code, widthCm: 120, heightCm: 150, quantity: 2,
        operation: "motor", motorType, remote, hub: true, mountPosition: "outside",
        cassette: "Arc with fabric inserted",
      };
      const quote = frontend(input);
      assert.equal(quote.ok, true);
      assert.equal(quote.remote, true);
      assert.equal(quote.hub, false);
      assert.equal(quote.supplier.remoteUsd, 7);
      assert.equal(quote.supplier.hubUsd, 0);
      assert.equal(quote.retail.totalIsk, quote.retail.unitIsk * 2);
      assert.deepEqual(backend(input), quote);
    }
  }
}
console.log("All motor types include a remote and exclude Hub; API pricing matches.");
