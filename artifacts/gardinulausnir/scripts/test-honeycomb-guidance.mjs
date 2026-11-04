import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../src/components/legacy-calculators/HoneycombCalculator.tsx", import.meta.url), "utf8");
const help = readFileSync(new URL("../src/components/legacy-calculators/HoneycombChoiceHelp.tsx", import.meta.url), "utf8");

assert.doesNotMatch(source, /HOLDER_USD|HOLDER_COLORS|setHolder|holderUSD|Lásahaldari|Þráðlaus/);
assert.equal((source.match(/holder: null/g) ?? []).length, 3, "all three add-to-cart paths omit the accessory");
assert.equal((source.match(/<HoneycombControlHelp /g) ?? []).length, 2, "both layouts explain operation");
assert.equal((source.match(/<HoneycombMountHelp /g) ?? []).length, 2, "both layouts explain mounting");
assert.match(help, /Enginn mótor og engin fjarstýring/);
assert.match(help, /HONEYCOMB_45_LIMITS\.cordless\.maxHeightMm/);
assert.match(help, /innbyggðri þrýstistöng/);
assert.match(help, /stamir gúmmípúðar/);
assert.match(help, /engin verkfæri, engar skrúfur/);
assert.doesNotMatch(help, /gluggahandföng|nægt dýpi|BLINDdoûr|NETdoûr/);
console.log("PASS: Honeycomb guidance and removed accessory in both layouts.");
