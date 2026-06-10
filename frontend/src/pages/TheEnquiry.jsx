import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "@/components/site/Reveal";
import { EnquiryQuiz } from "@/components/site/EnquiryQuiz";

/**
 * The Enquiry — the doorway Expression. A guided 3-question recommender
 * that points visitors to the Expression that fits their season.
 */

const EXPRESSIONS = [
  {
    n: "01",
    title: "Life Transformation Enquiry™",
    blurb: "Recalibrate your roles, work and purpose into one coherent direction.",
    audience: "For the capable & driven — living in compartments",
    to: "/expressions/life-transformation-enquiry",
  },
  {
    n: "02",
    title: "Academic Research Insight™",
    blurb: "Methodology, structure, writing and publication strategy — for the whole intellectual journey.",
    audience: "For researchers & postgraduate students",
    to: "/expressions/academic-research-insight",
  },
  {
    n: "03",
    title: "Marriage 101: Back2Basics",
    blurb: "Relationships rooted in purpose, clarity and shared vision — Scripture-guided and practical.",
    audience: "For couples & singles of marriageable age",
    to: "/expressions/marriage-101",
  },
];

export default function TheEnquiry() {
  return (
    <div data-testid="enquiry-page">
      {/* HERO + QUIZ */}
      <section className="relative overflow-hidden" data-testid="enquiry-hero">
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
                The <span className="font-display-italic text-lime">Enquiry</span>
              </h1>
            </Reveal>
            <Reveal delay={0.16}>
              <p className="mx-auto mt-7 max-w-2xl text-lg md:text-xl text-ink/85">
                Not sure where to begin? Three questions. One honest recommendation — the
                Expression that fits your season.
              </p>
            </Reveal>
          </div>

          <Reveal delay={0.26} className="mx-auto mt-14 max-w-3xl">
            <EnquiryQuiz mode="global" />
          </Reveal>
        </div>
      </section>

      {/* ALL EXPRESSIONS */}
      <section className="lime-corner-glow border-t border-line py-24 md:py-32" data-testid="enquiry-expressions">
        <div className="container-page">
          <div className="container-narrow">
            <Reveal>
              <p className="text-xs uppercase tracking-[0.28em] text-muted">
                Or browse them all
              </p>
            </Reveal>
            <Reveal delay={0.08}>
              <h2 className="mt-5">
                The <span className="font-display-italic text-lime">Expressions</span>.
              </h2>
            </Reveal>
          </div>

          <Stagger
            className="mx-auto mt-14 grid max-w-5xl grid-cols-1 gap-5 md:grid-cols-3"
            staggerChildren={0.1}
          >
            {EXPRESSIONS.map((e) => (
              <StaggerItem key={e.n}>
                <Link
                  to={e.to}
                  data-cursor="hover"
                  className="card-lift group flex h-full flex-col justify-between rounded-[20px] border border-line bg-surface p-7"
                  data-testid={`enquiry-expression-${e.n}`}
                >
                  <div>
                    <p className="font-display text-sm text-lime">{e.n}</p>
                    <h3 className="mt-4 text-2xl leading-tight group-hover:text-lime">
                      {e.title}
                    </h3>
                    <p className="mt-3 text-sm text-muted">{e.audience}</p>
                    <p className="mt-4 text-ink/85">{e.blurb}</p>
                  </div>
                  <span className="mt-8 inline-flex h-10 w-10 items-center justify-center rounded-full border border-line text-ink transition group-hover:border-lime group-hover:text-lime">
                    <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>

          <Reveal delay={0.1} className="mt-14 flex justify-center">
            <Link to="/contact" className="btn-ghost" data-testid="enquiry-contact-link">
              Still unsure? Send a note <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
