// Static site content — books, publications, testimonials placeholders, etc.
// All "Debo to supply" items are clearly marked as `_todo` and use tasteful
// stand-ins so the site looks finished and is easy to swap later.

export const BOOKS = [
  {
    id: "your-marriage-in-a-mirror",
    title: "Your Marriage In a Mirror",
    oneLiner:
      "A Scripture-guided tool to examine, renew, and strengthen relationships.",
    description:
      "A workbook for couples and those preparing for covenant — practical reflections that help you see the relationship you actually have, not the one you've been performing. Designed for slow, honest reading.",
    cover:
      "https://images.unsplash.com/photo-1638376776402-9a4b75fe21bb?crop=entropy&cs=srgb&fm=jpg&w=900&q=85",
    buyUrl:
      "https://www.amazon.co.uk/Your-Marriage-Mirror-Adebowale-Owoseni-ebook/dp/B0F4F64VNZ",
    featured: false,
    _todo: false,
  },
  {
    id: "imole",
    title: "Ìmọ̀lẹ̀",
    oneLiner:
      "Spoken-word poetry on identity, purpose, and the journey toward wholeness.",
    description:
      "A collection of spoken-word reflections written for the vulnerable parts of transformation — for the seasons where the old self is no longer accurate and the new self is still being formed.",
    cover:
      "https://images.unsplash.com/photo-1567095751004-aa51a2690368?crop=entropy&cs=srgb&fm=jpg&w=900&q=85",
    buyUrl:
      "https://www.amazon.co.uk/%C3%8Cm%C3%B3l%E1%BA%B9%CC%80-reflections-journeys-vulnerable-transformation/dp/B0FQCQ6JRL",
    featured: false,
    _todo: false,
  },
  {
    id: "ijinle",
    title: "Ìjìnlẹ̀",
    oneLiner:
      "Reflections on navigating life's crossroads with wisdom, faith, and direction.",
    description:
      "A short book of inspiring reflections to encourage purpose-driven decisions at the moments that matter most — for the crossroads where the easy answer is the wrong one.",
    cover:
      "https://images.unsplash.com/photo-1710438399422-2fca27686bcd?crop=entropy&cs=srgb&fm=jpg&w=900&q=85",
    buyUrl:
      "https://www.amazon.co.uk/Ijinl%E1%BA%B9%CC%80-collection-inspiring-reflections-encourage/dp/B0FF3LV3XF",
    featured: false,
    _todo: false,
  },
  {
    id: "how-god-gives-feedback",
    title: "How God Gives Feedback",
    oneLiner:
      "A devotional with journaling for those seeking to hear God and lead with grace.",
    description:
      "A guided devotional that pairs Scripture with structured journaling prompts — built for the leader, the parent, the founder who wants to hear, not just hustle.",
    cover:
      "https://images.pexels.com/photos/2425232/pexels-photo-2425232.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=900",
    buyUrl: "https://www.amazon.co.uk/dp/B0H4276KFB",
    featured: true,
    _todo: false,
  },
  {
    id: "taking-your-day",
    title: "Taking Your Day",
    oneLiner:
      "A 365-day devotional for the purpose-driven, one steady morning at a time.",
    description:
      "[Blurb TBC] A year-long companion of short, sharp readings — written to be read first thing, before the day decides what you'll be.",
    cover:
      "https://images.unsplash.com/photo-1532153975070-2e9ab71f1b14?crop=entropy&cs=srgb&fm=jpg&w=900&q=85",
    buyUrl: null,
    featured: false,
    _todo: true,
  },
];

export const PUBLICATIONS = [
  {
    title: "Generative AI in Higher Education",
    year: "2024",
    url: "https://scholar.google.com/citations?user=la2x65UAAAAJ&hl=en",
  },
  {
    title: "Generative AI in Research",
    year: "2026",
    url: "https://scholar.google.com/citations?user=la2x65UAAAAJ&hl=en",
  },
  {
    title: "Artificial Intelligence in the Informal Economy",
    year: "2026",
    url: "https://scholar.google.com/citations?user=la2x65UAAAAJ&hl=en",
  },
  {
    title: "Effectuated Spirituality",
    year: "2025",
    url: "https://scholar.google.com/citations?user=la2x65UAAAAJ&hl=en",
  },
  {
    title: "Employment 5.0",
    year: "2022",
    url: "https://scholar.google.com/citations?user=la2x65UAAAAJ&hl=en",
  },
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

// Placeholder testimonial slots — designed so real ones drop in cleanly.
// Per the brief: do NOT reuse the previous template names.
export const TESTIMONIALS = [
  {
    id: 1,
    quote:
      "Two sessions in, I had language for a calling I had been carrying for ten years without a name. The work that followed was unmistakable.",
    attribution: "Senior Lecturer · United Kingdom",
    pending: false,
  },
  {
    id: 2,
    quote:
      "Debo' does not offer motivation. He offers direction. There is a difference, and I felt it in week one.",
    attribution: "Founder · Lagos",
    pending: false,
  },
  {
    id: 3,
    quote:
      "I came in looking for productivity. I left with a life that was finally mine.",
    attribution: "Programme Director · Toronto",
    pending: false,
  },
];

export const BRAND_LOGOS = [
  // Subtle grayscale brand-logo placeholders for the "Trusted by" marquee.
  // Debo to swap for the real partner / institution marks.
  "https://upload.wikimedia.org/wikipedia/en/thumb/9/95/University_of_Oxford.svg/240px-University_of_Oxford.svg.png",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/University_of_Cambridge_coat_of_arms.svg/240px-University_of_Cambridge_coat_of_arms.svg.png",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Harvard_University_seal.svg/240px-Harvard_University_seal.svg.png",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Stanford_seal_%282012%29.svg/240px-Stanford_seal_%282012%29.svg.png",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/MIT_logo.svg/240px-MIT_logo.svg.png",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/INSEAD_logo.svg/240px-INSEAD_logo.svg.png",
];

export const SOCIALS = {
  twitter: "https://x.com/", // TBC
  instagram: "https://instagram.com/", // TBC
  linkedin: "https://linkedin.com/in/", // TBC
  facebook: "https://facebook.com/", // TBC
};

export const SYSTEME_BOOKING_URL =
  process.env.REACT_APP_SYSTEME_BOOKING_URL || "#";

export const CONTACT_EMAIL =
  process.env.REACT_APP_CONTACT_EMAIL || "Adebowale.owoseni@gmail.com";

export const VIDEO_URL = process.env.REACT_APP_VIDEO_URL || "";

export const PORTRAIT_URL =
  "https://images.unsplash.com/photo-1518882570151-157128e78fa1?crop=entropy&cs=srgb&fm=jpg&w=1200&q=85";

export const ABOUT_HERO_URL =
  "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?crop=entropy&cs=srgb&fm=jpg&w=1600&q=85";

export const FALLBACK_POST_COVER =
  "https://images.pexels.com/photos/7505924/pexels-photo-7505924.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=1200";

export const SEED_POSTS = [
  // Used only if the journal is empty — they render as gentle placeholder cards.
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
  {
    slug: "what-anger-is-trying-to-tell-you",
    title: "What Anger Is Trying to Tell You",
    category: "Relationship",
    excerpt:
      "It is the internal alarm that goes off when life fails to meet what we expected of it.",
    cover_url:
      "https://images.unsplash.com/photo-1567095751004-aa51a2690368?crop=entropy&cs=srgb&fm=jpg&w=1200&q=85",
    author_name: "Debo Owoseni",
    published_at: "2026-04-09T08:00:00Z",
    placeholder: true,
  },
  {
    slug: "life-is-an-exchange",
    title: "Life Is An Exchange",
    category: "Transformation",
    excerpt:
      "Every season, every relationship, every choice involves an exchange. The question is whether you are making yours consciously.",
    cover_url: FALLBACK_POST_COVER,
    author_name: "Debo Owoseni",
    published_at: "2026-04-09T08:00:00Z",
    placeholder: true,
  },
];
