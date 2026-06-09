import { ArrowUpRight } from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "@/components/site/Reveal";
import { PUBLICATIONS, SCHOLAR_URL } from "@/lib/data";

export default function Publications() {
  return (
    <div data-testid="publications-page">
      <section className="relative overflow-hidden">
        <div className="lime-glow absolute inset-x-0 top-0 h-[40vh]" aria-hidden />
        <div className="container-page relative py-20 md:py-28">
          <Reveal>
            <p className="text-xs uppercase tracking-[0.24em] text-muted">Academic Work</p>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="mt-6 max-w-4xl font-display">
              Explore my <span className="text-lime">publications</span>.
            </h1>
          </Reveal>
          <Reveal delay={0.18}>
            <p className="mt-6 max-w-2xl text-lg text-ink/85">
              Peer-reviewed research on AI, higher education, research practice, and the
              informal economy — with a focus on the ethical and human implications of
              emerging technologies.
            </p>
            <a
              href={SCHOLAR_URL}
              target="_blank"
              rel="noreferrer noopener"
              className="mt-8 inline-flex items-center gap-2 rounded-full border border-line bg-surface px-5 py-3 text-sm text-ink transition hover:border-lime hover:text-lime"
              data-testid="publications-scholar"
            >
              View on Google Scholar <ArrowUpRight className="h-4 w-4" />
            </a>
          </Reveal>
        </div>
      </section>

      <section className="container-page pb-24">
        <Stagger className="grid grid-cols-1 gap-4">
          {PUBLICATIONS.map((p, i) => (
            <StaggerItem key={p.title}>
              <a
                href={p.url}
                target="_blank"
                rel="noreferrer noopener"
                className="group grid grid-cols-12 items-center gap-4 rounded-[20px] border border-line bg-surface px-6 py-7 transition hover:-translate-y-0.5 hover:border-muted"
                data-testid={`publication-row-${i}`}
              >
                <p className="col-span-2 font-display text-3xl tracking-tight text-muted md:text-4xl">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <div className="col-span-7">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted">{p.year}</p>
                  <h3 className="mt-2 font-display text-2xl leading-tight tracking-tight md:text-3xl">
                    {p.title}
                  </h3>
                </div>
                <span className="col-span-3 inline-flex items-center justify-end gap-2 text-sm text-lime">
                  Access library
                  <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </span>
              </a>
            </StaggerItem>
          ))}
        </Stagger>
      </section>
    </div>
  );
}
