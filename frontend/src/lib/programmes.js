import { Clock, MapPin, Monitor, UserRound, Users } from "lucide-react";

/**
 * The three LTE pathways.
 *
 * This used to live inside ExpressionLTE.jsx while pricing and checkout sat on
 * the Systeme.io landing page. Both now render from here, so the narrative page
 * and the programmes/checkout page can never drift apart.
 */
export const TIERS = [
  {
    id: "tier-1",
    n: "01",
    badge: "Most Personal · Highest Depth",
    name: "1 to 1 Coaching",
    meta: "3 sessions · Online · Flexible dates",
    headLead: "You do not need more information.",
    headItalic: "You need one coherent direction.",
    intro: "For the high-capacity individual who is capable, driven — and living in compartments.",
    body: "A focused three-session coaching experience delivered over 14 days. This is the space where the fragmented parts of your life come back into one coherent, purposeful direction. Not advice. Not content. A structured recalibration — built entirely around you.",
    gains: [
      "Relief from the weight of a scattered interior life",
      "Structural understanding across your roles, work and purpose",
      "A personalised Life-Map that gives you a defined path forward",
      "Confidence that your income and calling are authentically connected",
      "A practical, sustainable action plan for your next chapter",
      "Complimentary copy of Taking Your Day — 365 Insights on Walking Transformation Daily",
      "Access to the LTE community and ongoing personal check-ins",
    ],
    facts: [
      { icon: Clock, label: "Three sessions · 90 minutes each" },
      { icon: Monitor, label: "Online · delivered over 14 days" },
      { icon: UserRound, label: "Private, 1-to-1 with Dr. Debo'" },
    ],
    included: [
      "3 × 90-min coaching sessions",
      "Personalised Life-Map Diagram",
      "Action plan for your next chapter",
      "Taking Your Day (book)",
      "LTE community access",
      "Ongoing personal check-ins",
    ],
    closing: "This is not just coaching. This is recalibration with a plan.",
    cta: "Book my session",
  },
  {
    id: "tier-2",
    n: "02",
    badge: "In Person · Leicester · Small Group",
    name: "Bootcamp — In-Person Intensive",
    meta: "1 day · 6 hours · Leicester, UK",
    headLead: "One day. One room.",
    headItalic: "The moment things click.",
    intro: "For the person who is done circling — and ready to move in one focused day.",
    body: "Six focused, structured hours that compress the full LTE process into a single day. From foggy to resolved. From scattered to anchored. With a small room of people doing the same work alongside you.",
    gains: [
      "A clear line of sight where things have felt foggy",
      "The courage to name and address what has been left unsettled",
      "A defined connection between your purpose, roles and income",
      "Your completed Life-Map Diagram",
      "A 30 to 90 day action blueprint for your next chapter",
      "Complimentary copy of Taking Your Day — 365 Insights on Walking Transformation Daily",
      "LTE community WhatsApp group and ongoing check-ins from Dr. Debo'",
    ],
    facts: [
      { icon: MapPin, label: "In person · Leicester, UK" },
      { icon: Users, label: "Limited to 10 — guaranteed personal attention" },
      { icon: Clock, label: "Full-day immersive · 6 hours" },
    ],
    included: [
      "Full-day immersive (6 hours)",
      "Completed Life-Map Diagram",
      "30–90 day action blueprint",
      "Taking Your Day (book)",
      "LTE WhatsApp community",
      "Ongoing check-ins from Dr. Debo'",
    ],
    closing: "You will not just think differently. You will see your life differently.",
    cta: "Reserve my place",
  },
  {
    id: "tier-3",
    n: "03",
    badge: "Online · Zoom · Wherever You Are",
    name: "Bootcamp — Online Intensive",
    meta: "1 day · 6 hours · Live on Zoom",
    headLead: "Wherever you are.",
    headItalic: "One day. Everything shifts.",
    intro: "The same powerful LTE Bootcamp — delivered live online via Zoom. No travel required.",
    body: "Six hours of focused, structured recalibration without leaving your space. Built for those who are done circling and ready to move with settled purpose. The full LTE process, delivered live.",
    gains: [
      "A clear line of sight where things have felt foggy",
      "The courage to name and address what has been left unsettled",
      "A defined connection between your purpose, roles and income",
      "Your completed Life-Map Diagram",
      "A 30 to 90 day action blueprint for your next chapter",
      "Complimentary copy of Taking Your Day — 365 Insights on Walking Transformation Daily",
      "LTE community WhatsApp group and ongoing check-ins from Dr. Debo'",
    ],
    facts: [
      { icon: Monitor, label: "Online · live on Zoom · full day" },
      { icon: Users, label: "Limited places per cohort" },
      { icon: Clock, label: "6 focused, structured hours" },
    ],
    included: [
      "Full-day live Zoom (6 hours)",
      "Completed Life-Map Diagram",
      "30–90 day action blueprint",
      "Taking Your Day (book)",
      "LTE WhatsApp community",
      "Ongoing check-ins from Dr. Debo'",
    ],
    closing: "The Bootcamp gives you the shift. The book sustains it.",
    cta: "Secure my spot",
  },
];

/**
 * Commerce layer — the part Systeme.io used to own.
 *
 * Prices mirror what was live on the Systeme funnel (EUR: €178 in-person,
 * €119 online). Checkout is a Stripe Payment Link per tier — no secret keys in
 * this codebase, no webhook to babysit, and a price can be changed in the
 * Stripe dashboard without a redeploy.
 *
 * Every value is environment-overridable so nothing here needs a code change:
 *
 *   REACT_APP_PRICE_CURRENCY      (default EUR, matching the Systeme funnel)
 *   REACT_APP_STRIPE_TIER_2_URL   REACT_APP_TIER_2_PRICE
 *   REACT_APP_STRIPE_TIER_3_URL   REACT_APP_TIER_3_PRICE
 *   REACT_APP_CALENDLY_URL        (1-to-1 discovery call)
 *   REACT_APP_WHATSAPP_URL
 *
 * ctaType decides how a tier converts:
 *   "checkout" — straight to Stripe
 *   "booking"  — book a call first (1-to-1 is scoped on the call, not upfront)
 *   "enquiry"  — fall back to the contact form, used when no URL is configured
 */
export const CALENDLY_URL =
  process.env.REACT_APP_CALENDLY_URL || "https://calendly.com/debowoseni-events/30min";

export const WHATSAPP_URL =
  process.env.REACT_APP_WHATSAPP_URL || "https://wa.me/447534496595";

export const PRICING = {
  currency: process.env.REACT_APP_PRICE_CURRENCY || "EUR",
  tiers: {
    "tier-1": {
      price: process.env.REACT_APP_TIER_1_PRICE || "",
      checkoutUrl: process.env.REACT_APP_STRIPE_TIER_1_URL || "",
      bookingUrl: CALENDLY_URL,
      note: "Free 30-minute call first — we scope the three sessions together.",
    },
    "tier-2": {
      price: process.env.REACT_APP_TIER_2_PRICE || "178",
      checkoutUrl: process.env.REACT_APP_STRIPE_TIER_2_URL || "",
    },
    "tier-3": {
      price: process.env.REACT_APP_TIER_3_PRICE || "119",
      checkoutUrl: process.env.REACT_APP_STRIPE_TIER_3_URL || "",
    },
  },
};

const CURRENCY_SYMBOLS = { GBP: "£", USD: "$", EUR: "€", NGN: "₦" };

export function tierPricing(tierId) {
  const conf = PRICING.tiers[tierId] || {};
  const symbol = CURRENCY_SYMBOLS[PRICING.currency] || `${PRICING.currency} `;

  let ctaType = "enquiry";
  if (conf.checkoutUrl) ctaType = "checkout";
  else if (conf.bookingUrl) ctaType = "booking";

  return {
    ...conf,
    ctaType,
    label: conf.price ? `${symbol}${conf.price}` : "",
    url: conf.checkoutUrl || conf.bookingUrl || "",
  };
}
