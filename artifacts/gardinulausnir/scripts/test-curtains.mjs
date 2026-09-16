import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { products } from "../src/pages/storefront/_shared/data.ts";
import {
  curtainInquiryHref,
  GLUGGATJOLD_1000_ID,
  GLUGGATJOLD_2828_ID,
  GLUGGATJOLD_2883_ID,
  GLUGGATJOLD_1000_SWATCHES,
  GLUGGATJOLD_2828_SWATCHES,
  GLUGGATJOLD_2883_SWATCHES,
} from "../src/pages/storefront/_shared/curtains.ts";

const projectRoot = resolve(new URL("..", import.meta.url).pathname);
const curtainsDirectory = join(projectRoot, "src/assets/curtains");
const expectedFiles = [...GLUGGATJOLD_1000_SWATCHES, ...GLUGGATJOLD_2828_SWATCHES, ...GLUGGATJOLD_2883_SWATCHES].map(({ fileName }) => fileName);
const actualFiles = readdirSync(curtainsDirectory).filter((fileName) => fileName.endsWith(".jpg"));

assert.equal(expectedFiles.length, 37);
assert.equal(GLUGGATJOLD_2828_SWATCHES.length, 17);
assert.equal(GLUGGATJOLD_2883_SWATCHES.length, 6);
assert.equal(new Set(expectedFiles).size, 37);
assert.deepEqual(actualFiles.sort(), expectedFiles.slice().sort());
for (const fileName of expectedFiles) {
  const filePath = join(curtainsDirectory, fileName);
  assert.equal(statSync(filePath).isFile(), true);
}
assert.equal(readdirSync(curtainsDirectory).some((fileName) => fileName.toLowerCase() === "thumbs.db"), false);

const product = products.find(({ id }) => id === GLUGGATJOLD_1000_ID);
assert.ok(product);
assert.equal(product.title, "Gluggatjöld — 1000");
assert.equal(product.category, "Gluggatjöld");
assert.equal(product.price, "Verð eftir fyrirspurn");
assert.equal(product.colors.length, 0);
assert.equal(product.note, "100% myrkvun");
assert.equal(product.subtitle.includes("100% myrkvun"), true);
assert.equal(product.subtitle.includes("85%"), false);
assert.deepEqual(product.swatches.map(({ code }) => code), [
  "1000.24",
  "1000.25",
  "1000.13",
  "1000.19",
  "1000.20",
  "1000.01",
  "1000.09",
  "1000.30",
  "1000.08",
  "1000.07",
  "1000.11",
  "1000.06",
  "1000.31",
  "1000.04",
]);

const secondProduct = products.find(({ id }) => id === GLUGGATJOLD_2828_ID);
assert.ok(secondProduct);
assert.equal(secondProduct.title, "Gluggatjöld — 2828");
assert.equal(secondProduct.subtitle, "17 litakóðar · 85% myrkvun · sýnishorn til skoðunar");
assert.equal(secondProduct.category, "Gluggatjöld");
assert.equal(secondProduct.price, "Verð eftir fyrirspurn");
assert.equal(secondProduct.note, "85% myrkvun");
assert.deepEqual(secondProduct.swatches.map(({ code }) => code), [
  "2828.07",
  "2828.08",
  "2828.03",
  "2828.09",
  "2828.23",
  "2828.06",
  "2828.22",
  "2828.21",
  "2828.12",
  "2828.02",
  "2828.20",
  "2828.19",
  "2828.18",
  "2828.17",
  "2828.13",
  "2828.16",
  "2828.15",
]);

const thirdProduct = products.find(({ id }) => id === GLUGGATJOLD_2883_ID);
assert.ok(thirdProduct);
assert.equal(thirdProduct.title, "Gluggatjöld — 2883");
assert.equal(thirdProduct.subtitle, "6 litakóðar · sýnishorn til skoðunar");
assert.equal(thirdProduct.category, "Gluggatjöld");
assert.equal(thirdProduct.price, "Verð eftir fyrirspurn");
assert.equal(thirdProduct.note, "2883");
assert.equal(thirdProduct.subtitle.includes("%"), false);
assert.equal(thirdProduct.subtitle.includes("myrkvun"), false);
assert.deepEqual(thirdProduct.swatches.map(({ code }) => code), [
  "2883.03",
  "2883.11",
  "2883.10",
  "2883.07",
  "2883.02",
  "2883.01",
]);

const inquiry = curtainInquiryHref(GLUGGATJOLD_2828_ID, "2828.15");
const inquiryUrl = new URL(inquiry);
assert.equal(inquiryUrl.protocol, "mailto:");
assert.equal(inquiryUrl.pathname, "hallo@gardinulausnir.is");
assert.match(decodeURIComponent(inquiryUrl.searchParams.get("subject") ?? ""), /Gluggatjöld — 2828/);
assert.match(decodeURIComponent(inquiryUrl.searchParams.get("body") ?? ""), /2828\.15/);
assert.equal(decodeURIComponent(inquiryUrl.search).includes("1000"), false);

const thirdInquiry = curtainInquiryHref(GLUGGATJOLD_2883_ID, "2883.01");
const thirdInquiryUrl = new URL(thirdInquiry);
assert.match(decodeURIComponent(thirdInquiryUrl.searchParams.get("subject") ?? ""), /Gluggatjöld — 2883/);
assert.match(decodeURIComponent(thirdInquiryUrl.searchParams.get("body") ?? ""), /2883\.01/);
assert.equal(decodeURIComponent(thirdInquiryUrl.search).includes("2828"), false);

const firstInquiry = curtainInquiryHref(GLUGGATJOLD_1000_ID, "1000.31");
assert.match(decodeURIComponent(new URL(firstInquiry).searchParams.get("subject") ?? ""), /Gluggatjöld — 1000/);
assert.match(decodeURIComponent(new URL(firstInquiry).searchParams.get("body") ?? ""), /1000\.31/);
assert.equal(decodeURIComponent(new URL(firstInquiry).search).includes("2828"), false);

const productPageSource = readFileSync(
  join(projectRoot, "src/pages/storefront/CurtainsProductDetail.tsx"),
  "utf8",
);
assert.equal(productPageSource.includes("ProductInfoFooter"), false);
assert.equal(productPageSource.includes("Bæta í körfu"), false);
assert.equal(productPageSource.includes("kr."), false);
assert.equal(productPageSource.includes("100% myrkvun"), false);

console.log("Curtains swatches, inquiry and product safeguards passed.");
