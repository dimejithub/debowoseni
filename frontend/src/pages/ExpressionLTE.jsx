import { Link } from "react-router-dom";
import {
  ArrowDown,
  ArrowUpRight,
  BookOpen,
  Check,
  Clock,
  Globe2,
  MapPin,
  MessageCircle,
  Monitor,
  Star,
  UserRound,
  Users,
} from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "@/components/site/Reveal";
import { MagneticButton } from "@/components/site/MagneticButton";
import { EnquiryQuiz } from "@/components/site/EnquiryQuiz";
import { LTE_PROGRAMMES_URL, SYSTEME_BOOKING_URL } from "@/lib/data";

/**
 * Life Transformation Enquiry™ — the first Expression.
 * Deliberately price-free: every CTA hands off to the LTE landing page,
 * where the full offer (and investment) is revealed.
 */

const TRUST_CHIPS = [
  { icon: BookOpen, label: "Free book with every programme" },
  { icon: UserRound, label: "Direct access to Dr. Debo'" },
  { icon: MessageCircle, label: "LTE community included" },
  { icon: Globe2, label: "UK & Nigeria welcome" },
];

const TIERS = [
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

const TESTIMONIALS = [
  {
    initial: "M",
    quote:
      "The coaching sessions have been truly valuable and insightful. They motivated me to pursue my goals with better clarity and confidence. Overall, the experience has been deeply enlightening and empowering — it helped me identify who I am and align my goals with actionable steps toward meaningful growth.",
  },
  {
    initial: "A",
    quote:
      "The RCPI framework makes reflection and planning less daunting and scattered. How did you come up with this framework — it's life saving!",
  },
  {
    initial: "T",
    quote:
      "I came into this coaching feeling scattered and unsure of my direction. The one-on-one, tailored approach made all the difference — I felt genuinely seen and guided. Full clarity, renewed purpose, and a stronger sense of direction. I'd rate it 100%.",
  },
];

const LTE_STATS = [
  ["600+", "Coached"],
  ["2,500+", "Learners"],
  ["20+", "Years"],
  ["50+", "Countries"],
];

export default function ExpressionLTE() {
  return (
    <div data-testid="lte-page">
      {/* HERO */}
      <section className="relative overflow-hidden" data-testid="lte-hero">
        <div className="lime-glow absolute inset-x-0 top-0 h-[55vh]" aria-hidden />
        <div className="container-page relative py-20 md:py-28">
          <div className="container-narrow">
            <Reveal>
              <p className="text-xs uppercase tracking-[0.28em] text-muted">
                An Expression of Debo&apos; Owoseni
              </p>
            </Reveal>
            <Reveal delay={0.08}>
              <h1 className="mx-auto mt-7 max-w-4xl">
                Life Transformation{" "}
                <span className="font-display-italic text-lime">Enquiry™</span>
              </h1>
            </Reveal>
            <Reveal delay={0.16}>
              <p className="mx-auto mt-7 max-w-2xl text-lg md:text-xl text-ink/85">
                Ready to go deeper? Three pathways — each designed for a different
                season and a different level of commitment.
              </p>
            </Reveal>
            <Reveal delay={0.24}>
              <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
                {TRUST_CHIPS.map(({ icon: Icon, label }) => (
                  <span key={label} className="chip inline-flex items-center gap-2">
                    <Icon className="h-3.5 w-3.5 text-lime" /> {label}
                  </span>
                ))}
              </div>
            </Reveal>
          </div>

          {/* PATHWAY INDEX */}
          <Stagger
            className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-5 md:grid-cols-3"
            staggerChildren={0.1}
          >
            {TIERS.map((t) => (
              <StaggerItem key={t.id}>
                <a
                  href={`#${t.id}`}
                  data-cursor="hover"
                  className="card-lift group flex h-full flex-col justify-between rounded-[20px] border border-line bg-surface p-7"
                  data-testid={`lte-index-${t.id}`}
                >
                  <div>
                    <p className="font-display text-sm text-lime">{t.n}</p>
                    <h3 className="mt-4 text-2xl leading-tight">{t.name}</h3>
                    <p className="mt-3 text-sm text-muted">{t.meta}</p>
                  </div>
                  <span className="mt-8 inline-flex h-10 w-10 items-center justify-center rounded-full border border-line text-ink transition group-hover:border-lime group-hover:text-lime">
                    <ArrowDown className="h-4 w-4 transition-transform duration-300 group-hover:translate-y-0.5" />
                  </span>
                </a>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* START THE ENQUIRY — pathway recommender */}
      <section className="border-t border-line bg-surface/30 py-20 md:py-24" data-testid="lte-quiz-section">
        <div className="container-page">
          <div className="container-narrow">
            <Reveal>
              <p className="text-xs uppercase tracking-[0.28em] text-muted">Start the Enquiry</p>
            </Reveal>
            <Reveal delay={0.08}>
              <h2 className="mt-5">
                Three questions.{" "}
                <span className="font-display-italic text-lime">The right pathway.</span>
              </h2>
            </Reveal>
          </div>
          <Reveal delay={0.16} className="mx-auto mt-10 max-w-3xl">
            <EnquiryQuiz mode="lte" />
          </Reveal>
        </div>
      </section>

      {/* TIER SECTIONS */}
      {TIERS.map((t, i) => (
        <section
          key={t.id}
          id={t.id}
          className={`scroll-mt-24 border-t border-line py-24 md:py-32 ${
            i % 2 === 1 ? "bg-surface/30" : ""
          }`}
          data-testid={`lte-${t.id}`}
        >
          <div className="container-page">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
              {/* Left — narrative */}
              <div className="lg:col-span-7">
                <Reveal>
                  <p className="flex items-center gap-3 text-xs uppercase tracking-[0.28em] text-muted">
                    <span className="font-display text-lime">{t.n}</span>
                    <span className="inline-block h-px w-8 bg-lime/60" />
                    {t.badge}
                  </p>
                </Reveal>
                <Reveal delay={0.06}>
                  <p className="mt-5 font-display text-sm uppercase tracking-[0.18em] text-ink/70">
                    {t.name}
                  </p>
                </Reveal>
                <Reveal delay={0.1}>
                  <h2 className="mt-4 max-w-2xl">
                    {t.headLead}{" "}
                    <span className="font-display-italic text-lime">{t.headItalic}</span>
                  </h2>
                </Reveal>
                <Reveal delay={0.16}>
                  <p className="mt-7 max-w-2xl text-lg font-semibold text-ink">{t.intro}</p>
                </Reveal>
                <Reveal delay={0.2}>
                  <p className="mt-4 max-w-2xl text-ink/85">{t.body}</p>
                </Reveal>

                <Reveal delay={0.24}>
                  <p className="mt-10 text-xs uppercase tracking-[0.28em] text-muted">
                    What you gain
                  </p>
                </Reveal>
                <Stagger className="mt-5 space-y-3" staggerChildren={0.05}>
                  {t.gains.map((g) => (
                    <StaggerItem key={g}>
                      <p className="flex items-start gap-3 text-ink/85">
                        <Check className="mt-1 h-4 w-4 shrink-0 text-lime" />
                        {g}
                      </p>
                    </StaggerItem>
                  ))}
                </Stagger>

                <Reveal delay={0.1}>
                  <p className="mt-10 max-w-xl font-display-italic text-xl text-ink">
                    {t.closing}
                  </p>
                </Reveal>
              </div>

              {/* Right — format card */}
              <div className="lg:col-span-5">
                <Reveal delay={0.12}>
                  <div className="card-lift sticky top-28 rounded-[24px] border border-line bg-surface p-8">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted">The format</p>
                    <ul className="mt-5 space-y-4">
                      {t.facts.map(({ icon: Icon, label }) => (
                        <li key={label} className="flex items-center gap-3 text-sm text-ink/85">
                          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line bg-bg">
                            <Icon className="h-4 w-4 text-lime" />
                          </span>
                          {label}
                        </li>
                      ))}
                    </ul>

                    <div className="mt-7 border-t border-line pt-6">
                      <p className="text-xs uppercase tracking-[0.2em] text-muted">Included</p>
                      <ul className="mt-4 space-y-2.5">
                        {t.included.map((inc) => (
                          <li key={inc} className="flex items-start gap-2.5 text-sm text-ink/80">
                            <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-lime/80" />
                            {inc}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <MagneticButton
                      as="a"
                      href={`${LTE_PROGRAMMES_URL}#${t.id}`}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="btn-lime mt-8 w-full justify-center"
                      data-testid={`lte-${t.id}-cta`}
                    >
                      {t.cta} <ArrowUpRight className="h-4 w-4" />
                    </MagneticButton>
                    <p className="mt-4 text-center text-xs text-muted">
                      Dates, details &amp; booking on the LTE programmes page.
                    </p>
                  </div>
                </Reveal>
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* TESTIMONIALS */}
      <section className="border-t border-line py-24 md:py-32" data-testid="lte-testimonials">
        <div className="container-page">
          <div className="container-narrow">
            <Reveal>
              <p className="text-xs uppercase tracking-[0.28em] text-muted">
                What people are saying
              </p>
            </Reveal>
            <Reveal delay={0.08}>
              <h2 className="mt-5">
                Real results. <span className="font-display-italic text-lime">Real people.</span>
              </h2>
            </Reveal>
          </div>

          <Stagger className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3" staggerChildren={0.1}>
            {TESTIMONIALS.map((tm) => (
              <StaggerItem key={tm.initial}>
                <figure className="card-lift flex h-full flex-col rounded-[20px] border border-line bg-surface p-8">
                  <div className="flex gap-1" aria-hidden>
                    {Array.from({ length: 5 }).map((_, s) => (
                      <Star key={s} className="h-4 w-4 fill-lime text-lime" />
                    ))}
                  </div>
                  <blockquote className="mt-5 flex-1 text-ink/85">“{tm.quote}”</blockquote>
                  <figcaption className="mt-7 flex items-center gap-3 border-t border-line pt-5">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-lime font-display text-sm font-semibold text-bg">
                      {tm.initial}
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-ink">Coaching Client</span>
                      <span className="block text-xs text-muted">1-to-1 Coaching Programme</span>
                    </span>
                  </figcaption>
                </figure>
              </StaggerItem>
            ))}
          </Stagger>

          {/* Stats band */}
          <Stagger
            className="mx-auto mt-16 grid max-w-3xl grid-cols-2 gap-6 md:grid-cols-4"
            staggerChildren={0.08}
          >
            {LTE_STATS.map(([value, label]) => (
              <StaggerItem key={label}>
                <div className="text-center">
                  <p className="font-display text-4xl tracking-tight text-lime">{value}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.2em] text-muted">{label}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* MASTERCLASS — low-commitment entry */}
      <section className="border-t border-line bg-surface/30 py-20" data-testid="lte-masterclass">
        <div className="container-narrow">
          <Reveal>
            <p className="text-xs uppercase tracking-[0.28em] text-muted">
              Not sure yet? Start here.
            </p>
          </Reveal>
          <Reveal delay={0.08}>
            <h3 className="mt-5 max-w-2xl mx-auto">
              Experience the full LTE framework —{" "}
              <span className="font-display-italic text-lime">free</span> — before committing
              to a programme.
            </h3>
          </Reveal>
          <Reveal delay={0.16}>
            <div className="mt-8 flex justify-center">
              <a
                href={SYSTEME_BOOKING_URL}
                target="_blank"
                rel="noreferrer noopener"
                className="btn-ghost"
                data-testid="lte-masterclass-cta"
              >
                Reserve a free masterclass seat <ArrowUpRight className="h-4 w-4" />
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative overflow-hidden border-t border-line py-24 md:py-32" data-testid="lte-final-cta">
        <div className="lime-glow-soft absolute inset-x-0 bottom-0 h-[40vh]" aria-hidden />
        <div className="container-narrow relative">
          <Reveal>
            <p className="text-xs uppercase tracking-[0.28em] text-muted">Choose your pathway</p>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="mt-6">
              The fog does not lift by waiting.{" "}
              <span className="font-display-italic text-lime">It lifts by moving.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.18}>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <MagneticButton
                as="a"
                href={LTE_PROGRAMMES_URL}
                target="_blank"
                rel="noreferrer noopener"
                className="btn-lime"
                data-testid="lte-view-programmes"
              >
                View the programmes <ArrowUpRight className="h-4 w-4" />
              </MagneticButton>
              <Link to="/contact" className="btn-ghost" data-testid="lte-ask-question">
                Ask a question first
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
