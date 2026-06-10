# debowoseni.com — PRD

## Original problem statement
A world-class personal platform for Debo' Owoseni — Transformation Coach · Academic · Author. Build a credibility-led showcase + a living journal + a books storefront. NOT a checkout for programmes (those live on Systeme.io). The website drives people to those funnels and to the books.

## Architecture
- **Frontend**: React + Tailwind + Framer Motion + Tiptap (rich-text). Routes: `/`, `/about`, `/books`, `/publications`, `/journal`, `/journal/:slug`, `/contact`, `/admin/login`, `/admin`, `/admin/new`, `/admin/edit/:id`. Dark palette `--bg #080d0d`, lime accent `#bcea3e`, Italianno script flourishes. Inter + Italianno fonts. Custom grain overlay, lime radial glows.
- **Backend**: FastAPI on 0.0.0.0:8001 under supervisor. All routes prefixed `/api`. Acts as a thin admin/forms layer in front of Supabase: public reads, contact + newsletter submissions, admin CRUD on posts, image upload to Supabase Storage (`blog-images` bucket), JWT verification for admin endpoints. Service-role key only on server, anon key on client.
- **Supabase**: tables `posts`, `contact_messages`, `subscribers` + storage bucket `blog-images`, with RLS policies. Schema in `/app/backend/supabase_schema.sql`. Admin Auth user seeded on backend startup.

## User personas
- **Debo' (admin)** — publishes journal posts, manages cover images, monitors contact form + newsletter signups. Single-user CMS.
- **Public visitors** — browse the storefront-style books page, read the journal, click out to Amazon/KDP for books and to Systeme.io for programmes/booking, send a contact note.

## Core requirements (static)
- Hero mission line: "A mission to catalyse transformation in one million lives by 2035…" with "one million lives" highlighted in lime.
- Books showcase replaces pricing on Home (centrepiece swap).
- Publications strip links every paper to Google Scholar.
- Journal is Supabase-powered. Drafts hidden publicly. Auth-gated CMS at /admin.
- No use of the word "clarity" anywhere (deliberately off-brand).
- Voice: direct, declarative; no corporate filler.
- Lime accent used with restraint.
- Desktop-first responsive at ≥1280, ≥992, 768–991, ≤767, ≤478.

## What's been implemented (2026-02 — current session continuation)
- **Taking Your Day — real covers (2 SKUs)**: The original "Taking Your Day" book now uses the supplied jar-with-sunset cover ("A Year of Taking What Is Already Yours"). Added a NEW companion product, "Taking Your Day — 365-Day Transformation Journal", with the supplied open-book cover. Both in `data.js` fallbacks and `seed_content.py`, then re-seeded.
- **New publication added**: Owoseni A (2023). *What is Digital Transformation? Investigating the Metaphorical Meaning of Digital Transformation and Why It Matters.* Digital Transformation and Society, Vol. 2 No. 1, pp. 78–96. Linked to the Emerald URL.
- **Publications sorted by year (descending)**: All 6 publications now share the same `sort_order` so they auto-sort newest first via the existing API `.order("sort_order").order("year", desc=True)`. Updated both `data.js` FALLBACK_PUBLICATIONS and `seed_content.py`. Publications seeder now does delete-then-insert (since the schema has no unique constraint on title) so the canonical list in `seed_content.py` stays the source of truth.
- **Fixed Stagger animation bug on Publications page**: The `Stagger`/`StaggerItem` pattern in framer-motion (with `viewport.once: true`) was leaving items stuck at opacity 0 after the API replaced the fallback data — items never re-animated to opacity 1. Replaced with per-row `Reveal` wrappers using staggered delays, which animate reliably on first scroll. The page now renders all 6 publication rows correctly.
- **Real book covers**: swapped in the four supplied covers (`How God Gives Feedback`, `Your Marriage In a Mirror`, `Ìmọ̀lẹ̀`, `Ìjìnlẹ̀`) in both `lib/data.js` (FALLBACK_BOOKS) and `backend/seed_content.py`, then re-ran the seeder (idempotent upsert on `slug`).
- **Fixed pre-existing BookCard field-name bug**: `BookCard.jsx` was reading `book.cover` / `book.oneLiner` / `book.buyUrl` / `book.featured`, but data + Supabase use snake_case. Updated the component to read the canonical fields. Covers, FEATURED badge, and "Get the book" buy buttons now render properly across Home + Books.
- **Hero section revamped** (`Home.jsx`): replaced static portrait with a cinematic Ken-Burns crossfade backdrop built from the LTE Leicester event images; framed by a dark glassmorphism panel; floating stat-card moved inside the glass panel.
- **Global email swap**: `Adebowale.owoseni@gmail.com` → `hello@debowoseni.com` everywhere.
- **Footer wordmark**: oversized `debowoseni.` display type stretching the full width of the footer.
- **Philosophical Anchor section on About page**: renders the six axioms supplied by Debo as a 3-column glass-card grid.
- Added `PHILOSOPHICAL_ANCHORS` constant in `data.js`.

## What's been implemented (2026-12-09)
- Full design system: dark palette, lime accent, Inter + Italianno fonts, fluid type with `clamp()`, lime radial glows, grain overlay, marquee animations.
- Home page: hero with mission headline + Explore Programmes + Watch Debo' (modal), portrait + floating 250+ stat card, trusted-by logo marquee, About teaser, Publications strip (5 papers), **Books showcase replacing pricing** with featured "How God Gives Feedback" + 4 others, Impact stats with animated count-ups (250K+ / 98+ / 23+), value chips, testimonials (placeholder copy designed for real quotes), From-the-Journal pulling latest 3 from Supabase, lime "LET'S GET STARTED" marquee CTA band, footer newsletter form.
- About, Books, Publications, Contact pages.
- Journal list + post pages with category filters, rich-text rendering, sanitized HTML via dompurify.
- Admin: Supabase Auth sign-in, dashboard (list, publish/unpublish/edit/delete), Tiptap editor (bold/italic/h2/h3/quote/lists/link/image/undo/redo), cover upload, inline image upload, auto-slug, draft/publish.
- Backend FastAPI: /api/health, /api/posts (list + by slug), /api/contact, /api/newsletter, /api/admin/* CRUD + /api/admin/upload (Supabase Storage). Admin user seeded on startup.
- Sanitized rich-text rendering with isomorphic-dompurify.
- 21/21 backend pytest cases passing. Frontend 100% functional.

## Prioritized backlog (P0/P1/P2 remaining)

### P0 (blocks "definitive" feel)
- **Debo to supply real assets**: high-res portrait, real book covers (currently royalty-free stand-ins), real testimonials (only attributed when permission on file), real partner logos for the trusted-by marquee, "Watch Debo'" video URL, social handles.
- **Systeme.io URLs**: replace placeholder `REACT_APP_SYSTEME_BOOKING_URL` (currently https://systeme.io) with the real booking funnel URL.

### P1 (lift to Awwwards-tier)
- Custom cursor on interactive media.
- Split-text reveal on hero headline.
- View Transitions API for cross-page navigations on supported browsers.
- Per-post OG image generation + JSON-LD Article schema.
- Sitemap + robots.txt at build time.
- Newsletter → Systeme.io list (currently captured to Supabase `subscribers`).

### P2 (nice-to-have)
- RSS feed for the journal.
- Search across published posts.
- Reading-progress bar on post pages.
- Lighthouse budget config + CI check.
- Image format pipeline (AVIF/WebP) via a build step.

## Next action items for Debo / next session
1. Replace placeholder Systeme.io URL in `frontend/.env` (`REACT_APP_SYSTEME_BOOKING_URL`).
2. Supply video URL (`REACT_APP_VIDEO_URL`) for "Watch Debo'" modal.
3. Supply social handles in `frontend/src/lib/data.js` (`SOCIALS`) — currently bare profile-root URLs.
4. Upload real portrait and book covers (drop into `frontend/src/lib/data.js` constants or upload via /admin and reference).
5. Add real testimonials with attributions to `frontend/src/lib/data.js`.
