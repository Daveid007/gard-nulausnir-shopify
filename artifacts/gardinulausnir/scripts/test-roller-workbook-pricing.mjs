import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pricing = await import(
  pathToFileURL(join(root, "src", "lib", "rollerWorkbookPricing.ts")).href,
);
// The source artifact's API server is the required parity target.  The
// workspace-level API copy is only an optional local mirror; the test must
// remain runnable from a standalone checkout of the GitHub repository.
const repoApiRoot = join(root, "..", "api-server");
const workspaceApiRoot = join(root, "..", "..", "..", "..", "artifacts", "api-server");
const apiRoots = [repoApiRoot];
const hasParitySources = async (apiRoot) => {
  try {
    await Promise.all([
      readFile(join(apiRoot, "src", "lib", "rollerWorkbookPricing.ts")),
      readFile(join(apiRoot, "src", "lib", "rollerWorkbookFabrics.ts")),
    ]);
    return true;
  } catch {
    return false;
  }
};
if (workspaceApiRoot !== repoApiRoot && await hasParitySources(workspaceApiRoot)) {
  apiRoots.push(workspaceApiRoot);
}
const apiPricing = await Promise.all(apiRoots.map((apiRoot) => import(
  pathToFileURL(join(apiRoot, "src", "lib", "rollerWorkbookPricing.ts")).href,
)));
const [frontendData, ...serverData] = await Promise.all([
  readFile(join(root, "src", "data", "rollerWorkbookFabrics.ts"), "utf8"),
  ...apiRoots.map((apiRoot) => readFile(join(apiRoot, "src", "lib", "rollerWorkbookFabrics.ts"), "utf8")),
]);
assert.ok(serverData.every((data) => data === frontendData), "both server data copies must exactly match frontend source");
for (const server of apiPricing) {
  assert.deepEqual(server.rollerWorkbookFabrics, pricing.rollerWorkbookFabrics);
}

assert.equal(pricing.rollerWorkbookFabrics.length, 338, "all visible B:G fabric rows must be present");
assert.equal(
  new Set(pricing.rollerWorkbookFabrics.map((fabric) => fabric.code)).size,
  338,
  "all extracted fabric codes must be unique",
);
assert.deepEqual(
  [...new Set(pricing.rollerWorkbookFabrics.map((fabric) => fabric.family))].sort(),
  ["butterfly", "roller", "sheer", "zebra"],
);

const validTrack = { roller: "u-white", zebra: "l-black", sheer: "u-white", butterfly: "none" };
for (const fabric of pricing.rollerWorkbookFabrics) {
  const input = {
    family: fabric.family,
    fabricCode: fabric.code,
    widthCm: 120,
    heightCm: 150,
    quantity: 2,
    operation: "manual",
    manualControl: "cord",
    mountPosition: "outside",
    track: validTrack[fabric.family],
    cassette: "Square with fabric inserted",
  };
  const expected = pricing.quoteRollerWorkbookBlind(input);
  assert.equal(expected.ok, true, `frontend default quote must work for ${fabric.code}`);
  for (const server of apiPricing) assert.deepEqual(server.quoteRollerWorkbookBlind(input), expected, fabric.code);
}

for (const family of ["roller", "zebra", "sheer", "butterfly"]) {
  const fabric = pricing.rollerWorkbookFabrics.find((item) => item.family === family);
  assert.ok(fabric);
  for (const motorType of ["battery-standard", "battery-wifi", "battery-zigbee", "wired", "wired-wifi"]) {
    const input = {
      family, fabricCode: fabric.code, widthCm: 120, heightCm: 150, quantity: 2,
      operation: "motor", motorType, remote: true, hub: true, mountPosition: "outside",
      track: validTrack[family], cassette: "Arc with fabric inserted",
      ...(family === "butterfly" ? {} : { noDrill: true }),
    };
    const expected = pricing.quoteRollerWorkbookBlind(input);
    assert.equal(expected.ok, true, `${family} ${motorType} quote must work`);
    for (const server of apiPricing) assert.deepEqual(server.quoteRollerWorkbookBlind(input), expected, `${family} ${motorType}`);
  }
}

const sourceFixture = pricing.quoteRollerWorkbookBlind({
  family: "roller",
  fabricCode: "RS-TSD2265-2",
  // 50 × 80in source example: 1270mm entered width, then 5mm inside deduction.
  widthCm: 127,
  heightCm: 203.2,
  quantity: 2,
  operation: "manual",
  manualControl: "plastic-chain",
  mountPosition: "inside",
  track: "u-white",
  cassette: "Square with fabric inserted",
});
assert.equal(sourceFixture.ok, true);
assert.ok(Math.abs(sourceFixture.supplier.unitUsd - 53.4563995678041) < 1e-12);
assert.ok(Math.abs(sourceFixture.supplier.totalUsd - 106.9127991356082) < 1e-12);
assert.equal(sourceFixture.supplier.trackUsd, 20.32, "U track is charged once for both sides");
assert.equal(sourceFixture.effectiveWidthMm, 1265);
const retailFactor = 2 * (1 / 0.6) * 121.16 * 1.24;
assert.equal(sourceFixture.retail.unitIsk, Math.round(sourceFixture.supplier.unitUsd * retailFactor));
assert.equal(sourceFixture.retail.totalIsk, sourceFixture.retail.unitIsk * 2);

assert.deepEqual(pricing.getRollerWorkbookSizeLimits("sheer", "motor", "SS-PA-100-110"), {
  minWidthMm: 800,
  maxWidthMm: 2300,
  minHeightMm: 500,
  maxHeightMm: 2500,
  maxAreaSqm: 4,
});
const sheer100TooNarrow = pricing.quoteRollerWorkbookBlind({
  family: "sheer",
  fabricCode: "SS-PA-100-110",
  widthCm: 70,
  heightCm: 100,
  quantity: 1,
  operation: "motor",
  motorType: "battery-standard",
  mountPosition: "outside",
  cassette: "Square with fabric inserted",
});
assert.equal(sheer100TooNarrow.ok, false);
assert.match(sheer100TooNarrow.errors.join(" "), /800/);
const sheer100InsidePasses = pricing.quoteRollerWorkbookBlind({
  family: "sheer",
  fabricCode: "SS-PA-100-110",
  // 80.5cm entered width becomes the 800mm source minimum inside.
  widthCm: 80.5,
  heightCm: 100,
  quantity: 1,
  operation: "motor",
  motorType: "battery-standard",
  mountPosition: "inside",
  cassette: "Square with fabric inserted",
});
assert.equal(sheer100InsidePasses.ok, true);

const invalidButterfly = pricing.quoteRollerWorkbookBlind({
  family: "butterfly",
  fabricCode: "BFHLA2503-8",
  widthCm: 127,
  heightCm: 203.2,
  quantity: 1,
  operation: "motor",
  // The workbook's sample mixes this manual option into a motor row. Do not copy it.
  manualControl: "plastic-chain",
  motorType: "battery-standard",
  mountPosition: "inside",
  cassette: "Square with fabric inserted",
});
assert.equal(invalidButterfly.ok, false);
assert.match(invalidButterfly.errors.join(" "), /manualControl must be omitted/);

const wrongFamily = pricing.quoteRollerWorkbookBlind({
  family: "zebra",
  fabricCode: "RS-TSD2265-2",
  widthCm: 100,
  heightCm: 100,
  quantity: 1,
  operation: "manual",
  manualControl: "cord",
  mountPosition: "outside",
  cassette: "Arc with fabric inserted",
});
assert.equal(wrongFamily.ok, false);
assert.match(wrongFamily.errors.join(" "), /belongs to roller/);

const manualRemote = pricing.quoteRollerWorkbookBlind({
  family: "roller",
  fabricCode: "RS-TSD2265-2",
  widthCm: 100,
  heightCm: 100,
  quantity: 1,
  operation: "manual",
  manualControl: "cord",
  remote: true,
  mountPosition: "outside",
  track: "u-white",
  cassette: "Arc with fabric inserted",
});
assert.equal(manualRemote.ok, false);
assert.match(manualRemote.errors.join(" "), /remote is only available/);

const motorHub = pricing.quoteRollerWorkbookBlind({
  family: "roller",
  fabricCode: "RS-TSD2265-2",
  widthCm: 100,
  heightCm: 100,
  quantity: 1,
  operation: "motor",
  motorType: "battery-standard",
  hub: true,
  mountPosition: "outside",
  track: "l-black",
  cassette: "Arc with fabric inserted",
});
assert.equal(motorHub.ok, true);
assert.equal(motorHub.supplier.hubUsd, 22);
const manualHub = pricing.quoteRollerWorkbookBlind({
  family: "roller",
  fabricCode: "RS-TSD2265-2",
  widthCm: 100,
  heightCm: 100,
  quantity: 1,
  operation: "manual",
  manualControl: "cord",
  hub: true,
  mountPosition: "outside",
  track: "u-grey",
  cassette: "Arc with fabric inserted",
});
assert.equal(manualHub.ok, false);
assert.match(manualHub.errors.join(" "), /hub is only available/);

const tooManyBlinds = pricing.quoteRollerWorkbookBlind({
  family: "roller",
  fabricCode: "RS-TSD2265-2",
  widthCm: 100,
  heightCm: 100,
  quantity: 100,
  operation: "manual",
  manualControl: "cord",
  mountPosition: "outside",
  track: "l-white",
  cassette: "Arc with fabric inserted",
});
assert.equal(tooManyBlinds.ok, false);
assert.match(tooManyBlinds.errors.join(" "), /no greater than 99/);

for (const track of [undefined, "none"]) {
  const optionalTrackQuote = pricing.quoteRollerWorkbookBlind({
    family: "roller",
    fabricCode: "RS-TSD2265-2",
    widthCm: 100,
    heightCm: 120,
    quantity: 1,
    operation: "manual",
    manualControl: "cord",
    mountPosition: "outside",
    ...(track === undefined ? {} : { track }),
    cassette: "Square with fabric inserted",
  });
  assert.equal(optionalTrackQuote.ok, true, `roller track ${String(track)} must be optional`);
  assert.equal(optionalTrackQuote.track, "none");
  assert.equal(optionalTrackQuote.supplier.trackUsd, 0);
  for (const server of apiPricing) {
    assert.deepEqual(server.quoteRollerWorkbookBlind({
      family: "roller",
      fabricCode: "RS-TSD2265-2",
      widthCm: 100,
      heightCm: 120,
      quantity: 1,
      operation: "manual",
      manualControl: "cord",
      mountPosition: "outside",
      ...(track === undefined ? {} : { track }),
      cassette: "Square with fabric inserted",
    }), optionalTrackQuote);
  }
}

for (const family of ["zebra", "sheer", "butterfly"]) {
  const fabric = pricing.rollerWorkbookFabrics.find((item) => item.family === family);
  const noTrack = pricing.quoteRollerWorkbookBlind({
    family,
    fabricCode: fabric.code,
    widthCm: 100,
    heightCm: 120,
    quantity: 1,
    operation: "manual",
    manualControl: "cord",
    mountPosition: "outside",
    track: "none",
    cassette: "Square with fabric inserted",
  });
  assert.equal(noTrack.ok, true, `${family} must continue to support no track`);
  assert.equal(noTrack.supplier.trackUsd, 0);
}

const lTrack = pricing.quoteRollerWorkbookBlind({
  family: "roller",
  fabricCode: "RS-TSD2265-2",
  widthCm: 100,
  heightCm: 120,
  quantity: 1,
  operation: "manual",
  manualControl: "cord",
  mountPosition: "outside",
  track: "l-black",
  cassette: "Square with fabric inserted",
});
assert.equal(lTrack.ok, true);
assert.equal(lTrack.supplier.trackUsd, 6, "L track is charged once for both sides");
for (const server of apiPricing) {
  assert.deepEqual(server.quoteRollerWorkbookBlind({
    family: "roller",
    fabricCode: "RS-TSD2265-2",
    widthCm: 100,
    heightCm: 120,
    quantity: 1,
    operation: "manual",
    manualControl: "cord",
    mountPosition: "outside",
    track: "l-black",
    cassette: "Square with fabric inserted",
  }), lTrack);
}

console.log("roller workbook pricing tests passed");