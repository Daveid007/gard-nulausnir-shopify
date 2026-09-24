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

const wizardSource = await readFile(new URL("../src/components/ThedourScreenWizard.tsx", import.meta.url), "utf8");
assert.match(wizardSource, /measurementsInSupportedRange = measurementsValid/, "measurement gating must be independent of DUO colour validity");
assert.match(wizardSource, /step === 6 && !measurementsInSupportedRange/, "DUO colour changes must not make the measurement step report a false measurement error");
assert.match(wizardSource, /Velja liti fyrst/, "colour controls must be reachable before measurements are complete");
assert.match(wizardSource, /aria-label="Skref í vöruvali"/, "wizard steps must be directly and accessibly navigable");
assert.match(wizardSource, /target === 8 && !measurementsInSupportedRange/, "direct summary navigation must still validate measurements");
assert.match(wizardSource, /endurlitar ekki aðalvörumyndina/, "swatches must clearly explain that they record a selection rather than recolour the product photo");
assert.match(wizardSource, /selection\.mappedProductId !== props\.initialProductId/, "the mapped size tier must provide a usable navigation link");

const calculatorSource = await readFile(new URL("../src/components/WindourCalculator.tsx", import.meta.url), "utf8");
assert.match(calculatorSource, /WINDOUR_SELECTION_STORAGE_KEY/, "a valid wizard selection must survive mapped-tier navigation");
assert.match(calculatorSource, /initialSelection=\{restoredSelection\}/, "the mapped product must restore the wizard selection");

console.log("PASS WINdoûr size bands, outer-frame validation, DUO inquiry gate, notes and persistence contract");