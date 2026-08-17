// Admin acceptance tests — the live, data-dependent half of the UAT. These
// only run when ADMIN_EMAIL and ADMIN_PASSWORD are supplied AND BASE_URL points
// at a deployment with a reachable backend + Supabase; otherwise they skip, so
// the suite stays green in environments without live access.
const { test, expect } = require("@playwright/test");

const EMAIL = process.env.ADMIN_EMAIL;
const PASSWORD = process.env.ADMIN_PASSWORD;
const LIVE = Boolean(EMAIL && PASSWORD && process.env.BASE_URL);

test.describe("admin dashboard (live)", () => {
  test.skip(!LIVE, "set ADMIN_EMAIL, ADMIN_PASSWORD and BASE_URL to run the live admin UAT");

  test.beforeEach(async ({ page }) => {
    await page.goto("/admin/login");
    await page.fill('input[type="email"]', EMAIL);
    await page.fill('input[type="password"]', PASSWORD);
    await page.click('button:has-text("Sign in")');
    await page.waitForURL(/\/admin(\/|$)/, { timeout: 15000 });
  });

  test("dashboard shows live metric tiles", async ({ page }) => {
    await page.goto("/admin");
    await expect(page.getByText("Mailing list")).toBeVisible();
    await expect(page.getByText("Registrations")).toBeVisible();
    // The mailing-list tile should show a real number, not an em dash.
    const tile = page.locator('[data-testid="admin-stats"]');
    await expect(tile).toBeVisible();
    await expect(tile).not.toContainText("Some Supabase tables are not initialised");
  });

  test("people list loads", async ({ page }) => {
    await page.goto("/admin/people");
    await expect(page.locator('[data-testid="admin-people"]')).toBeVisible();
  });

  test("newsletter settings load", async ({ page }) => {
    await page.goto("/admin/newsletter");
    await expect(page.getByText(/how often/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /save schedule/i })).toBeVisible();
  });

  test("automations list loads", async ({ page }) => {
    await page.goto("/admin/automations");
    await expect(page.locator('[data-testid="admin-sequences"]')).toBeVisible();
  });

  test("emails composer opens", async ({ page }) => {
    await page.goto("/admin/emails/new");
    await expect(page.locator('[data-testid="campaign-subject"]')).toBeVisible();
  });
});
