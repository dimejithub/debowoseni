import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight, Play } from "lucide-react";
import {
  ABOUT_HERO_URL,
  BOOKS,
  BRAND_LOGOS,
  PORTRAIT_URL,
  PUBLICATIONS,
  SCHOLAR_URL,
  SEED_POSTS,
  STATS,
  SYSTEME_BOOKING_URL,
  TESTIMONIALS,
  VALUE_CHIPS,
  VIDEO_URL,
} from "@/lib/data";
import { Reveal, Stagger, StaggerItem } from "@/components/site/Reveal";
import { BookCard } from "@/components/site/BookCard";
import { LogoMarquee, Marquee } from "@/components/site/Marquee";
import { CountUp } from "@/components/site/CountUp";
import { VideoModal } from "@/components/site/VideoModal";
import { getPublishedPosts } from "@/lib/api";

function formatDate(iso) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

export default function Home() {
  const [videoOpen, setVideoOpen] = useState(false);
  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getPublishedPosts(3)
      .then((p) => active && setPosts(p))
      .catch(() => active && setPosts([]))
      .finally(() => active && setPostsLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const featured = BOOKS.find((b) => b.featured) || BOOKS[0];
  const otherBooks = BOOKS.filter((b) => b.id !== featured.id);

  const displayedPosts = posts.length > 0 ? posts.slice(0, 3) : SEED_POSTS.slice(0, 3);
  const showSeedNotice = posts.length === 0 && !postsLoading;

  return (
    <div data-testid="home-page">
      {/* HERO */}
      <section className="relative overflow-hidden" data-testid="hero-section">
        <div className="lime-glow absolute inset-x-0 top-0 h-[60vh]" aria-hidden />
        <div className="container-page relative grid grid-cols-1 gap-10 pb-20 pt-14 md:gap-14 md:pb-32 md:pt-20 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-7">
            <Reveal>
              <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-muted">
                <span className="inline-block h-px w-8 bg-line" /> Debo&apos; Owoseni
              </p>
            </Reveal>
            <Reveal delay={0.08}>
              <h1 className="mt-6 font-display italic text-[clamp(2.75rem,6vw,5.5rem)] leading-[1.02] tracking-[-1.4px]">
                A mission to catalyse transformation in{" "}
                <span className="text-lime">one million lives</span> by 2035…
              </h1>
            </Reveal>
            <Reveal delay={0.18}>
              <p className="mt-7 max-w-xl text-lg text-ink/85">
                Powering bold and transformative ideas with strategy, creativity, and
                growth — at the intersection of faith, knowledge, and service.
              </p>
            </Reveal>
            <Reveal delay={0.28}>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <a
                  href={SYSTEME_BOOKING_URL}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-2 rounded-full bg-lime px-6 py-3 text-sm font-semibold text-bg transition-all hover:-translate-y-0.5 hover:shadow-[0_0_28px_rgba(188,234,62,0.35)]"
                  data-testid="hero-explore-programmes"
                >
                  Explore Programmes
                  <ArrowUpRight className="h-4 w-4" />
                </a>
                <button
                  type="button"
                  onClick={() => setVideoOpen(true)}
                  className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/70 px-5 py-3 text-sm text-ink transition hover:border-lime hover:text-lime"
                  data-testid="hero-watch-debo"
                >
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-line bg-bg">
                    <Play className="h-3 w-3 fill-current text-lime" />
                  </span>
                  Watch Debo&apos;
                </button>
              </div>
            </Reveal>
          </div>

          {/* Portrait + floating stat card */}
          <Reveal delay={0.3} className="relative lg:col-span-5">
            <div className="relative mx-auto w-full max-w-md overflow-hidden rounded-[24px] border border-line bg-surface">
              <img
                src={PORTRAIT_URL}
                alt="Debo' Owoseni — Transformation Coach, Academic, Author"
                className="aspect-[4/5] w-full object-cover"
                loading="eager"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-bg/60 via-transparent to-transparent" />
            </div>
            <div
              className="absolute -left-2 bottom-6 max-w-[230px] rounded-[20px] border border-line bg-surface/95 p-5 backdrop-blur md:-left-10"
              data-testid="floating-stat-card"
            >
              <p className="font-display text-4xl leading-none tracking-tight text-ink">
                250<span className="text-lime">+</span>
              </p>
              <p className="mt-2 text-xs uppercase tracking-[0.18em] text-muted">
                Learners & enquirers worldwide
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* TRUSTED BY MARQUEE */}
      <section className="border-y border-line bg-surface/40 py-10" data-testid="trusted-by">
        <div className="container-page mb-5 flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs uppercase tracking-[0.22em] text-muted">
            Trusted by leading institutions & partners
          </p>
          <p className="text-xs text-muted">[Real partner marks coming soon]</p>
        </div>
        <LogoMarquee logos={BRAND_LOGOS} />
      </section>

      {/* ABOUT TEASER */}
      <section className="container-page py-24 md:py-32" data-testid="about-teaser">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12 md:items-center md:gap-16">
          <Reveal className="md:col-span-5">
            <div className="overflow-hidden rounded-[20px] border border-line">
              <img
                src={ABOUT_HERO_URL}
                alt="On stage"
                className="aspect-[4/5] w-full object-cover"
                loading="lazy"
              />
            </div>
          </Reveal>
          <div className="md:col-span-7">
            <Reveal>
              <p className="text-xs uppercase tracking-[0.24em] text-muted">About Debo&apos;</p>
            </Reveal>
            <Reveal delay={0.1}>
              <h2 className="mt-4 max-w-2xl font-display">
                A bold &amp; brilliant <span className="text-lime">transformation</span> architect.
              </h2>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="mt-6 max-w-2xl text-ink/85">
                A life-transformation coach, academic, and published author working at the
                intersection of intellectual rigour and spiritual depth. For over 18 years,
                Debo&apos; has supported purpose-driven professionals navigating transitions of
                calling, work, relationships, and identity — and he researches how people
                and institutions adapt within complex digital environments, with a particular
                focus on the ethical and human implications of emerging technologies, including AI.
              </p>
            </Reveal>
            <Reveal delay={0.3}>
              <Link
                to="/about"
                className="mt-8 inline-flex items-center gap-2 rounded-full border border-line bg-surface px-5 py-3 text-sm text-ink transition hover:border-lime hover:text-lime"
                data-testid="about-read-bio"
              >
                Read the full story <ArrowRight className="h-4 w-4" />
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* PUBLICATIONS STRIP */}
      <section className="border-t border-line bg-surface/30 py-24" data-testid="publications-strip">
        <div className="container-page">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <Reveal>
              <h2 className="font-display">
                Explore my <span className="text-lime">publications</span>.
              </h2>
              <p className="mt-3 max-w-xl text-muted">
                Peer-reviewed academic work on AI, education, research, and the informal economy.
              </p>
            </Reveal>
            <a
              href={SCHOLAR_URL}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-2 text-sm text-lime hover:underline"
              data-testid="publications-access-all"
            >
              Access all <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
          <Stagger className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {PUBLICATIONS.map((p, i) => (
              <StaggerItem key={p.title}>
                <a
                  href={p.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="group flex h-full flex-col justify-between rounded-[20px] border border-line bg-surface p-7 transition hover:-translate-y-1 hover:border-muted"
                  data-testid={`publication-${i}`}
                >
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-muted">
                      {p.year}
                    </p>
                    <h3 className="mt-4 font-display text-2xl leading-tight tracking-tight text-ink">
                      {p.title}
                    </h3>
                  </div>
                  <span className="mt-8 inline-flex items-center gap-2 text-sm text-lime opacity-0 transition group-hover:opacity-100">
                    Access library <ArrowUpRight className="h-4 w-4" />
                  </span>
                </a>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* BOOKS SHOWCASE (replaces pricing) */}
      <section className="container-page py-24 md:py-32" data-testid="books-showcase">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <Reveal>
            <p className="text-xs uppercase tracking-[0.24em] text-muted">The Bookshelf</p>
            <h2 className="mt-3 max-w-2xl font-display">
              Explore my <span className="text-lime">writings</span>.
            </h2>
            <p className="mt-4 max-w-xl text-muted">
              Thoughtful resources for the journey of personal transformation, spiritual
              growth, and purposeful living.
            </p>
          </Reveal>
          <Link
            to="/books"
            className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-5 py-3 text-sm text-ink transition hover:border-lime hover:text-lime"
            data-testid="books-explore-all"
          >
            Explore all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <Reveal delay={0.1} className="mt-12">
          <BookCard book={featured} large />
        </Reveal>

        <Stagger className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {otherBooks.map((b) => (
            <StaggerItem key={b.id}>
              <BookCard book={b} />
            </StaggerItem>
          ))}
        </Stagger>

        <p className="mt-12 text-center text-sm text-muted">
          Coaching & programmes &nbsp;
          <a
            href={SYSTEME_BOOKING_URL}
            target="_blank"
            rel="noreferrer noopener"
            className="text-lime hover:underline"
            data-testid="books-coaching-link"
          >
            visit the programmes
          </a>
          .
        </p>
      </section>

      {/* IMPACT STATS */}
      <section className="relative border-y border-line bg-surface/30 py-24" data-testid="impact-stats">
        <div className="lime-glow-soft absolute inset-0" aria-hidden />
        <div className="container-page relative">
          <Reveal>
            <h2 className="max-w-3xl font-display">
              The work speaks. The <span className="text-lime">numbers</span> confirm.
            </h2>
            <p className="mt-4 max-w-xl text-muted">
              Two decades. One mission. Helping people move from scattered to purposeful.
            </p>
          </Reveal>

          <Stagger className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-3">
            {STATS.map((s, i) => (
              <StaggerItem key={s.label}>
                <div className="rounded-[20px] border border-line bg-surface p-8" data-testid={`stat-${i}`}>
                  <p className="font-display text-[clamp(3rem,6vw,5rem)] leading-none tracking-tight text-ink">
                    <CountUp value={s.value} suffix={s.suffix} />
                  </p>
                  <p className="mt-4 text-sm text-muted">{s.label}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>

          <div className="mt-14 flex flex-wrap gap-3">
            {VALUE_CHIPS.map((c) => (
              <span key={c} className="chip" data-testid={`value-chip-${c.toLowerCase().replace(/[^a-z]+/g, "-")}`}>
                {c}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="container-page py-24 md:py-32" data-testid="testimonials">
        <Reveal>
          <p className="text-xs uppercase tracking-[0.24em] text-muted">Voices</p>
          <h2 className="mt-3 max-w-2xl font-display">
            Real people. Real <span className="text-lime">results</span>.
          </h2>
        </Reveal>

        <Stagger className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <StaggerItem key={t.id}>
              <figure
                className="flex h-full flex-col gap-6 rounded-[20px] border border-line bg-surface p-7"
                data-testid={`testimonial-${t.id}`}
              >
                <span className="font-script text-5xl leading-none text-lime">&ldquo;</span>
                <blockquote className="text-ink/90">{t.quote}</blockquote>
                <figcaption className="mt-auto text-sm text-muted">— {t.attribution}</figcaption>
              </figure>
            </StaggerItem>
          ))}
        </Stagger>
        <p className="mt-6 text-xs text-muted">
          Real attributed quotes will replace these — names withheld until permission is on file.
        </p>
      </section>

      {/* FROM THE JOURNAL */}
      <section className="border-t border-line bg-surface/30 py-24" data-testid="from-journal">
        <div className="container-page">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <Reveal>
              <p className="text-xs uppercase tracking-[0.24em] text-muted">From the Journal</p>
              <h2 className="mt-3 max-w-xl font-display">
                Thoughts that move people <span className="text-lime">forward</span>.
              </h2>
            </Reveal>
            <Link
              to="/journal"
              className="inline-flex items-center gap-2 text-sm text-lime hover:underline"
              data-testid="journal-read-latest"
            >
              Read the journal <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <Stagger className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            {displayedPosts.map((p) => (
              <StaggerItem key={p.slug}>
                <Link
                  to={p.placeholder ? "/journal" : `/journal/${p.slug}`}
                  className="group flex flex-col gap-4"
                  data-testid={`home-journal-card-${p.slug}`}
                >
                  <div className="relative aspect-[4/3] overflow-hidden rounded-[16px] border border-line bg-surface">
                    <img
                      src={p.cover_url || "https://images.pexels.com/photos/7505924/pexels-photo-7505924.jpeg?w=800"}
                      alt={p.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                    />
                    <span className="absolute right-4 top-4 inline-flex items-center rounded-full bg-lime px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-bg">
                      {p.category}
                    </span>
                  </div>
                  <h3 className="font-display text-2xl leading-tight tracking-tight text-ink group-hover:text-lime">
                    {p.title}
                  </h3>
                  <p className="line-clamp-2 text-muted">{p.excerpt}</p>
                  <p className="text-xs text-muted">
                    {p.author_name || "Debo Owoseni"} · {formatDate(p.published_at)}
                  </p>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
          {showSeedNotice && (
            <p className="mt-6 text-xs text-muted">
              These are gentle placeholders — the journal will fill in as Debo&apos; publishes from /admin.
            </p>
          )}
        </div>
      </section>

      {/* CTA BAND */}
      <a
        href={SYSTEME_BOOKING_URL}
        target="_blank"
        rel="noreferrer noopener"
        className="block bg-lime"
        data-testid="cta-marquee-band"
      >
        <Marquee
          dark
          items={[
            "Let's get started",
            "Let's get started",
            "Let's get started",
            "Let's get started",
            "Let's get started",
          ]}
        />
      </a>

      <VideoModal open={videoOpen} onClose={() => setVideoOpen(false)} url={VIDEO_URL} />
    </div>
  );
}
