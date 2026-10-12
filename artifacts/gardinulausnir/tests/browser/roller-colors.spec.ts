import { test, expect, type Page } from "@playwright/test";
import { rollerWorkbookFabrics } from "../../src/data/rollerWorkbookFabrics";
import { rollerWorkbookSwatchFilename } from "../../src/lib/rollerWorkbookSwatches";

const families = { roller: 139, zebra: 168, sheer: 22, butterfly: 9 } as const;
const forbiddenRequests = new WeakMap<Page, string[]>();

test.beforeEach(async ({ page }) => {
  const forbidden: string[] = [];
  forbiddenRequests.set(page, forbidden);
  // No Shopify, backend, third-party requests or order/cart writes are allowed.
  await page.route("**/*", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    if (!["GET", "HEAD"].includes(request.method()) ||
        url.origin !== "http://127.0.0.1:4179" ||
        /\/(?:api|checkout|orders|cart)(?:\/|$)/i.test(url.pathname)) {
      if (url.hostname !== "fonts.googleapis.com" && url.hostname !== "fonts.gstatic.com") {
        forbidden.push(`${request.method()} ${url.origin}${url.pathname}`);
      }
      await route.abort();
      return;
    }
    await route.continue();
  });
});

test.afterEach(async ({ page }) => {
  expect(forbiddenRequests.get(page), "tests must not contact commerce services").toEqual([]);
  const cart = page.getByTestId("cart-count");
  if (await cart.count()) await expect(cart).toHaveText("0");
});

for (const [family, count] of Object.entries(families)) {
  const fabrics = rollerWorkbookFabrics.filter((fabric) => fabric.family === family);

  test(`${family}: every supplier fabric has a selectable card, including no-photo cards`, async ({ page }) => {
    await page.goto(`/?family=${family}`);
    const grid = page.getByTestId("rw-swatches");
    const cards = grid.getByRole("button");
    await expect(cards).toHaveCount(count);
    // Assert the actual DOM identities, not just a source count.
    expect(await cards.locator("strong").allTextContents()).toEqual(fabrics.map((fabric) => fabric.code));
    await expect(grid.locator("button:disabled")).toHaveCount(0);

    const withoutPhoto = fabrics.filter((fabric) => !rollerWorkbookSwatchFilename(fabric));
    const placeholders = grid.locator('button[data-image-state="unavailable"]');
    await expect(placeholders).toHaveCount(withoutPhoto.length);
    const missing = withoutPhoto[withoutPhoto.length - 1];
    expect(missing, `${family} should exercise a real no-photo fabric`).toBeTruthy();
    const card = grid.getByRole("button").filter({ has: page.locator("strong", { hasText: missing.code }) });
    await card.scrollIntoViewIfNeeded();
    await expect(card).toBeVisible();
    await expect(card).toContainText("Mynd ekki tiltæk");
    await card.click();
    await expect(card).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByTestId("rw-fabric")).toHaveValue(missing.code);

    // Also select an ordinary card, proving selection can change in each family.
    const other = fabrics.find((fabric) => fabric.code !== missing.code)!;
    const otherCard = grid.getByRole("button").filter({ has: page.locator("strong", { hasText: other.code }) });
    await otherCard.click();
    await expect(otherCard).toHaveAttribute("aria-pressed", "true");
    await expect(card).toHaveAttribute("aria-pressed", "false");
    await expect(page.getByTestId("rw-fabric")).toHaveValue(other.code);
  });

  test(`${family}: search cannot silently replace an excluded selection`, async ({ page }) => {
    await page.goto(`/?family=${family}`);
    const grid = page.getByTestId("rw-swatches");
    const search = page.getByRole("textbox", { name: "Leita að efni" });
    const select = page.getByTestId("rw-fabric");
    const chosen = fabrics[fabrics.length - 1];
    const code = chosen.code;
    const card = grid.getByRole("button").filter({ has: page.locator("strong", { hasText: code }) });
    await card.click();
    await expect(select).toHaveValue(code);

    // Another real supplier code matches results but excludes the chosen card.
    const needle = fabrics[0].code;
    await search.fill(needle);
    await expect(card).toHaveCount(0);
    await expect(grid.getByRole("button")).not.toHaveCount(0);
    await expect(select).toHaveValue(code);
    await expect(select.locator(`option[value="${code}"]`)).toHaveCount(1);
    await expect(page.getByTestId("product-box")).toContainText(`${code} · ${chosen.color}`);

    await search.fill("NO-SUCH-SUPPLIER-FABRIC");
    await expect(grid.getByRole("button")).toHaveCount(0);
    await expect(page.getByTestId("product-box").getByRole("status")).toHaveText("Engin efni fundust. Prófaðu annan kóða eða lit.");
    await expect(select).toHaveValue(code);
    await expect(select.locator("option")).toHaveCount(1);
    await expect(page.getByTestId("product-box")).toContainText(`${code} · ${chosen.color}`);

    await search.fill("");
    await expect(grid.getByRole("button")).toHaveCount(count);
    await expect(card).toHaveAttribute("aria-pressed", "true");
    await expect(grid.locator('button[aria-pressed="true"]')).toHaveCount(1);
    await expect(select).toHaveValue(code);
  });
}

test("a failed real fabric photo leaves its card visible and selectable", async ({ page }) => {
  const fabric = rollerWorkbookFabrics.find((item) => Boolean(rollerWorkbookSwatchFilename(item)))!;
  const filename = rollerWorkbookSwatchFilename(fabric)!;
  let failedRequests = 0;
  await page.route("**/*", async (route) => {
    if (route.request().resourceType() === "image" &&
        decodeURIComponent(new URL(route.request().url()).pathname).endsWith(filename)) {
      failedRequests++;
      await route.abort("failed");
    } else {
      await route.fallback();
    }
  });
  await page.goto("/?family=roller");
  const grid = page.getByTestId("rw-swatches");
  const card = grid.getByRole("button").filter({ has: page.locator("strong", { hasText: fabric.code }) });
  await card.scrollIntoViewIfNeeded(); // Trigger lazy image loading on phone too.
  await expect(card).toHaveAttribute("data-image-state", "unavailable");
  expect(failedRequests).toBeGreaterThan(0);
  await expect(grid.getByRole("button")).toHaveCount(families.roller);
  await expect(card).toBeVisible();
  await expect(card).toContainText("Mynd ekki tiltæk");
  await expect(card.locator("img")).toHaveCount(0);
  await card.click();
  await expect(card).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByTestId("rw-fabric")).toHaveValue(fabric.code);
});

test("the same mounted swatch loads a replacement URL after the earlier URL fails", async ({ page }) => {
  let failedRequests = 0;
  let replacementRequests = 0;
  await page.route("**/fixture/*.png", async (route) => {
    if (route.request().url().endsWith("/failed.png")) {
      failedRequests++;
      await route.abort("failed");
    } else {
      replacementRequests++;
      await route.fulfill({
        contentType: "image/png",
        body: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a3ioAAAAASUVORK5CYII=", "base64"),
      });
    }
  });
  await page.goto("/?mode=replacement");
  const card = page.getByTestId("replacement-card").getByRole("button");
  await expect(card).toHaveAttribute("data-image-state", "unavailable");
  expect(failedRequests).toBe(1);
  await expect(card).toHaveAccessibleName("BROWSER-TEST · Litur samkvæmt efniskóða");
  await card.click();
  await expect(card).toHaveAttribute("aria-pressed", "true");

  // A handle plus retained selection ensures recovery is not a remount.
  const originalButton = await card.elementHandle();
  await page.getByRole("button", { name: "Load replacement image" }).click();
  await expect(card).toHaveAttribute("data-image-state", "available");
  const image = card.locator("img");
  await expect(image).toHaveAttribute("src", "/fixture/replacement.png");
  await expect.poll(() => image.evaluate((node: HTMLImageElement) => node.complete && node.naturalWidth > 0)).toBe(true);
  expect(replacementRequests).toBe(1);
  expect(await originalButton!.evaluate((node) => node === document.querySelector('[data-testid="replacement-card"] button'))).toBe(true);
  await expect(card).toHaveAttribute("aria-pressed", "true");
  await expect(card).not.toContainText("Mynd ekki tiltæk");
});
