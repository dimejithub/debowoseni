import { useEffect, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/site/Reveal";
import { FALLBACK_PUBLICATIONS, SCHOLAR_URL } from "@/lib/data";
import { getPublicationsList } from "@/lib/api";

export default function Publications() {
  const [publications, setPublications] = useState(FALLBACK_PUBLICATIONS);

  useEffect(() => {
    let active = true;
    getPublicationsList().then((p) => active && p.length && setPublications(p)).catch(() => {});
    return () => { active = false; };
  }, []);

  return (
    <div data-testid="publications-page">
      <section className="relative overflow-hidden">
        <div className="lime-glow absolute inset-x-0 top-0 h-[45vh]" aria-hidden />
        <div className="container-page relative py-20 md:py-28">
          <div className="container-narrow">
            <Reveal><p className="text-xs uppercase tracking-[0.28em] text-muted">Academic Work</p></Reveal>
            <Reveal delay={0.08}>
              <h1 className="mx-auto mt-7 max-w-4xl">
                Explore my <span className="font-display-italic text-lime">publications</span>.
              </h1>
            </Reveal>
            <Reveal delay={0.16}>
              <p className="mx-auto mt-7 max-w-2xl text-lg md:text-xl text-ink/85">
                Peer-reviewed research on AI, higher education, research practice, and the
                informal economy — with a focus on the ethical and human implications of
                emerging technologies.
              </p>
            </Reveal>
            <Reveal delay={0.22} className="mt-9 flex justify-center">
              <a
                href={SCHOLAR_URL}
                target="_blank"
                rel="noreferrer noopener"
                className="btn-ghost"
                data-testid="publications-scholar"
              >
                View on Google Scholar <ArrowUpRight className="h-4 w-4" />
              </a>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="container-page pb-24">
        <div className="mx-auto max-w-4xl grid grid-cols-1 gap-4">
          {publications.map((p, i) => (
            <Reveal key={p.id || p.title} delay={Math.min(i * 0.06, 0.36)}>
              <a
                href={p.url || SCHOLAR_URL}
                target="_blank"
                rel="noreferrer noopener"
                className="card-lift group flex items-center gap-6 rounded-[20px] border border-line bg-surface px-6 py-7"
                data-testid={`publication-row-${i}`}
              >
                <p className="w-14 font-display text-3xl tracking-tight text-muted md:text-4xl">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <div className="flex-1">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted">{p.year}</p>
                  <h3 className="mt-2 text-2xl leading-tight md:text-3xl">{p.title}</h3>
                </div>
                <span className="hidden items-center gap-2 text-sm text-lime md:inline-flex">
                  Access library
                  <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </span>
              </a>
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}
