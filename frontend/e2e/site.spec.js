// Public-site acceptance tests: every page renders, carries its copy, applies
// the dark brand theme, and throws no JavaScript errors. Data-dependent pages
// fall back to sample content when the backend is unreachable, so these pass
// even without a live API — but against production they exercise the real thing.
const { test, expect } = require("@playwright/test");

// Backend/Supabase network errors are expected when running without a live API
// and must not fail a page. Genuine JS exceptions still do.
const EXPECTED_NET = /Failed to fetch|NetworkError|ERR_|supabase|AxiosError|Network Error|net::|Load failed/i;

const PAGES = [
  { path: "/", copy: ["Debo"] },
  { path: "/about", copy: ["About"] },
  { path: "/books", copy: [] },
  { path: "/publications", copy: [] },
  { path: "/events", copy: ["Events"] },
  { path: "/articles", copy: [] },
  { path: "/contact", copy: ["Contact"] },
  { path: "/programmes", copy: ["pathway", "Life Transformation"] },
  { path: "/community", copy: ["community"] },
  { path: "/expressions/life-transformation-enquiry", copy: ["coherent", "direction"] },
  { path: "/expressions/academic-research-insight", copy: [] },
  { path: "/expressions/marriage-101", copy: [] },
  { path: "/expressions/the-enquiry", copy: [] },
];

function trackErrors(page) {
  const jsErrors = [];
  page.on("pageerror", (e) => jsErrors.push(String(e)));
  page.on("console", (m) => {
    if (m.type() === "error" && !EXPECTED_NET.test(m.text())) jsErrors.push(m.text());
  });
  return jsErrors;
}

for (const P of PAGES) {
  test(`renders ${P.path}`, async ({ page }) => {
    const jsErrors = trackErrors(page);
    await page.goto(P.path, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(800);

    // Dark brand ground is applied.
    const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    expect(bg).toBe("rgb(8, 13, 13)");

    // Real content rendered, not a blank shell.
    const text = await page.evaluate(() => document.body.innerText);
    expect(text.length).toBeGreaterThan(150);
    for (const phrase of P.copy) {
      expect(text.toLowerCase()).toContain(phrase.toLowerCase());
    }

    expect(jsErrors, `JS errors on ${P.path}`).toEqual([]);
  });
}

test("footer newsletter form is present", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator('input[type="email"]').first()).toBeVisible();
});

test("programmes shows all three pathway CTAs", async ({ page }) => {
  await page.goto("/programmes");
  const body = await page.locator("body").innerText();
  expect(body).toMatch(/Book a free call/i);
  expect(body).toMatch(/Reserve my place/i);
  expect(body).toMatch(/Secure my spot/i);
});

test("unsubscribe page handles a missing token gracefully", async ({ page }) => {
  await page.goto("/unsubscribe");
  await expect(page.locator("body")).toContainText(/unsubscribe/i);
});

test("admin routes are guarded (redirect to login when signed out)", async ({ page }) => {
  await page.goto("/admin");
  await expect(page.locator("body")).toContainText(/sign in/i);
  await expect(page.locator('input[type="password"]')).toBeVisible();
});
