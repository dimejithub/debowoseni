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
import { LTE_PROGRAMMES_URL, EVENTS_URL } from "@/lib/data";
import { TIERS } from "@/lib/programmes";

/**
 * Life Transformation Enquiry™ — the first Expression.
 * Deliberately price-free: every CTA hands off to /programmes, where the full
 * offer (and investment) is revealed. Tier copy is shared from lib/programmes.
 */

const TRUST_CHIPS = [
  { icon: BookOpen, label: "Free book with every programme" },
  { icon: UserRound, label: "Direct access to Dr. Debo'" },
  { icon: MessageCircle, label: "LTE community included" },
  { icon: Globe2, label: "UK & Nigeria welcome" },
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
      <section className="lime-corner-glow border-t border-line bg-surface/30 py-20 md:py-24" data-testid="lte-quiz-section">
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
                      as={Link}
                      to={`${LTE_PROGRAMMES_URL}#${t.id}`}
                      className="btn-lime mt-8 w-full justify-center"
                      data-testid={`lte-${t.id}-cta`}
                    >
                      {t.cta} <ArrowUpRight className="h-4 w-4" />
                    </MagneticButton>
                    <p className="mt-4 text-center text-xs text-muted">
                      Dates, details &amp; booking on the programmes page.
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
          <Reveal delay={0.12}>
            <p className="mx-auto mt-5 max-w-xl text-sm text-muted">
              The last LTE Live masterclass was held on 7 March 2026 at Phoenix Cinema,
              Leicester — new dates are announced on the LTE page.
            </p>
          </Reveal>
          <Reveal delay={0.16}>
            <div className="mt-8 flex justify-center">
              <Link
                to={EVENTS_URL}
                className="btn-ghost"
                data-testid="lte-masterclass-cta"
              >
                Reserve a free masterclass seat <ArrowUpRight className="h-4 w-4" />
              </Link>
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
                as={Link}
                to={LTE_PROGRAMMES_URL}
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
