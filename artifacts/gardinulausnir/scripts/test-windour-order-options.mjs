import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  getWindourSizeBand,
  isStandardWindourDuoChoice,
  isValidDuoPanelChoices,
  isValidWindourBandForMeasurement,
  isValidWindourNotes,
  WINDOUR_PLEATED_NET,
  WINDOUR_SIZE_BANDS,
} from "../src/lib/windourOrderOptions.ts";
import { THEDOUR_HONEYCOMB_COLOURS } from "../src/lib/thedourProductOptions.ts";

assert.equal(WINDOUR_SIZE_BANDS.length, 10);
assert.deepEqual(WINDOUR_SIZE_BANDS.map(({ minMm, maxMm }) => [minMm, maxMm]), [
  [0, 1099], [1100, 1199], [1200, 1299], [1300, 1399], [1400, 1499],
  [1500, 1599], [1600, 1699], [1700, 1799], [1800, 1899], [1900, 2000],
]);
assert.equal(getWindourSizeBand(1)?.id, "up-to-1099", "no unconfirmed positive minimum");
assert.equal(getWindourSizeBand(999)?.id, "up-to-1099");
assert.equal(getWindourSizeBand(1099)?.id, "up-to-1099");
assert.equal(getWindourSizeBand(1100)?.id, "1100-1199");
assert.equal(getWindourSizeBand(2000)?.id, "1900-2000");
assert.equal(getWindourSizeBand(2001), null);
assert.equal(getWindourSizeBand(0), null);
assert.ok(isValidWindourBandForMeasurement("1800-1899", 1850));
assert.equal(isValidWindourBandForMeasurement("1900-2000", 1850), false);

const validFabrics = [...THEDOUR_HONEYCOMB_COLOURS.map(({ name }) => name), WINDOUR_PLEATED_NET];
const standardDuo = ["Black", WINDOUR_PLEATED_NET];
const customDuo = ["Black", "Sky Blue"];
assert.ok(isValidDuoPanelChoices(standardDuo, validFabrics));
assert.ok(isStandardWindourDuoChoice(standardDuo));
assert.ok(isValidDuoPanelChoices(customDuo, validFabrics));
assert.equal(isStandardWindourDuoChoice(customDuo), false, "two honeycomb panels must remain inquiry-only");
assert.equal(isValidDuoPanelChoices(["Black", "Black"], validFabrics), false);
assert.equal(isValidDuoPanelChoices(["Black"], validFabrics), false);
assert.equal(isValidDuoPanelChoices(["Black", "Invented"], validFabrics), false);
assert.ok(isValidWindourNotes("Staðsetja lokun vinstra megin."));
assert.equal(isValidWindourNotes("x".repeat(2001)), false);

// The cart contract must round-trip the new request data while still accepting
// older lines where these optional fields did not exist.
const persisted = {
  measurementMode: "outer-frame",
  widthBand: getWindourSizeBand(1440)?.id,
  heightBand: getWindourSizeBand(1950)?.id,
  duoPanelChoices: standardDuo,
  additionalNotes: "Ytri mál staðfest af viðskiptavini.",
};
assert.deepEqual(JSON.parse(JSON.stringify(persisted)), persisted);
const cartSource = await readFile(new URL("../src/lib/cart.tsx", import.meta.url), "utf8");
for (const field of ["measurementMode", "widthBand", "heightBand", "duoPanelChoices", "additionalNotes"]) {
  assert.match(cartSource, new RegExp(field), `cart persistence is missing ${field}`);
}
assert.match(cartSource, /measurementMode: item\.measurementMode \?\? "opening"/, "legacy cart lines must default to opening mode");
assert.match(cartSource, /isStandardWindourDuoChoice/, "unverified DUO combinations must not reload as priced lines");

console.log("PASS WINdoûr size bands, outer-frame validation, DUO inquiry gate, notes and persistence contract");