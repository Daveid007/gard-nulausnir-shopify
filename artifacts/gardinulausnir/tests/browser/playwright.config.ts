import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "@playwright/test";

const directory = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  testDir: ".",
  testMatch: "*.spec.ts",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: "list",
  outputDir: "../../../../generated-artifacts/roller-browser",
  use: {
    baseURL: "http://127.0.0.1:4179",
    browserName: "chromium",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    launchOptions: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
      ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH }
      : {},
  },
  projects: [
    { name: "desktop", use: { viewport: { width: 1440, height: 1000 } } },
    {
      name: "phone",
      use: {
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
        deviceScaleFactor: 2,
      },
    },
  ],
  webServer: {
    command: "pnpm exec vite --config tests/browser/vite.config.ts",
    cwd: path.resolve(directory, "../.."),
    url: "http://127.0.0.1:4179",
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
