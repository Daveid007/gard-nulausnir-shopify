import assert from "node:assert/strict";
import { chromium } from "@playwright/test";

const base = process.env.SCREEN_BASE_URL;
if (!base) throw new Error("Set SCREEN_BASE_URL to the storefront base URL.");
const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.CHROMIUM_PATH || undefined,
  args: ["--no-sandbox"],
});
try {
  for (const width of [1280, 390]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    for (const [id, family, opposite] of [
      ["windour-single-999", "WINdoûr", "ROLdoûr"],
      ["roldour-duo-horizontal", "ROLdoûr", "WINdoûr"],
    ]) {
      await page.goto(`${base}/products/${id}`);
      const wizard = page.getByRole("region", { name: "Leiðsögn um val og mælingu" });
      await wizard.getByRole("heading", { name: new RegExp(`^${family} —`) }).waitFor();
      assert.equal(await wizard.getByRole("button", { name: new RegExp(opposite) }).count(), 0);
      for (let i = 0; i < 6; i++) await wizard.getByRole("button", { name: /Áfram/ }).click();
      for (const axis of ["width", "height"]) {
        for (let i = 0; i < 3; i++) await wizard.getByTestId(`${axis}-${i}`).fill("850");
      }
      await wizard.getByRole("button", { name: /Áfram/ }).click();
      await wizard.getByRole("button", { name: /Áfram/ }).click();
      await wizard.getByRole("heading", { name: "Yfirlit og næstu skref" }).waitFor();
      const summary = await wizard.locator("dl").innerText();
      assert.ok(summary.includes(family), summary);
      assert.ok(!summary.includes(opposite), summary);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    }
    await page.close();
    console.log(`PASS separate family flows and summaries at ${width}px`);
  }
} finally {
  await browser.close();
}