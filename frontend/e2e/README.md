# End-to-end / UAT suite

Playwright tests covering the public site and the admin dashboard — copy,
design styling, page health (no JS errors), and admin functionality.

## Setup (once)

```bash
cd frontend
npm install
npx playwright install chromium
```

## Run against production

```bash
BASE_URL=https://debowoseni.com npx playwright test
```

That runs the public-site checks (`site.spec.js`) on desktop and mobile: every
page renders, carries its copy, applies the dark theme, and logs no JavaScript
errors. The three programme CTAs, the footer newsletter form, the unsubscribe
page and the admin route-guard are all asserted.

## Run the live admin UAT

The admin tests (`admin.spec.js`) sign in and check the dashboard metrics,
People, Newsletter, Automations and Emails screens. They only run when
credentials are supplied:

```bash
BASE_URL=https://debowoseni.com \
ADMIN_EMAIL=admin@debowoseni.com \
ADMIN_PASSWORD=... \
npx playwright test
```

Without those variables the admin tests skip, so the suite stays green in
environments that cannot reach a live backend.

## Report

An HTML report is written to `frontend/e2e-report/`. Open `index.html`, or:

```bash
npx playwright show-report e2e-report
```
