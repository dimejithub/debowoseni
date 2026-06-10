// Static fallback content + brand constants.
// Once the admin adds rows to Supabase (testimonials, books, publications, events),
// the public pages prefer the DB data. These constants are the gentle fallback.

export const PORTRAIT_URL =
  "https://customer-assets.emergentagent.com/job_debo-platform/artifacts/lo5vcm24_do%20hero%201.png";

export const ABOUT_HERO_URL =
  "https://customer-assets.emergentagent.com/job_debo-platform/artifacts/lo5vcm24_do%20hero%201.png";

// Three real event photos (LTE Leicester workshop)
export const EVENT_IMAGES = [
  "https://customer-assets.emergentagent.com/job_debo-platform/artifacts/auoge5e1__D5A3033.jpg",
  "https://customer-assets.emergentagent.com/job_debo-platform/artifacts/t2iwgjek__D5A3030.jpg",
  "https://customer-assets.emergentagent.com/job_debo-platform/artifacts/7b2phnc9__D5A3048.jpg",
];

export const FALLBACK_POST_COVER =
  "https://images.pexels.com/photos/7505924/pexels-photo-7505924.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=1200";

// Fallback books (used until admin populates the books table)
export const FALLBACK_BOOKS = [
  {
    id: "your-marriage-in-a-mirror",
    slug: "your-marriage-in-a-mirror",
    title: "Your Marriage In a Mirror",
    one_liner:
      "A Scripture-guided tool to examine, renew, and strengthen relationships.",
    description:
      "A workbook for couples and those preparing for covenant — practical reflections that help you see the relationship you actually have, not the one you've been performing. Designed for slow, honest reading.",
    cover_url:
      "https://images.unsplash.com/photo-1638376776402-9a4b75fe21bb?crop=entropy&cs=srgb&fm=jpg&w=900&q=85",
    buy_url:
      "https://www.amazon.co.uk/Your-Marriage-Mirror-Adebowale-Owoseni-ebook/dp/B0F4F64VNZ",
    is_featured: false,
  },
  {
    id: "imole",
    slug: "imole",
    title: "Ìmọ̀lẹ̀",
    one_liner:
      "Spoken-word poetry on identity, purpose, and the journey toward wholeness.",
    description:
      "A collection of spoken-word reflections written for the vulnerable parts of transformation — for the seasons where the old self is no longer accurate and the new self is still being formed.",
    cover_url:
      "https://images.unsplash.com/photo-1567095751004-aa51a2690368?crop=entropy&cs=srgb&fm=jpg&w=900&q=85",
    buy_url:
      "https://www.amazon.co.uk/%C3%8Cm%C3%B3l%E1%BA%B9%CC%80-reflections-journeys-vulnerable-transformation/dp/B0FQCQ6JRL",
    is_featured: false,
  },
  {
    id: "ijinle",
    slug: "ijinle",
    title: "Ìjìnlẹ̀",
    one_liner:
      "Reflections on navigating life's crossroads with wisdom, faith, and direction.",
    description:
      "A short book of inspiring reflections to encourage purpose-driven decisions at the moments that matter most — for the crossroads where the easy answer is the wrong one.",
    cover_url:
      "https://images.unsplash.com/photo-1710438399422-2fca27686bcd?crop=entropy&cs=srgb&fm=jpg&w=900&q=85",
    buy_url:
      "https://www.amazon.co.uk/Ijinl%E1%BA%B9%CC%80-collection-inspiring-reflections-encourage/dp/B0FF3LV3XF",
    is_featured: false,
  },
  {
    id: "how-god-gives-feedback",
    slug: "how-god-gives-feedback",
    title: "How God Gives Feedback",
    one_liner:
      "A devotional with journaling for those seeking to hear God and lead with grace.",
    description:
      "A guided devotional that pairs Scripture with structured journaling prompts — built for the leader, the parent, the founder who wants to hear, not just hustle.",
    cover_url:
      "https://images.pexels.com/photos/2425232/pexels-photo-2425232.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=900",
    buy_url: "https://www.amazon.co.uk/dp/B0H4276KFB",
    is_featured: true,
  },
  {
    id: "taking-your-day",
    slug: "taking-your-day",
    title: "Taking Your Day",
    one_liner:
      "A 365-day devotional for the purpose-driven, one steady morning at a time.",
    description:
      "[Blurb TBC] A year-long companion of short, sharp readings — written to be read first thing, before the day decides what you'll be.",
    cover_url:
      "https://images.unsplash.com/photo-1532153975070-2e9ab71f1b14?crop=entropy&cs=srgb&fm=jpg&w=900&q=85",
    buy_url: null,
    is_featured: false,
  },
];

export const FALLBACK_PUBLICATIONS = [
  { title: "Generative AI in Higher Education", year: "2024", url: "https://scholar.google.com/citations?user=la2x65UAAAAJ&hl=en" },
  { title: "Generative AI in Research", year: "2026", url: "https://scholar.google.com/citations?user=la2x65UAAAAJ&hl=en" },
  { title: "Artificial Intelligence in the Informal Economy", year: "2026", url: "https://scholar.google.com/citations?user=la2x65UAAAAJ&hl=en" },
  { title: "Effectuated Spirituality", year: "2025", url: "https://scholar.google.com/citations?user=la2x65UAAAAJ&hl=en" },
  { title: "Employment 5.0", year: "2022", url: "https://scholar.google.com/citations?user=la2x65UAAAAJ&hl=en" },
];

export const SCHOLAR_URL =
  "https://scholar.google.com/citations?user=la2x65UAAAAJ&hl=en";

export const STATS = [
  { label: "Clients & Partners", value: 250, suffix: "K+" },
  { label: "Countries reached via the LTE framework", value: 98, suffix: "+" },
  { label: "Years of transformation work", value: 23, suffix: "+" },
];

export const VALUE_CHIPS = [
  "Faith-Rooted",
  "Practically Delivered",
  "Transformation-Focused",
  "Globally Reaching",
  "Purpose-Driven",
  "Results That Last",
];

// Brand-resonant fallback testimonials (replace once real ones are on file)
export const FALLBACK_TESTIMONIALS = [
  {
    id: 1,
    quote:
      "I came in with goals and Debo' helped me find the assignment underneath them. Six months on, the work I do is finally mine.",
    attribution: "Tobi A.",
    role: "Programme Director · London",
  },
  {
    id: 2,
    quote:
      "He does not teach you to hustle harder. He teaches you to listen better — to yourself, to your people, and to God.",
    attribution: "Funmi O.",
    role: "Founder · Lagos",
  },
  {
    id: 3,
    quote:
      "The LTE framework gave language to what I had been quietly carrying for a decade. After that, the next step was obvious.",
    attribution: "David K.",
    role: "Senior Lecturer · Manchester",
  },
];

// Fallback events (used until admin populates `events` table)
export const FALLBACK_EVENTS = [
  {
    id: "lte-leicester-workshop",
    slug: "lte-london-workshop",
    title: "LTE Live · Leicester",
    description:
      "A live cohort of the Life Transformation Experience — purpose-driven professionals walking through the Wheel of Life and the LTE map together.",
    cover_url:
      "https://customer-assets.emergentagent.com/job_debo-platform/artifacts/auoge5e1__D5A3033.jpg",
    gallery: [
      "https://customer-assets.emergentagent.com/job_debo-platform/artifacts/auoge5e1__D5A3033.jpg",
      "https://customer-assets.emergentagent.com/job_debo-platform/artifacts/t2iwgjek__D5A3030.jpg",
      "https://customer-assets.emergentagent.com/job_debo-platform/artifacts/7b2phnc9__D5A3048.jpg",
    ],
    location: "Leicester, UK",
  },
];

export const BRAND_LOGOS = [
  "https://upload.wikimedia.org/wikipedia/en/thumb/9/95/University_of_Oxford.svg/240px-University_of_Oxford.svg.png",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/University_of_Cambridge_coat_of_arms.svg/240px-University_of_Cambridge_coat_of_arms.svg.png",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Harvard_University_seal.svg/240px-Harvard_University_seal.svg.png",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Stanford_seal_%282012%29.svg/240px-Stanford_seal_%282012%29.svg.png",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/MIT_logo.svg/240px-MIT_logo.svg.png",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/INSEAD_logo.svg/240px-INSEAD_logo.svg.png",
];

export const SOCIALS = {
  twitter: "https://x.com/",
  instagram: "https://instagram.com/",
  linkedin: "https://linkedin.com/in/",
  facebook: "https://facebook.com/",
};

// Brand logo (the "db" mark) — lime on transparent/black.
export const LOGO = {
  primary:
    "https://customer-assets.emergentagent.com/job_debo-platform/artifacts/r4hr3nhb_2.svg",
  // White-on-black variant for use on cream/light surfaces.
  light:
    "https://customer-assets.emergentagent.com/job_debo-platform/artifacts/70utsxwx_4.svg",
};

export const SYSTEME_BOOKING_URL =
  process.env.REACT_APP_SYSTEME_BOOKING_URL || "https://lte.debowoseni.com/";

export const CONTACT_EMAIL =
  process.env.REACT_APP_CONTACT_EMAIL || "hello@debowoseni.com";

// Debo's six philosophical anchors — surfaced on the About page.
export const PHILOSOPHICAL_ANCHORS = [
  {
    n: "01",
    title: "Loving is leading",
    body: "If you cannot love, you cannot truly lead.",
  },
  {
    n: "02",
    title: "All actions are seeds",
    body: "Plant wisely.",
  },
  {
    n: "03",
    title: "Time tells",
    body: "If you give it time.",
  },
  {
    n: "04",
    title: "Lead without titles",
    body: "The best leaders often lead without titles.",
  },
  {
    n: "05",
    title: "One life. One purpose.",
    body: "Expressed through several assignments and multiple platforms.",
  },
  {
    n: "06",
    title: "People are led, not used",
    body: "People should be led, not merely managed, and never used.",
  },
];

export const VIDEO_URL = process.env.REACT_APP_VIDEO_URL || "";

export const YOUTUBE_CHANNEL_URL =
  "https://www.youtube.com/@adebowaleowoseni";

export const SEED_POSTS = [
  {
    slug: "are-you-in-there",
    title: "Are You In There?",
    category: "Transformation",
    excerpt:
      "The only question is whether you have let them reach you personally.",
    cover_url:
      "https://images.unsplash.com/photo-1557264322-b44d383a2906?crop=entropy&cs=srgb&fm=jpg&w=1200&q=85",
    author_name: "Debo Owoseni",
    published_at: "2026-04-09T08:00:00Z",
    placeholder: true,
  },
];
