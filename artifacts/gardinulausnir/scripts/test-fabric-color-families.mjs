import assert from "node:assert/strict";
import { fabricColorFamily, groupFabricsByColor, groupFabricsByColorAndLight } from "../src/lib/fabricColorFamilies.ts";
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
const samples = [
  { code: "Z1", color: "Blár", light: "Sólarvörn 1%", price: 9 },
  { code: "W2", color: "Hvítur", light: "Sólarvörn 1%", price: 12 },
  { code: "W1", color: "Hvítur", light: "Sólarvörn 1%", price: 5 },
  { code: "W3", color: "Hvítur", light: "Sólarvörn 5%", price: 7 },
  { code: "G1", color: "Grár", light: "Sólarvörn 1%", price: 8 },
];
const groups = groupFabricsByColorAndLight(samples);
assert.equal(groups.length, 4);
assert.equal(groups[0].label, "Hvítur · Sólarvörn 1%");
assert.deepEqual(groups[0].fabrics.map(f => f.code), ["W1", "W2"]);
assert.deepEqual(groups[0].fabrics.map(f => f.price), [5, 12]);
assert.equal(groups[2].color, "Grár");
assert.equal(groups.flatMap(g => g.fabrics).length, samples.length);
assert.deepEqual(groupFabricsByColorAndLight([]), []);
console.log("Identical colour/light labels merge, opacity stays separate and every priced fabric is retained.");
