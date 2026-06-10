import { Link } from "react-router-dom";
import { ArrowUpRight, Check, Clock, GraduationCap, Layers, UserRound } from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "@/components/site/Reveal";
import { MagneticButton } from "@/components/site/MagneticButton";
import { EnquiryQuiz } from "@/components/site/EnquiryQuiz";

/**
 * Academic Research Insight™ — Expression for researchers & postgraduate students.
 * Custom-priced engagements: no pricing shown, CTAs route to the contact form.
 */

const FOCUS = [
  "Research methodology guidance",
  "Thesis & dissertation structure and flow",
  "Academic writing clarity",
  "Managing academic pressures",
  "Publication strategy support",
];

const FACTS = [
  { icon: Clock, label: "Flexible sessions — shaped around your research stage" },
  { icon: Layers, label: "Custom engagement · no fixed menu" },
  { icon: UserRound, label: "Private, 1-to-1 with Dr. Debo'" },
];

const CRED = [
  ["Springer Macmillan", "Published author"],
  ["UK & Europe", "AI & digital transformation researcher"],
  ["20+ years", "Across academia & practice"],
];

export default function ExpressionAcademic() {
  return (
    <div data-testid="academic-page">
      {/* HERO */}
      <section className="relative overflow-hidden" data-testid="academic-hero">
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
                Academic Research{" "}
                <span className="font-display-italic text-lime">Insight™</span>
              </h1>
            </Reveal>
            <Reveal delay={0.16}>
              <p className="mx-auto mt-7 max-w-2xl text-lg md:text-xl text-ink/85">
                Specialised coaching for academics navigating research projects, thesis
                writing, and the intellectual journey of advanced scholarship.
              </p>
            </Reveal>
            <Reveal delay={0.24}>
              <div className="mt-9 flex justify-center">
                <span className="chip inline-flex items-center gap-2">
                  <GraduationCap className="h-3.5 w-3.5 text-lime" />
                  For researchers &amp; postgraduate students
                </span>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* THE WORK */}
      <section className="border-t border-line py-24 md:py-32" data-testid="academic-work">
        <div className="container-page">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-7">
              <Reveal>
                <p className="text-xs uppercase tracking-[0.28em] text-muted">The work</p>
              </Reveal>
              <Reveal delay={0.08}>
                <h2 className="mt-5 max-w-2xl">
                  Research is lonely.{" "}
                  <span className="font-display-italic text-lime">Insight changes that.</span>
                </h2>
              </Reveal>
              <Reveal delay={0.14}>
                <p className="mt-7 max-w-2xl text-lg font-semibold text-ink">
                  For the researcher carrying a project that matters — and the weight that
                  comes with it.
                </p>
              </Reveal>
              <Reveal delay={0.18}>
                <p className="mt-4 max-w-2xl text-ink/85">
                  From methodology to final submission, this is structured, experienced
                  support for the whole intellectual journey — the thinking, the writing,
                  and the pressures in between.
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
                  Scholarship is a long obedience. You do not have to walk it alone.
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
                      Every engagement is scoped after a short conversation — your stage,
                      your timeline, your discipline.
                    </p>
                  </div>
                  <MagneticButton
                    as={Link}
                    to="/contact"
                    className="btn-lime mt-8 w-full justify-center"
                    data-testid="academic-cta"
                  >
                    Get academic support <ArrowUpRight className="h-4 w-4" />
                  </MagneticButton>
                  <p className="mt-4 text-center text-xs text-muted">
                    Tell us where you are — replies within 48 hours.
                  </p>
                </div>
              </Reveal>
            </div>
          </div>

          {/* Credibility band */}
          <Stagger
            className="mx-auto mt-20 grid max-w-3xl grid-cols-1 gap-6 sm:grid-cols-3"
            staggerChildren={0.08}
          >
            {CRED.map(([value, label]) => (
              <StaggerItem key={value}>
                <div className="text-center">
                  <p className="font-display text-2xl tracking-tight text-lime">{value}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted">{label}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* START THE ENQUIRY */}
      <section className="border-t border-line bg-surface/30 py-20 md:py-24" data-testid="academic-quiz-section">
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
            <EnquiryQuiz mode="global" currentKey="academic" />
          </Reveal>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative overflow-hidden border-t border-line py-24 md:py-32" data-testid="academic-final-cta">
        <div className="lime-glow-soft absolute inset-x-0 bottom-0 h-[40vh]" aria-hidden />
        <div className="container-narrow relative">
          <Reveal>
            <h2>
              Bring structure to your{" "}
              <span className="font-display-italic text-lime">scholarship.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.12}>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <MagneticButton
                as={Link}
                to="/contact"
                className="btn-lime"
                data-testid="academic-contact-cta"
              >
                Get academic support <ArrowUpRight className="h-4 w-4" />
              </MagneticButton>
              <Link to="/publications" className="btn-ghost" data-testid="academic-publications-link">
                Read the research
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
