import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { products as curatedProducts } from "../src/pages/storefront/_shared/data.ts";
import {
  categoryLabel,
  collectionCategoryFromUrl,
  filterProductsByCategory,
  resolveProductCategory,
} from "../src/pages/storefront/_shared/collectionCategories.ts";

const products = [
  "honeycomb-45mm",
  "honeycomb-25mm",
  "day-night",
  "top-down-bottom-up",
  "vertical-45mm",
  "square-cassette",
  "arc-cassette",
  "open-roll",
  "dual-roller",
  "zebra-blind",
  "windour-single-999",
  "windour-single-2000",
  "windour-duo-2000",
  "windour-duo-999",
  "curtains-1000",
  "curtains-2828",
  "curtains-2883",
  "blinddour-trackless-door",
  "netdour-trackless-door",
  "roldour-duo-horizontal",
  "roldour-slimline-horizontal",
  "roldour-single-vertical",
  "roldour-slimline-duo-vertical",
  "roldour-duo-vertical-small",
  "roldour-duo-vertical-large",
].map((id) => ({ id }));

const ids = (category) => filterProductsByCategory(products, category).map((product) => product.id);

assert.deepEqual(ids("honeycomb"), [
  "honeycomb-45mm",
  "honeycomb-25mm",
  "day-night",
  "top-down-bottom-up",
  "vertical-45mm",
]);
assert.deepEqual(ids("cellular"), [
  "honeycomb-45mm",
  "honeycomb-25mm",
  "day-night",
  "top-down-bottom-up",
  "vertical-45mm",
]);
assert.deepEqual(ids("myrkvunargardinur"), [
  "honeycomb-45mm",
  "honeycomb-25mm",
  "day-night",
  "top-down-bottom-up",
  "vertical-45mm",
]);
assert.deepEqual(ids("hunangskambsgardinur"), [
  "honeycomb-45mm",
  "honeycomb-25mm",
  "day-night",
  "top-down-bottom-up",
  "vertical-45mm",
]);
assert.deepEqual(ids("roller"), [
  "square-cassette",
  "arc-cassette",
  "open-roll",
  "dual-roller",
]);
assert.deepEqual(ids("zebra"), ["zebra-blind"]);
assert.deepEqual(ids("sebragardinur"), ["zebra-blind"]);
const windourIds = ["windour-single-999", "windour-single-2000", "windour-duo-2000", "windour-duo-999"];
const roldourIds = [
  "roldour-duo-horizontal",
  "roldour-slimline-horizontal",
  "roldour-single-vertical",
  "roldour-slimline-duo-vertical",
  "roldour-duo-vertical-small",
  "roldour-duo-vertical-large",
];
assert.deepEqual(ids("windour"), windourIds);
assert.deepEqual(ids("windour-single"), windourIds);
assert.deepEqual(ids("einfaldar-rullugardinur"), windourIds);
assert.deepEqual(ids("ramma-rullugardina"), windourIds);
assert.deepEqual(ids("ramma-rullugardinur"), windourIds);
assert.deepEqual(ids("windour-duo"), windourIds);
assert.deepEqual(ids("tviskiptar-rullugardinur-duo"), windourIds);
assert.deepEqual(ids("ramma-gardina-med-flugnaneti"), windourIds);
assert.deepEqual(ids("ramma-flugnanet-og-myrkvunargardinur"), windourIds);
assert.deepEqual(ids("roldour"), roldourIds);
assert.deepEqual(ids("curtains"), ["curtains-1000", "curtains-2828", "curtains-2883"]);
assert.deepEqual(ids("gluggatjold"), ["curtains-1000", "curtains-2828", "curtains-2883"]);
assert.deepEqual(ids("roller"), [
  "square-cassette",
  "arc-cassette",
  "open-roll",
  "dual-roller",
]);
assert.deepEqual(ids("honeycomb"), [
  "honeycomb-45mm",
  "honeycomb-25mm",
  "day-night",
  "top-down-bottom-up",
  "vertical-45mm",
]);
assert.deepEqual(ids("thedour-doors"), [
  "blinddour-trackless-door",
  "netdour-trackless-door",
]);
assert.deepEqual(ids("flugnanet-og-rammar"), [
  "blinddour-trackless-door",
  "netdour-trackless-door",
]);
assert.deepEqual(ids("unknown"), []);

assert.equal(resolveProductCategory({ id: "zebra-blind", productType: "Honeycomb" }), "zebra");
assert.equal(resolveProductCategory({ id: "unmapped", category: "Sebragardínur" }), "zebra");
assert.equal(resolveProductCategory({ id: "unmapped", productType: "Zebra Blinds" }), "zebra");
assert.equal(categoryLabel("zebra"), "Sebragardínur");
assert.equal(resolveProductCategory({ id: "unmapped", productType: "Cellular blind" }), "honeycomb");
assert.equal(resolveProductCategory({ id: "unmapped", category: "Myrkvunargardínur" }), "honeycomb");
assert.equal(resolveProductCategory({ id: "unmapped", category: "Einfaldar Rúllugardínur" }), "windour");
assert.equal(resolveProductCategory({ id: "unmapped", category: "Tvískiptar Rúllugardínur (Duo)" }), "windour");
assert.equal(resolveProductCategory({ id: "unmapped", category: "Ramma rúllugardína" }), "windour");
assert.equal(resolveProductCategory({ id: "unmapped", category: "Ramma rúllugardínur" }), "windour");
assert.equal(resolveProductCategory({ id: "unmapped", category: "Ramma gardína með flugnaneti" }), "windour");
assert.equal(resolveProductCategory({ id: "unmapped", category: "Ramma flugnanet og myrkvunargardínur" }), "windour");
assert.equal(resolveProductCategory({ id: "curtains-1000", productType: "Roller" }), "curtains");
assert.equal(resolveProductCategory({ id: "curtains-2828", productType: "Honeycomb" }), "curtains");
assert.equal(resolveProductCategory({ id: "curtains-2883", productType: "Roller" }), "curtains");
assert.equal(resolveProductCategory({ id: "unmapped", category: "Gluggatjöld" }), "curtains");
assert.equal(resolveProductCategory({ id: "unmapped", category: "Flugnanet og rammar" }), "thedour-doors");
assert.equal(resolveProductCategory({ id: "unmapped", tags: ["roller-blinds"] }), "roller");
assert.equal(resolveProductCategory({ id: "not-a-roller-product", title: "Roller-like" }), null);
assert.equal(categoryLabel("honeycomb"), "Honeycomb");
assert.equal(categoryLabel("windour"), "WINdoûr — Rammagardínur");
assert.equal(resolveProductCategory({ id: "unmapped", category: "Rammagardínur" }), "windour");
assert.equal(resolveProductCategory({ id: "unmapped", category: "WINdoûr — Rammagardínur" }), "windour");
assert.equal(categoryLabel("roldour"), "ROLdoûr — Rúllukerfi í ramma");
assert.equal(resolveProductCategory({ id: "unmapped", category: "ROLdoûr — Rúllukerfi í ramma" }), "roldour");
assert.equal(categoryLabel("curtains"), "Gluggatjöld");
assert.equal(categoryLabel("thedour-doors"), "Hurðagardínur og flugnanet");

assert.equal(collectionCategoryFromUrl({ search: "", hash: "" }), "all");
assert.equal(collectionCategoryFromUrl({ search: "", hash: "#cellular" }), "honeycomb");
assert.equal(collectionCategoryFromUrl({ search: "?category=roller", hash: "#honeycomb" }), "roller");
assert.equal(collectionCategoryFromUrl({ search: "?collection=windour-duo", hash: "" }), "windour");
assert.equal(collectionCategoryFromUrl({ search: "", hash: "#windour-single" }), "windour");
assert.equal(collectionCategoryFromUrl({ search: "", hash: "#roldour" }), "roldour");
assert.equal(collectionCategoryFromUrl({ search: "", hash: "#curtains" }), "curtains");
assert.equal(collectionCategoryFromUrl({ search: "", hash: "#zebra" }), "zebra");
assert.equal(collectionCategoryFromUrl({ search: "?category=zebra", hash: "#roller" }), "zebra");
assert.equal(collectionCategoryFromUrl({ search: "", hash: "#sebragardinur" }), "zebra");
assert.equal(collectionCategoryFromUrl({ search: "?category=not-a-category", hash: "#roller" }), "unknown");

const zebraProduct = curatedProducts.find(product => product.id === "zebra-blind");
assert.ok(zebraProduct, "the existing product id must be preserved");
assert.equal(zebraProduct.category, "Sebragardínur");
assert.ok(zebraProduct.image.endsWith("/zebra/black-cassette-cover.webp"));
assert.ok(existsSync(new URL(zebraProduct.image)), "the owner-selected cover must exist");
assert.deepEqual(zebraProduct.gallery, [zebraProduct.image], "the editorial gallery must keep Shopify from replacing the selected cover");
assert.equal(zebraProduct.price, "Reiknast eftir máli");
const homeSource = readFileSync(new URL("../src/pages/storefront/Homepage.tsx", import.meta.url), "utf8");
assert.match(homeSource, /id: "zebra".*image: zebraPrimaryImage/, "the homepage category card must use the same cover");
assert.equal((homeSource.match(/href=\{`\$\{collectionHref\}#zebra`\}/g) ?? []).length, 2, "desktop and mobile homepage navigation must link to Zebra");
const headerSource = readFileSync(new URL("../src/pages/storefront/_shared/Storefront.tsx", import.meta.url), "utf8");
assert.equal((headerSource.match(/collectionHref\("zebra"\)/g) ?? []).length, 3, "collection and product navigation must include Zebra on desktop and mobile");

console.log("Collection filtering passed.");