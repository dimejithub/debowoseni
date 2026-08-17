// Playwright config for the debowoseni.com end-to-end suite.
//
// Runs against a base URL you provide, so the same tests cover the local dev
// server, a Cloudflare preview, or production:
//
//   BASE_URL=https://debowoseni.com npx playwright test
//
// The admin tests need credentials and only run when they are supplied:
//   ADMIN_EMAIL=... ADMIN_PASSWORD=... BASE_URL=https://debowoseni.com npx playwright test
//
// The pre-installed browser lives at PLAYWRIGHT_BROWSERS_PATH; on a normal
// machine `npx playwright install chromium` fetches it once.
const { defineConfig, devices } = require("@playwright/test");

module.exports = defineConfig({
  testDir: "./e2e",
  timeout: 45_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"], ["html", { open: "never", outputFolder: "e2e-report" }]],
  use: {
    baseURL: process.env.BASE_URL || "http://127.0.0.1:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 900 } } },
    { name: "mobile", use: { ...devices["iPhone 13"] } },
  ],
});
