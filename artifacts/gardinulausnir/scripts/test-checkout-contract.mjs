import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";

const source = readFileSync(new URL("../src/lib/shopifyCheckout.ts", import.meta.url), "utf8");
const js = stripTypeScriptTypes(source).replace("import.meta.env.VITE_API_ORIGIN", JSON.stringify("https://checkout.test"));
const { checkoutLine, quoteOrder, createCheckout } = await import("data:text/javascript;base64," + Buffer.from(js).toString("base64"));
const item = { type: "roller-workbook", qty: 1, productId: "square-cassette",
  fabricName: "RSMA0-M01", configuration: { fabricCode: "RSMA0-M01", widthCm: 120, heightCm: 160 },
  unitPriceIsk: 1, id: "client-id" };
const lines = [checkoutLine(item)];
assert.equal(lines[0].configuration, item.configuration);
assert.equal(lines[0].unitPriceIsk, undefined);
assert.equal(checkoutLine({ ...item, needsReconfigure: true }), null);
assert.equal(checkoutLine({ type: "zebra" }), null);
const calls = [];
globalThis.fetch = async (url, options) => {
  const body = JSON.parse(options.body);
  calls.push({ url, body });
  const data = url.endsWith("/quote")
    ? { currency: "ISK", subtotalIsk: 11453, installationIsk: body.installation ? 15000 : 0,
        totalIsk: body.installation ? 26453 : 11453, lines: [] }
    : { url: "https://example.myshopify.com/checkouts/test" };
  return { ok: true, json: async () => data };
};
for (const installation of [false, true]) {
  const quote = await quoteOrder(lines, installation);
  await createCheckout(lines, quote.totalIsk, installation);
  assert.equal(calls.at(-1).body.expectedTotalIsk, installation ? 26453 : 11453);
  assert.equal(calls.at(-1).body.installation, installation);
  assert.deepEqual(calls.at(-1).body.items, lines);
}
await assert.rejects(createCheckout(lines, undefined), /Staðfestu/);
globalThis.fetch = async () => ({ ok: false, json: async () => ({ error: "Staðfestu núverandi verð" }) });
await assert.rejects(createCheckout(lines, 11453), /núverandi verð/);
globalThis.fetch = async () => ({ ok: true, json: async () => ({ currency: "USD", totalIsk: 1, lines: [] }) });
await assert.rejects(quoteOrder(lines), /Ógilt verð/);
globalThis.fetch = async () => ({ ok: true, json: async () => ({ url: "http://unsafe.test" }) });
await assert.rejects(createCheckout(lines, 11453), /Ógildur/);
console.log("Checkout contract passed: workbook mapping, stale lines, confirmed total, installation, errors, currency and HTTPS.");
