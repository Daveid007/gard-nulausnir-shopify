import assert from "node:assert/strict";
import { chromium } from "@playwright/test";

const baseUrl = process.env.VERTICAL_SHEER_BASE_URL ?? "http://127.0.0.1:5000";
const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.CHROMIUM_PATH || undefined,
  args: ["--no-sandbox"],
});
const context = await browser.newContext();
const page = await context.newPage();

try {
  await page.goto(`${baseUrl}/products/vertical-sheer-shades`, { waitUntil: "domcontentloaded" });
  await page.evaluate(() => window.localStorage.clear());
  await page.reload({ waitUntil: "domcontentloaded" });

  const width = page.getByTestId("vertical-sheer-width");
  const height = page.getByTestId("vertical-sheer-height");
  await width.waitFor({ state: "visible" });
  await height.waitFor({ state: "visible" });
  await width.fill("80");
  await height.fill("160");
  await page.getByRole("checkbox").check();
  const addButton = page.getByRole("button", { name: "Bæta í körfu" });
  await addButton.click();

  const cart = page.getByRole("dialog", { name: "Karfa lóðréttra vefgardína" });
  await cart.waitFor({ state: "visible" });
  await assertCartLine(cart);
  assert.equal(await cart.getByRole("button", { name: "Greiðsla verður tengd síðar" }).isDisabled(), true, "checkout remains disabled without an API product/variant");

  await page.reload({ waitUntil: "domcontentloaded" });
  await page.getByTestId("vertical-sheer-width").waitFor({ state: "visible" });
  await page.getByRole("button", { name: "Opna körfu lóðréttra vefgardína" }).click();
  const reloadedCart = page.getByRole("dialog", { name: "Karfa lóðréttra vefgardína" });
  await reloadedCart.waitFor({ state: "visible" });
  await assertCartLine(reloadedCart);
  assert.equal(await reloadedCart.getByText("Lóðréttar vefgardínur").count(), 1, "persisted line remains after a real browser reload");

  console.log("PASS real-browser Vertical Sheer cart reload");
} finally {
  await context.close();
  await browser.close();
}

async function assertCartLine(cart) {
  await cart.getByText("MC-A-100601").waitFor({ state: "visible" });
  await cart.getByText("1 stk.").waitFor({ state: "visible" });
  await cart.getByRole("button", { name: "Fjarlægja" }).waitFor({ state: "visible" });
}