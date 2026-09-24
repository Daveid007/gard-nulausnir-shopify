import assert from "node:assert/strict";
import { mergeCatalog } from "../src/pages/storefront/_shared/catalog.ts";

const currency = new Intl.NumberFormat("is-IS", {
  style: "currency",
  currency: "ISK",
  maximumFractionDigits: 0,
});

const image = (url, altText = null) => ({ url, altText });
const product = (overrides) => ({
  id: `gid://shopify/Product/${overrides.handle}`,
  title: "Shopify title must not replace the curated title",
  handle: overrides.handle,
  description: "Shopify description must not replace the curated subtitle",
  productType: overrides.productType,
  tags: overrides.tags ?? [],
  featuredImage: overrides.featuredImage ?? null,
  images: { nodes: overrides.images ?? [] },
  priceRange: {
    minVariantPrice: {
      amount: String(overrides.amount),
      currencyCode: "ISK",
    },
  },
});

const catalog = mergeCatalog({
  connected: true,
  products: {
    nodes: [
      product({
        handle: "honeycomb-45mm",
        productType: "Cellular",
        amount: 123450,
        featuredImage: image("https://shopify.test/direct-featured.jpg"),
        images: [
          image("https://shopify.test/direct-featured.jpg"),
          image("https://shopify.test/direct-secondary.jpg"),
        ],
      }),
      product({
        handle: "curtains-2828",
        title: "Uncurated live curtain title",
        productType: "Roller",
        amount: 999999,
        images: [
          image("https://shopify.test/curtain-live-primary.jpg"),
          image("https://shopify.test/curtain-live-secondary.jpg"),
        ],
      }),
      product({
        handle: "curtains-2883",
        productType: "Roller",
        amount: 777777,
        images: [
          image("https://shopify.test/curtain-2883-primary.jpg"),
          image("https://shopify.test/curtain-2883-secondary.jpg"),
        ],
      }),
    ],
  },
  collections: {
    nodes: [
      {
        title: "Shopify collection title",
        handle: "windour-single",
        products: {
          nodes: [
            product({
              handle: "windour-single-999",
              productType: "Windour",
              amount: 98765,
              images: [
                image("https://shopify.test/collection-primary.jpg"),
                image("https://shopify.test/collection-secondary.jpg"),
              ],
            }),
            product({
              handle: "windour-duo-2000",
              productType: "Windour Duo",
              amount: 112233,
              images: [
                image("https://shopify.test/duo-primary.jpg"),
                image("https://shopify.test/duo-secondary.jpg"),
              ],
            }),
          ],
        },
      },
    ],
  },
});

assert.equal(catalog.liveCount, 5);

const direct = catalog.products.find(({ id }) => id === "honeycomb-45mm");
assert.ok(direct);
assert.equal(direct.title, "Honeycomb 45 mm");
assert.equal(direct.subtitle, "Álfilma · algjör myrkvun");
assert.equal(direct.price, currency.format(123450));
assert.equal(direct.image, "https://shopify.test/direct-featured.jpg");
assert.equal(direct.secondary, "https://shopify.test/direct-secondary.jpg");

const collectionProduct = catalog.products.find(({ id }) => id === "windour-single-999");
assert.ok(collectionProduct);
assert.equal(collectionProduct.title, "Rammagardínur 999");
assert.equal(collectionProduct.category, "WINdoûr — Rammagardínur");
assert.match(collectionProduct.subtitle, /eins og húsgagn/);
assert.equal(collectionProduct.subtitle, "Meira en gardína — eins og húsgagn í rýminu.");
assert.equal(collectionProduct.price, currency.format(98765));
assert.equal(collectionProduct.image, "https://shopify.test/collection-primary.jpg");
assert.equal(collectionProduct.secondary, "https://shopify.test/collection-secondary.jpg");

const duoCollectionProduct = catalog.products.find(({ id }) => id === "windour-duo-2000");
assert.ok(duoCollectionProduct);
assert.equal(duoCollectionProduct.title, "Ramma flugnanet og myrkvunargardínur 2000");
assert.equal(duoCollectionProduct.category, "WINdoûr — Rammagardínur");
assert.equal(duoCollectionProduct.subtitle, "Einangruð myrkvun og flugnanet");
assert.equal(duoCollectionProduct.price, currency.format(112233));
assert.equal(duoCollectionProduct.image, "https://shopify.test/duo-primary.jpg");
assert.equal(duoCollectionProduct.secondary, "https://shopify.test/duo-secondary.jpg");

const roldourProduct = catalog.products.find(({ id }) => id === "roldour-duo-horizontal");
assert.ok(roldourProduct);
assert.equal(roldourProduct.category, "ROLdoûr — Rúllukerfi í ramma");

const curtainProduct = catalog.products.find(({ id }) => id === "curtains-2828");
assert.ok(curtainProduct);
assert.equal(curtainProduct.title, "Gluggatjöld — 2828");
assert.equal(curtainProduct.subtitle, "17 litakóðar · 85% myrkvun · sýnishorn til skoðunar");
assert.equal(curtainProduct.category, "Gluggatjöld");
assert.equal(curtainProduct.price, "Verð eftir fyrirspurn");

const thirdCurtainProduct = catalog.products.find(({ id }) => id === "curtains-2883");
assert.ok(thirdCurtainProduct);
assert.equal(thirdCurtainProduct.title, "Gluggatjöld — 2883");
assert.equal(thirdCurtainProduct.subtitle, "6 litakóðar · sýnishorn til skoðunar");
assert.equal(thirdCurtainProduct.category, "Gluggatjöld");
assert.equal(thirdCurtainProduct.price, "Verð eftir fyrirspurn");

console.log("Catalog merge passed.");