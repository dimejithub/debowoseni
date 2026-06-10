import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "@/components/site/Reveal";
import { JourneyTimeline } from "@/components/site/JourneyTimeline";
import {
  ABOUT_HERO_URL,
  PHILOSOPHICAL_ANCHORS,
  PORTRAIT_URL,
  VALUE_CHIPS,
} from "@/lib/data";
import { MagneticButton } from "@/components/site/MagneticButton";

export default function About() {
  return (
    <div data-testid="about-page">
      {/* HERO — centered */}
      <section className="relative overflow-hidden">
        <div className="lime-glow absolute inset-x-0 top-0 h-[45vh]" aria-hidden />
        <div className="container-page relative py-20 md:py-28">
          <div className="container-narrow">
            <Reveal>
              <p className="text-xs uppercase tracking-[0.28em] text-muted">
                Transformation Coach · Academic · Author
              </p>
            </Reveal>
            <Reveal delay={0.08}>
              <h1 className="mx-auto mt-7 max-w-4xl">
                The place where enquiry becomes{" "}
                <span className="font-display-italic text-lime">direction</span>.
              </h1>
            </Reveal>
            <Reveal delay={0.16}>
              <p className="mx-auto mt-7 max-w-2xl text-lg md:text-xl text-ink/85">
                A deeper look into the convictions, research, and lived experience that shape
                everything I do.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* PORTRAIT — featured centred */}
      <section className="container-page pb-12">
        <Reveal className="mx-auto max-w-2xl overflow-hidden rounded-[24px] border border-line">
          <img
            src={PORTRAIT_URL}
            alt="Debo' Owoseni portrait"
            className="aspect-[4/5] w-full object-cover"
            loading="eager"
          />
        </Reveal>
      </section>

      {/* BIO — cream section, centered prose */}
      <section className="cream-section py-24 md:py-28" data-testid="about-bio">
        <div className="container-prose text-center">
          <Reveal>
            <h2 className="mt-2">
              At the intersection of <span className="font-display-italic text-lime">faith</span>, knowledge,
              and service.
            </h2>
          </Reveal>
          <Reveal delay={0.06}>
            <p className="mt-7 text-lg md:text-xl">
              Debo&apos; Owoseni has spent over two decades helping people move from scattered to
              purposeful. As a life-transformation coach, academic, and published author, he works at
              the intersection of intellectual rigour and spiritual depth — and refuses to put either down.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-6 text-lg md:text-xl">
              For 18+ years, Debo&apos; has supported purpose-driven professionals navigating the
              transitions of calling, work, relationships, and identity across changing seasons. In the
              classroom and the research space, he examines how people and institutions adapt within
              complex digital environments — with a particular focus on the ethical and human
              implications of emerging technologies, including AI.
            </p>
          </Reveal>
          <Reveal delay={0.15}>
            <blockquote className="mt-12 font-script text-5xl leading-tight md:text-6xl">
              I am here for the people who are tired of motivation and ready for direction.
            </blockquote>
          </Reveal>
        </div>
      </section>

      {/* THE JOURNEY — scroll-drawn timeline */}
      <JourneyTimeline />

      {/* PHILOSOPHICAL ANCHORS — Debo's six convictions */}
      <section
        className="relative border-t border-line bg-bg py-24 md:py-32"
        data-testid="philosophical-anchors"
      >
        <div className="lime-glow-soft pointer-events-none absolute inset-0" aria-hidden />
        <div className="container-page relative">
          <div className="container-narrow">
            <Reveal>
              <p className="text-xs uppercase tracking-[0.28em] text-muted">
                The Philosophical Anchor
              </p>
            </Reveal>
            <Reveal delay={0.08}>
              <h2 className="mt-5">
                Six convictions that{" "}
                <span className="font-display-italic text-lime">hold the work</span> together.
              </h2>
            </Reveal>
            <Reveal delay={0.16}>
              <p className="mx-auto mt-6 max-w-2xl text-lg text-ink/85">
                Not strategies. Not slogans. The quiet axioms beneath every conversation,
                classroom, page, and platform.
              </p>
            </Reveal>
          </div>

          <Stagger className="mt-16 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {PHILOSOPHICAL_ANCHORS.map((a) => (
              <StaggerItem key={a.n}>
                <article
                  className="card-lift group relative h-full overflow-hidden rounded-[24px] border border-line bg-surface/70 p-8 backdrop-blur-sm"
                  data-testid={`anchor-${a.n}`}
                >
                  <div className="flex items-start justify-between gap-6">
                    <span className="font-display text-5xl leading-none tracking-tight text-lime md:text-6xl">
                      {a.n}
                    </span>
                    <span className="mt-3 inline-block h-px w-12 bg-line transition-all duration-500 group-hover:w-20 group-hover:bg-lime" />
                  </div>
                  <h3 className="mt-8 text-2xl leading-tight text-ink md:text-3xl">
                    {a.title}
                  </h3>
                  <p className="mt-4 text-base leading-relaxed text-ink/80">
                    {a.body}
                  </p>

                  {/* hairline lime line that grows on hover */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-x-8 bottom-6 h-px origin-left scale-x-0 bg-lime/60 transition-transform duration-500 group-hover:scale-x-100"
                  />
                </article>
              </StaggerItem>
            ))}
          </Stagger>

          <Reveal delay={0.18}>
            <p className="mx-auto mt-16 max-w-2xl text-center font-script text-3xl leading-snug text-ink/85 md:text-4xl">
              &ldquo;Lead with love. Plant with care. Let time prove the rest.&rdquo;
            </p>
          </Reveal>
        </div>
      </section>

      {/* PILLARS */}
      <section className="container-page py-24 md:py-28">
        <div className="container-narrow">
          <Reveal>
            <p className="text-xs uppercase tracking-[0.28em] text-muted">The Practice</p>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="mt-5">Four rooms. One mission.</h2>
          </Reveal>
        </div>

        <Stagger className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            ["Coaching", "1-to-1 and group experiences that move people from scattered to purposeful via the LTE framework."],
            ["Academia", "Peer-reviewed research on AI in higher education, research practice, and the informal economy."],
            ["Authoring", "Books and devotionals on transformation, relationships, and the practice of hearing well."],
            ["Speaking", "Keynotes and seminars at the intersection of faith, knowledge, and purposeful living."],
          ].map(([title, body]) => (
            <StaggerItem key={title}>
              <div className="card-lift h-full rounded-[20px] border border-line bg-surface p-8 text-center">
                <h3 className="text-2xl">{title}</h3>
                <p className="mt-4 text-muted">{body}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>

        <Reveal delay={0.1} className="mt-14 flex flex-wrap justify-center gap-3">
          {VALUE_CHIPS.map((c) => (<span key={c} className="chip">{c}</span>))}
        </Reveal>

        <Reveal delay={0.18} className="mt-14 flex flex-wrap items-center justify-center gap-3">
          <MagneticButton
            as={Link}
            to="/contact"
            className="btn-lime"
            data-testid="about-book-appointment"
          >
            Book an appointment <ArrowUpRight className="h-4 w-4" />
          </MagneticButton>
          <Link to="/books" className="btn-ghost">Read the books</Link>
        </Reveal>

        <Reveal delay={0.24} className="mx-auto mt-16 max-w-4xl overflow-hidden rounded-[24px] border border-line">
          <img src={ABOUT_HERO_URL} alt="Debo' Owoseni on stage"
            className="aspect-[16/10] w-full object-cover" loading="lazy" />
        </Reveal>
      </section>
    </div>
  );
}
