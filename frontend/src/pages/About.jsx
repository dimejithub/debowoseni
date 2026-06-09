import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "@/components/site/Reveal";
import { ABOUT_HERO_URL, PORTRAIT_URL, SYSTEME_BOOKING_URL, VALUE_CHIPS } from "@/lib/data";

export default function About() {
  return (
    <div data-testid="about-page">
      <section className="relative overflow-hidden">
        <div className="lime-glow absolute inset-x-0 top-0 h-[40vh]" aria-hidden />
        <div className="container-page relative py-20 md:py-28">
          <Reveal>
            <p className="text-xs uppercase tracking-[0.24em] text-muted">
              Transformation Coach · Academic · Author
            </p>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="mt-6 max-w-4xl font-display italic">
              The place where enquiry becomes{" "}
              <span className="text-lime">direction</span>.
            </h1>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mt-6 max-w-2xl text-lg text-ink/85">
              A deeper look into the convictions, research, and lived experience that
              shape everything I do.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="container-page pb-24">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-16">
          <Reveal className="md:col-span-5">
            <div className="overflow-hidden rounded-[20px] border border-line">
              <img
                src={PORTRAIT_URL}
                alt="Debo' Owoseni portrait"
                className="aspect-[4/5] w-full object-cover"
                loading="eager"
              />
            </div>
            <div className="mt-6 overflow-hidden rounded-[20px] border border-line">
              <img
                src={ABOUT_HERO_URL}
                alt="On stage"
                className="aspect-[16/10] w-full object-cover"
                loading="lazy"
              />
            </div>
          </Reveal>

          <div className="md:col-span-7">
            <Reveal>
              <h2 className="font-display">
                At the intersection of <span className="text-lime">faith</span>, knowledge,
                and service.
              </h2>
            </Reveal>
            <Reveal delay={0.05}>
              <p className="mt-6 text-ink/85">
                Debo&apos; Owoseni has spent over two decades helping people move from
                scattered to purposeful. As a life-transformation coach, academic, and
                published author, he works at the intersection of intellectual rigour
                and spiritual depth — and he refuses to put either down.
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-5 text-ink/85">
                For 18+ years, Debo&apos; has supported purpose-driven professionals
                navigating the transitions of calling, work, relationships, and identity
                across changing seasons. In the classroom and the research space, he
                examines how people and institutions adapt within complex digital
                environments — with a particular focus on the ethical and human
                implications of emerging technologies, including AI.
              </p>
            </Reveal>

            <Reveal delay={0.15}>
              <blockquote className="mt-12 border-l-2 border-lime pl-6 font-script text-4xl leading-tight text-ink">
                I am here for the people who are tired of motivation and ready for direction.
              </blockquote>
            </Reveal>

            <Stagger className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2">
              <StaggerItem>
                <div className="rounded-[20px] border border-line bg-surface p-7">
                  <h3 className="font-display text-2xl tracking-tight">Coaching</h3>
                  <p className="mt-3 text-muted">
                    1-to-1 and group experiences that move people from scattered to
                    purposeful via the LTE framework.
                  </p>
                </div>
              </StaggerItem>
              <StaggerItem>
                <div className="rounded-[20px] border border-line bg-surface p-7">
                  <h3 className="font-display text-2xl tracking-tight">Academia</h3>
                  <p className="mt-3 text-muted">
                    Peer-reviewed research on AI in higher education, research practice,
                    and the informal economy.
                  </p>
                </div>
              </StaggerItem>
              <StaggerItem>
                <div className="rounded-[20px] border border-line bg-surface p-7">
                  <h3 className="font-display text-2xl tracking-tight">Authoring</h3>
                  <p className="mt-3 text-muted">
                    Books and devotionals on transformation, relationships, and the
                    practice of hearing well.
                  </p>
                </div>
              </StaggerItem>
              <StaggerItem>
                <div className="rounded-[20px] border border-line bg-surface p-7">
                  <h3 className="font-display text-2xl tracking-tight">Speaking</h3>
                  <p className="mt-3 text-muted">
                    Keynotes and seminars at the intersection of faith, knowledge, and
                    purposeful living.
                  </p>
                </div>
              </StaggerItem>
            </Stagger>

            <Reveal delay={0.2}>
              <div className="mt-14 flex flex-wrap gap-3">
                {VALUE_CHIPS.map((c) => (
                  <span key={c} className="chip">{c}</span>
                ))}
              </div>
            </Reveal>

            <Reveal delay={0.25}>
              <div className="mt-12 flex flex-wrap items-center gap-3">
                <a
                  href={SYSTEME_BOOKING_URL}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-2 rounded-full bg-lime px-6 py-3 text-sm font-semibold text-bg transition-all hover:-translate-y-0.5 hover:shadow-[0_0_28px_rgba(188,234,62,0.35)]"
                  data-testid="about-book-appointment"
                >
                  Book an appointment <ArrowUpRight className="h-4 w-4" />
                </a>
                <Link
                  to="/books"
                  className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-5 py-3 text-sm text-ink hover:border-lime hover:text-lime"
                >
                  Read the books
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </div>
  );
}
