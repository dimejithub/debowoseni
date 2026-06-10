import { Link } from "react-router-dom";
import { ArrowUpRight, Check, HeartHandshake, ShieldCheck, UserRound } from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "@/components/site/Reveal";
import { MagneticButton } from "@/components/site/MagneticButton";
import { EnquiryQuiz } from "@/components/site/EnquiryQuiz";

/**
 * Marriage 101: Back2Basics — Expression for couples & singles of marriageable age.
 * Custom-priced engagements: no pricing shown, CTAs route to the contact form.
 */

const MIRROR_COVER =
  "https://customer-assets.emergentagent.com/job_debo-platform/artifacts/vryclmhk_your%20marriage%20in%20a%20mirror.jpg";

const FOCUS = [
  "Pre-marital preparation & alignment",
  "Marriage enrichment & purpose alignment",
  "Communication & conflict resolution",
  "Building shared vision & mission",
  "Faith-based relationship frameworks",
];

const FACTS = [
  { icon: HeartHandshake, label: "Customised engagement — couples & singles" },
  { icon: ShieldCheck, label: "Private, confidential & faith-rooted" },
  { icon: UserRound, label: "Guided personally by Dr. Debo'" },
];

export default function ExpressionMarriage() {
  return (
    <div data-testid="marriage-page">
      {/* HERO */}
      <section className="relative overflow-hidden" data-testid="marriage-hero">
        <div className="lime-glow absolute inset-x-0 top-0 h-[50vh]" aria-hidden />
        <div className="container-page relative py-20 md:py-28">
          <div className="container-narrow">
            <Reveal>
              <p className="text-xs uppercase tracking-[0.28em] text-muted">
                An Expression of Debo&apos; Owoseni
              </p>
            </Reveal>
            <Reveal delay={0.08}>
              <h1 className="mx-auto mt-7 max-w-4xl">
                Marriage 101:{" "}
                <span className="font-display-italic text-lime">Back2Basics</span>
              </h1>
            </Reveal>
            <Reveal delay={0.16}>
              <p className="mx-auto mt-7 max-w-2xl text-lg md:text-xl text-ink/85">
                Premium coaching for married couples seeking deeper alignment — and singles
                preparing for marriage. Relationships rooted in purpose, clarity, and
                shared vision.
              </p>
            </Reveal>
            <Reveal delay={0.24}>
              <div className="mt-9 flex justify-center">
                <span className="chip inline-flex items-center gap-2">
                  <HeartHandshake className="h-3.5 w-3.5 text-lime" />
                  For couples &amp; singles of marriageable age
                </span>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* THE WORK */}
      <section className="border-t border-line py-24 md:py-32" data-testid="marriage-work">
        <div className="container-page">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-7">
              <Reveal>
                <p className="text-xs uppercase tracking-[0.28em] text-muted">The work</p>
              </Reveal>
              <Reveal delay={0.08}>
                <h2 className="mt-5 max-w-2xl">
                  Strong covenants are{" "}
                  <span className="font-display-italic text-lime">built — not wished.</span>
                </h2>
              </Reveal>
              <Reveal delay={0.14}>
                <p className="mt-7 max-w-2xl text-lg font-semibold text-ink">
                  For couples seeking deeper alignment — and singles preparing well.
                </p>
              </Reveal>
              <Reveal delay={0.18}>
                <p className="mt-4 max-w-2xl text-ink/85">
                  Back2Basics strips away the noise and returns to first principles —
                  purpose, communication, and shared vision — through a Scripture-guided,
                  deeply practical approach.
                </p>
              </Reveal>

              <Reveal delay={0.22}>
                <p className="mt-10 text-xs uppercase tracking-[0.28em] text-muted">
                  Where we focus
                </p>
              </Reveal>
              <Stagger className="mt-5 space-y-3" staggerChildren={0.05}>
                {FOCUS.map((f) => (
                  <StaggerItem key={f}>
                    <p className="flex items-start gap-3 text-ink/85">
                      <Check className="mt-1 h-4 w-4 shrink-0 text-lime" />
                      {f}
                    </p>
                  </StaggerItem>
                ))}
              </Stagger>

              <Reveal delay={0.1}>
                <p className="mt-10 max-w-xl font-display-italic text-xl text-ink">
                  Whether you are preparing or repairing — the basics still build the
                  strongest homes.
                </p>
              </Reveal>
            </div>

            <div className="lg:col-span-5">
              <Reveal delay={0.12}>
                <div className="card-lift sticky top-28 rounded-[24px] border border-line bg-surface p-8">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted">The format</p>
                  <ul className="mt-5 space-y-4">
                    {FACTS.map(({ icon: Icon, label }) => (
                      <li key={label} className="flex items-center gap-3 text-sm text-ink/85">
                        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line bg-bg">
                          <Icon className="h-4 w-4 text-lime" />
                        </span>
                        {label}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-7 border-t border-line pt-6">
                    <p className="text-sm text-ink/80">
                      Every engagement is customised — your season, your story, your pace.
                      It starts with a short conversation.
                    </p>
                  </div>
                  <MagneticButton
                    as={Link}
                    to="/contact"
                    className="btn-lime mt-8 w-full justify-center"
                    data-testid="marriage-cta"
                  >
                    Begin your journey <ArrowUpRight className="h-4 w-4" />
                  </MagneticButton>
                  <p className="mt-4 text-center text-xs text-muted">
                    Private &amp; confidential — replies within 48 hours.
                  </p>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* BOOK TIE-IN */}
      <section className="border-t border-line bg-surface/30 py-20" data-testid="marriage-book-band">
        <div className="container-page">
          <Reveal>
            <Link
              to="/books"
              data-cursor="hover"
              className="card-lift mx-auto flex max-w-3xl flex-col items-center gap-8 rounded-[24px] border border-line bg-surface p-8 sm:flex-row sm:p-10"
              data-testid="marriage-book-link"
            >
              <img
                src={MIRROR_COVER}
                alt="Your Marriage In a Mirror — book cover"
                className="w-32 shrink-0 rounded-lg shadow-[0_18px_40px_-18px_rgba(0,0,0,0.7)]"
                loading="lazy"
              />
              <span className="text-center sm:text-left">
                <span className="block text-xs uppercase tracking-[0.24em] text-muted">
                  The book behind the work
                </span>
                <span className="mt-3 block font-display text-2xl tracking-tight text-ink">
                  Your Marriage In a Mirror
                </span>
                <span className="mt-3 block text-ink/85">
                  This Expression extends the Scripture-guided approach behind the book — a
                  tool to examine, renew, and strengthen relationships.
                </span>
                <span className="lime-link mt-4 inline-flex items-center gap-1 text-sm font-semibold">
                  Explore the book <ArrowUpRight className="h-3.5 w-3.5" />
                </span>
              </span>
            </Link>
          </Reveal>
        </div>
      </section>

      {/* START THE ENQUIRY */}
      <section className="lime-corner-glow border-t border-line py-20 md:py-24" data-testid="marriage-quiz-section">
        <div className="container-page">
          <div className="container-narrow">
            <Reveal>
              <p className="text-xs uppercase tracking-[0.28em] text-muted">Start the Enquiry</p>
            </Reveal>
            <Reveal delay={0.08}>
              <h2 className="mt-5">
                Not sure this is your starting point?{" "}
                <span className="font-display-italic text-lime">Three questions.</span>
              </h2>
            </Reveal>
          </div>
          <Reveal delay={0.16} className="mx-auto mt-10 max-w-3xl">
            <EnquiryQuiz mode="global" currentKey="marriage" />
          </Reveal>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative overflow-hidden border-t border-line py-24 md:py-32" data-testid="marriage-final-cta">
        <div className="lime-glow-soft absolute inset-x-0 bottom-0 h-[40vh]" aria-hidden />
        <div className="container-narrow relative">
          <Reveal>
            <h2>
              Build a covenant with{" "}
              <span className="font-display-italic text-lime">clarity and vision.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.12}>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <MagneticButton
                as={Link}
                to="/contact"
                className="btn-lime"
                data-testid="marriage-contact-cta"
              >
                Begin your journey <ArrowUpRight className="h-4 w-4" />
              </MagneticButton>
              <Link to="/books" className="btn-ghost" data-testid="marriage-books-link">
                Read Your Marriage In a Mirror
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
