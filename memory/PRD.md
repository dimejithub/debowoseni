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
- **Premium book carousel** (`BookCarousel.jsx`): replaced the previous featured-card + 3-col grid on `/books` with a single cinematic 3D-coverflow carousel showing **all books**. Features: large centered active card (cover + editorial copy + "Get the book" CTA + position indicator), side peek covers tilted ±6° at reduced opacity for depth, lime dot pagination, magnetic prev/next arrow buttons, drag/swipe-to-navigate (mobile + desktop), autoplay every 6.5s with pause-on-hover/focus, keyboard arrow-key navigation, framer-motion slide-and-fade transitions. The featured book (`is_featured`) opens first by default. Lint clean, screenshot-verified across multiple frames.
- **Taking Your Day — real covers (2 SKUs)**: jar/sunset cover + new companion "365-Day Transformation Journal" with open-book cover.
- **New publication**: Owoseni A (2023). *Metaphorical Meaning of Digital Transformation.* Digital Transformation and Society 2(1), 78–96.
- **Publications sorted newest-first** (uniform `sort_order` → auto-sorts by year desc via existing API ordering).
- **Fixed Stagger animation bug on Publications page** (StaggerItem stuck at opacity 0 after API replaced fallback) — swapped to per-row `Reveal` with staggered delays.
- **Real book covers** for all 4 supplied (`How God Gives Feedback`, `Your Marriage In a Mirror`, `Ìmọ̀lẹ̀`, `Ìjìnlẹ̀`).
- **BookCard snake_case fix**: now reads `cover_url`/`one_liner`/`buy_url`/`is_featured`.
- **Hero Ken-Burns motion backdrop**, **global email swap to hello@debowoseni.com**, **oversized `debowoseni.` footer wordmark**, **Philosophical Anchor section on About** (six axioms grid).

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

## Session update — 10 June 2026 (Expressions phase)
- NEW PAGE: `/expressions/life-transformation-enquiry` (`frontend/src/pages/ExpressionLTE.jsx`) — premium dark LTE page built from lte.debowoseni.com/programmes. Three pathway tiers (1-to-1 Coaching, In-Person Bootcamp, Online Bootcamp) with "What you gain", sticky format/included cards, testimonials, stats band, free-masterclass block, final CTA. **No pricing or bank details by design** — CTAs hand off to `LTE_PROGRAMMES_URL` (https://lte.debowoseni.com/programmes) for upsell.
- Navbar Expressions dropdown + mobile menu now support internal `to` routes; LTE item routes internally. Other 3 Expressions (Academic Research Insight™, Marriage 101: Back2Basics, The Enquiry) still `#` placeholders awaiting content.
- All "Book Appointment" CTAs (navbar desktop/mobile, footer, About, home marquee band) now go to internal `/contact` (was Systeme.io).
- Home hero "Explore Programmes" + Books page CTA + Contact "Programmes" card now route to the internal LTE page.
- Home Books-section line now reads "Coaching & programmes live inside the Expressions — start with Life Transformation Enquiry™."
- All flows verified via Playwright (dropdown nav, CTA routing, no pricing leakage).
- PENDING from user (msg 332): "remove this text on the site" — screenshot showed the Expressions list; user answered "Something else — please specify" without details. AWAITING CLARIFICATION.

### Upcoming
- Build remaining 3 Expressions pages when user supplies content (P1).
- Wire newsletter/final CTAs to Systeme.io API/embed (P2).

## Session update — 10 June 2026 (Expressions phase 2: full suite + Enquiry quiz)
- NEW: `components/site/EnquiryQuiz.jsx` — reusable 3-question recommender, modes: `lte` (recommends LTE tier, anchors to #tier-N + external programmes link) and `global` (recommends an Expression; `currentKey` prop makes a matching result CTA say "You're in the right place" → /contact).
- NEW PAGES: `/expressions/academic-research-insight` (ExpressionAcademic.jsx — from user screenshot content: methodology, thesis structure, writing clarity, pressures, publication strategy; CTAs → /contact, no pricing), `/expressions/marriage-101` (ExpressionMarriage.jsx — pre-marital prep, enrichment, communication, shared vision, faith-based frameworks; book tie-in card to "Your Marriage In a Mirror" → /books; CTAs → /contact), `/expressions/the-enquiry` (TheEnquiry.jsx — quiz-first page + 3 expression cards).
- LTE page now has "Start the Enquiry" quiz section (lte mode) between hero and tier sections; Academic & Marriage pages embed the global quiz.
- Navbar Expressions dropdown: all 4 items now internal routes. Mobile menu background made solid (testing agent design nit).
- Testing: testing agent iteration_3 — 48/48 frontend checks passed (quiz logic all branches, routing, regression, no pricing leakage, no console errors).

### Remaining
- "Remove this text" clarification from user still pending (msg 332).
- Newsletter/final CTAs → Systeme.io wiring (P2).

## Session update — 10 June 2026 (text removals + quiz email gate)
- REMOVED (user screenshots): the "Coaching & programmes live inside the Expressions…" line under the Home books section, and "Hover to pause" captions on Home events marquee + Events page galleries.
- EnquiryQuiz now has an EMAIL GATE: after Q3, visitor must enter email ("Where should we send it?") before the recommendation is revealed. Email posts to `/api/newsletter` → Supabase `subscribers` (verified 200). Capture is best-effort — API failure never blocks the result. data-testids: quiz-email-gate, quiz-email-input, quiz-email-submit.
- Systeme takeover of the subscriber list is still pending (export Supabase `subscribers` or wire Systeme API later — P2).

## Session update — 10 June 2026 (event consistency + caption removal)
- LTE Live event now consistent everywhere: **7 March 2026 · Phoenix Cinema, Leicester, UK**. Updated: Supabase `events` row (slug renamed lte-london-workshop → lte-live-leicester, was "LTE Live · London / 2025-11-15"), `data.js` FALLBACK_EVENTS, `seed_content.py` EVENT, Home events-marquee caption, LTE page masterclass note ("last held on 7 March 2026 at Phoenix Cinema, Leicester").
- Removed the "N images" caption under event galleries on the Events page (user screenshot).
- Verified via Playwright: Events page shows correct title/date/venue from Supabase, no London/no caption remnants.
