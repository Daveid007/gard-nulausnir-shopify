import assert from "node:assert/strict";
import { fabricColorFamily, groupFabricsByColor } from "../src/lib/fabricColorFamilies.ts";
import { rollerWorkbookFabrics } from "../src/lib/rollerWorkbookPricing.ts";
assert.equal(fabricColorFamily("Cream"), fabricColorFamily("White"));
assert.equal(fabricColorFamily("Dark Grey"), fabricColorFamily("Pewter"));
assert.equal(fabricColorFamily("White/White"), fabricColorFamily("White"));
assert.equal(fabricColorFamily("Grey/Dark Grey"), fabricColorFamily("Grey"));
assert.equal(fabricColorFamily("White/Black"), "Blandaðir litir");
assert.equal(fabricColorFamily("Black*Brown"), "Blandaðir litir");
assert.equal(fabricColorFamily("/"), "Aðrir / ótilgreindir litir");
for (const fabric of rollerWorkbookFabrics) {
  if (fabric.color !== "/") assert.notEqual(fabricColorFamily(fabric.color), "Aðrir / ótilgreindir litir", fabric.color);
}
const fabrics = rollerWorkbookFabrics.map((f) => ({ ...f, colorFamily: fabricColorFamily(f.color) }));
const grouped = groupFabricsByColor(fabrics).flatMap((g) => g.fabrics);
assert.equal(grouped.length, fabrics.length);
assert.deepEqual([...grouped].sort((a,b) => a.code.localeCompare(b.code)), [...fabrics].sort((a,b) => a.code.localeCompare(b.code)));
assert.deepEqual(groupFabricsByColor([]), []);
console.log("Color families cover every known color and preserve all fabrics and prices.");
