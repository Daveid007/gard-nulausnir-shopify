import assert from "node:assert/strict";
import {
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
assert.deepEqual(ids("roller"), [
  "square-cassette",
  "arc-cassette",
  "open-roll",
  "dual-roller",
  "zebra-blind",
]);
assert.deepEqual(ids("windour-single"), ["windour-single-999", "windour-single-2000"]);
assert.deepEqual(ids("windour-duo"), ["windour-duo-2000", "windour-duo-999"]);
assert.deepEqual(ids("thedour-doors"), [
  "blinddour-trackless-door",
  "netdour-trackless-door",
  "roldour-duo-horizontal",
  "roldour-slimline-horizontal",
  "roldour-single-vertical",
  "roldour-slimline-duo-vertical",
  "roldour-duo-vertical-small",
  "roldour-duo-vertical-large",
]);
assert.deepEqual(ids("unknown"), []);

assert.equal(resolveProductCategory({ id: "zebra-blind", productType: "Honeycomb" }), "roller");
assert.equal(resolveProductCategory({ id: "unmapped", productType: "Cellular blind" }), "honeycomb");
assert.equal(resolveProductCategory({ id: "unmapped", tags: ["roller-blinds"] }), "roller");
assert.equal(resolveProductCategory({ id: "not-a-roller-product", title: "Roller-like" }), null);

assert.equal(collectionCategoryFromUrl({ search: "", hash: "" }), "all");
assert.equal(collectionCategoryFromUrl({ search: "", hash: "#cellular" }), "honeycomb");
assert.equal(collectionCategoryFromUrl({ search: "?category=roller", hash: "#honeycomb" }), "roller");
assert.equal(collectionCategoryFromUrl({ search: "?collection=windour-duo", hash: "" }), "windour-duo");
assert.equal(collectionCategoryFromUrl({ search: "?category=not-a-category", hash: "#roller" }), "unknown");

console.log("Collection filtering passed.");