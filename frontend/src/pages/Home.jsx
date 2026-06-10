import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ArrowUpRight, Play } from "lucide-react";
import {
  ABOUT_HERO_URL,
  EVENT_IMAGES,
  FALLBACK_BOOKS,
  FALLBACK_EVENTS,
  FALLBACK_PUBLICATIONS,
  FALLBACK_TESTIMONIALS,
  SCHOLAR_URL,
  SEED_POSTS,
  STATS,
  SYSTEME_BOOKING_URL,
  VALUE_CHIPS,
  VIDEO_URL,
  YOUTUBE_CHANNEL_URL,
} from "@/lib/data";
import { Reveal, Stagger, StaggerItem } from "@/components/site/Reveal";
import { BookShelf } from "@/components/site/BookShelf";
import { ImageMarquee, Marquee } from "@/components/site/Marquee";
import { CountUp } from "@/components/site/CountUp";
import { VideoModal } from "@/components/site/VideoModal";
import { MagneticButton } from "@/components/site/MagneticButton";
import {
  getPublishedBooks,
  getPublishedEvents,
  getPublishedPosts,
  getPublishedTestimonials,
  getPublicationsList,
} from "@/lib/api";

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

function SectionEyebrow({ children }) {
  return (
    <p className="text-xs uppercase tracking-[0.28em] text-muted">{children}</p>
  );
}

/**
 * KenBurnsBackdrop — slow cinematic crossfade of hero images with a subtle
 * zoom/pan ("Ken Burns") on the currently visible frame. Sits absolutely
 * behind the hero content. A dark overlay tames the imagery so the glass
 * panel + copy stay readable.
 */
function KenBurnsBackdrop({ images = [], intervalMs = 5500 }) {
  const [index, setIndex] = useState(0);
  const safeImages = images.length ? images : [];

  useEffect(() => {
    if (safeImages.length <= 1) return undefined;
    const id = setInterval(
      () => setIndex((i) => (i + 1) % safeImages.length),
      intervalMs
    );
    return () => clearInterval(id);
  }, [safeImages.length, intervalMs]);

  if (!safeImages.length) return null;

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden
      data-testid="hero-kenburns-backdrop"
    >
      <AnimatePresence mode="sync">
        <motion.div
          key={safeImages[index]}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1.18 }}
          exit={{ opacity: 0, scale: 1.22 }}
          transition={{
            opacity: { duration: 1.6, ease: "easeInOut" },
            scale: { duration: 7, ease: "linear" },
          }}
          className="absolute inset-0"
        >
          <img
            src={safeImages[index]}
            alt=""
            className="h-full w-full object-cover"
            loading="eager"
          />
        </motion.div>
      </AnimatePresence>

      {/* layered overlays for readability */}
      <div className="absolute inset-0 bg-bg/55" />
      <div className="absolute inset-0 bg-gradient-to-b from-bg/30 via-bg/50 to-bg" />
      <div
        className="absolute inset-0 mix-blend-overlay opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 80% 60% at 50% 20%, rgba(188,234,62,0.10), transparent 60%)",
        }}
      />

      {/* tiny progress dots */}
      {safeImages.length > 1 && (
        <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
          {safeImages.map((src, i) => (
            <span
              key={src}
              className={`h-1 rounded-full transition-all duration-500 ${
                i === index ? "w-8 bg-lime" : "w-3 bg-white/30"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const [videoOpen, setVideoOpen] = useState(false);
  const [posts, setPosts] = useState([]);
  const [testimonials, setTestimonials] = useState(FALLBACK_TESTIMONIALS);
  const [books, setBooks] = useState(FALLBACK_BOOKS);
  const [publications, setPublications] = useState(FALLBACK_PUBLICATIONS);
  const [events, setEvents] = useState(FALLBACK_EVENTS);

  useEffect(() => {
    let active = true;
    getPublishedPosts(3).then((p) => active && setPosts(p)).catch(() => {});
    getPublishedTestimonials().then((t) => active && t.length && setTestimonials(t)).catch(() => {});
    getPublishedBooks().then((b) => active && b.length && setBooks(b)).catch(() => {});
    getPublicationsList().then((p) => active && p.length && setPublications(p)).catch(() => {});
    getPublishedEvents().then((e) => active && e.length && setEvents(e)).catch(() => {});
    return () => { active = false; };
  }, []);

  const displayedPosts = posts.length > 0 ? posts.slice(0, 3) : SEED_POSTS.slice(0, 3);
  const eventGallery =
    (events[0]?.gallery && events[0].gallery.length ? events[0].gallery : EVENT_IMAGES).slice(0, 3);

  return (
    <div data-testid="home-page">
      {/* HERO — Ken-Burns motion gallery behind glassmorphism panel */}
      <section className="relative overflow-hidden" data-testid="hero-section">
        {/* Animated event-image background */}
        <KenBurnsBackdrop images={EVENT_IMAGES} />

        {/* Soft lime glow on top of the gallery */}
        <div className="lime-glow pointer-events-none absolute inset-x-0 top-0 h-[70vh]" aria-hidden />

        <div className="container-page relative pt-28 pb-24 md:pt-36 md:pb-36">
          {/* Glass panel that frames the headline content */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="relative mx-auto max-w-4xl rounded-[32px] border border-white/10 bg-bg/55 px-6 py-14 text-center shadow-[0_40px_120px_-30px_rgba(0,0,0,0.7)] backdrop-blur-2xl md:px-12 md:py-20"
            data-testid="hero-glass-panel"
            style={{
              backgroundImage:
                "linear-gradient(180deg, rgba(8,13,13,0.45) 0%, rgba(8,13,13,0.78) 100%)",
            }}
          >
            <div className="pointer-events-none absolute -inset-px rounded-[32px] ring-1 ring-inset ring-white/5" />

            <Reveal>
              <p className="inline-flex items-center gap-3 text-xs uppercase tracking-[0.28em] text-ink/70">
                <span className="inline-block h-px w-8 bg-lime/60" />
                Debo&apos; Owoseni
                <span className="inline-block h-px w-8 bg-lime/60" />
              </p>
            </Reveal>
            <Reveal delay={0.08}>
              <h1 className="mx-auto mt-7 max-w-4xl text-ink">
                A mission to catalyse transformation in{" "}
                <span className="font-display-italic text-lime">one million lives</span>{" "}
                <span className="font-display-italic">by 2035…</span>
              </h1>
            </Reveal>
            <Reveal delay={0.18}>
              <p className="mx-auto mt-8 max-w-2xl text-lg md:text-xl text-ink/85">
                Powering bold and transformative ideas with strategy, creativity, and growth —
                at the intersection of faith, knowledge, and service.
              </p>
            </Reveal>
            <Reveal delay={0.28}>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
                <MagneticButton
                  as="a"
                  href={SYSTEME_BOOKING_URL}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="btn-lime"
                  data-testid="hero-explore-programmes"
                >
                  Explore Programmes
                  <ArrowUpRight className="h-4 w-4" />
                </MagneticButton>
                <button
                  type="button"
                  onClick={() => setVideoOpen(true)}
                  className="btn-ghost backdrop-blur"
                  data-testid="hero-watch-debo"
                >
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-line bg-bg/80">
                    <Play className="h-3 w-3 fill-current text-lime" />
                  </span>
                  Watch Debo&apos;
                </button>
              </div>
            </Reveal>

            {/* Floating stat card — repositioned into the glass panel for cohesion */}
            <motion.div
              className="mx-auto mt-14 inline-flex items-center gap-5 rounded-2xl border border-white/10 bg-surface/70 px-6 py-4 backdrop-blur-xl"
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              data-testid="floating-stat-card"
            >
              <p className="font-display text-4xl leading-none tracking-tight text-ink">
                250<span className="text-lime">+</span>
              </p>
              <p className="max-w-[170px] text-left text-[11px] uppercase tracking-[0.18em] text-muted">
                Learners &amp; enquirers worldwide
              </p>
            </motion.div>
          </motion.div>

          {/* subtle scroll cue */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            className="mt-14 flex justify-center"
            aria-hidden
          >
            <div className="flex h-10 w-6 items-start justify-center rounded-full border border-white/15 p-1.5">
              <motion.div
                className="h-2 w-1 rounded-full bg-lime"
                animate={{ y: [0, 12, 0], opacity: [1, 0.2, 1] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* TRANSITION DIVIDER */}
      <div className="border-t border-line bg-bg" data-testid="hero-divider" />

      {/* CREAM MISSION BAND — editorial white-space for contrast */}
      <section className="cream-section py-24 md:py-32" data-testid="mission-band">
        <div className="container-narrow">
          <Reveal>
            <p className="text-xs uppercase tracking-[0.28em] muted">The Brief</p>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="mt-6">
              Direction, not motivation. <br className="hidden sm:block" />
              <span className="font-display-italic">Practice, not performance.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mx-auto mt-7 max-w-2xl text-lg md:text-xl text-cream-ink/80">
              Two decades of teaching, writing, and walking alongside purpose-driven people — distilled into
              a body of work designed to outlast a season.
            </p>
          </Reveal>
          <Reveal delay={0.24}>
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              {VALUE_CHIPS.map((c) => (
                <span key={c} className="chip" data-testid={`value-chip-${c.toLowerCase().replace(/[^a-z]+/g, "-")}`}>{c}</span>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ABOUT TEASER — centered intro */}
      <section className="container-page py-24 md:py-32" data-testid="about-teaser">
        <div className="container-narrow">
          <Reveal><SectionEyebrow>About Debo&apos;</SectionEyebrow></Reveal>
          <Reveal delay={0.08}>
            <h2 className="mt-5">
              A bold &amp; brilliant <span className="font-display-italic text-lime">transformation</span> architect.
            </h2>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-ink/85">
              A life-transformation coach, academic, and published author working at the intersection of
              intellectual rigour and spiritual depth. For 18+ years, Debo&apos; has supported purpose-driven
              professionals through transitions of calling, work, relationships, and identity.
            </p>
          </Reveal>
        </div>

        <Reveal delay={0.22} className="mx-auto mt-14 max-w-4xl overflow-hidden rounded-[24px] border border-line">
          <img
            src={ABOUT_HERO_URL}
            alt="Debo' Owoseni"
            className="aspect-[16/10] w-full object-cover"
            loading="lazy"
          />
        </Reveal>

        <Reveal delay={0.28} className="mt-10 flex justify-center">
          <Link to="/about" className="btn-ghost" data-testid="about-read-bio">
            Read the full story <ArrowRight className="h-4 w-4" />
          </Link>
        </Reveal>
      </section>

      {/* PUBLICATIONS STRIP */}
      <section className="border-t border-line bg-surface/30 py-24" data-testid="publications-strip">
        <div className="container-page">
          <div className="container-narrow">
            <Reveal><SectionEyebrow>Academic Work</SectionEyebrow></Reveal>
            <Reveal delay={0.08}>
              <h2 className="mt-5">Explore my <span className="font-display-italic text-lime">publications</span>.</h2>
            </Reveal>
            <Reveal delay={0.16}>
              <p className="mx-auto mt-5 max-w-2xl text-lg text-ink/85">
                Peer-reviewed academic work on AI, education, research, and the informal economy.
              </p>
            </Reveal>
            <Reveal delay={0.22} className="mt-8 flex justify-center">
              <a
                href={SCHOLAR_URL}
                target="_blank"
                rel="noreferrer noopener"
                className="btn-ghost"
                data-testid="publications-access-all"
              >
                Access all <ArrowUpRight className="h-4 w-4" />
              </a>
            </Reveal>
          </div>

          <Stagger className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {publications.slice(0, 6).map((p, i) => (
              <StaggerItem key={p.id || p.title}>
                <a
                  href={p.url || SCHOLAR_URL}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="card-lift group flex h-full flex-col justify-between rounded-[20px] border border-line bg-surface p-7 text-center"
                  data-testid={`publication-${i}`}
                >
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-muted">{p.year}</p>
                    <h3 className="mt-4 text-2xl leading-tight">{p.title}</h3>
                  </div>
                  <span className="mt-8 inline-flex items-center justify-center gap-2 text-sm text-lime opacity-0 transition group-hover:opacity-100">
                    Access library <ArrowUpRight className="h-4 w-4" />
                  </span>
                </a>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* BOOKS SHOWCASE — editorial 3D-book grid on the dark canvas */}
      <section className="container-page py-24 md:py-32" data-testid="books-showcase">
        <div className="container-narrow">
          <Reveal><SectionEyebrow>The Bookshelf</SectionEyebrow></Reveal>
          <Reveal delay={0.08}>
            <h2 className="mt-5">
              Explore my <span className="font-display-italic text-lime">writings</span>.
            </h2>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-ink/85">
              Thoughtful resources for the journey of personal transformation, spiritual growth,
              and purposeful living.
            </p>
          </Reveal>
          <Reveal delay={0.22} className="mt-8 flex justify-center">
            <Link to="/books" className="btn-ghost" data-testid="books-explore-all">
              Explore all <ArrowRight className="h-4 w-4" />
            </Link>
          </Reveal>
        </div>

        <div className="mt-16">
          <BookShelf books={books.slice(0, 3)} />
        </div>

        <p className="mt-16 text-center text-sm text-muted">
          Coaching & programmes &nbsp;
          <a
            href={SYSTEME_BOOKING_URL}
            target="_blank"
            rel="noreferrer noopener"
            className="font-semibold underline underline-offset-4 hover:text-lime"
            data-testid="books-coaching-link"
          >
              visit the programmes
            </a>
            .
          </p>
      </section>

      {/* EVENTS / GALLERY */}
      <section className="border-t border-line bg-surface/30 py-24 md:py-32" data-testid="events-section">
        <div className="container-page">
          <div className="container-narrow">
            <Reveal><SectionEyebrow>Events &amp; LTE Live</SectionEyebrow></Reveal>
            <Reveal delay={0.08}>
              <h2 className="mt-5">
                Rooms where <span className="font-display-italic text-lime">transformation</span> happens.
              </h2>
            </Reveal>
            <Reveal delay={0.16}>
              <p className="mx-auto mt-5 max-w-2xl text-lg text-ink/85">
                Cohort sessions, keynote talks, and Life Transformation Experience workshops —
                in person and online.
              </p>
            </Reveal>
            <Reveal delay={0.22} className="mt-8 flex justify-center">
              <Link to="/events" className="btn-ghost" data-testid="events-see-all">
                See all events <ArrowRight className="h-4 w-4" />
              </Link>
            </Reveal>
          </div>

          <Reveal delay={0.3} className="mt-14">
            <ImageMarquee images={eventGallery} duration={75} width={300} testId="events-marquee" />
            <p className="mt-6 text-center text-xs uppercase tracking-[0.24em] text-muted">
              Hover to pause &nbsp;·&nbsp; A glimpse from LTE Live · Leicester
            </p>
          </Reveal>
        </div>
      </section>

      {/* IMPACT STATS */}
      <section className="relative border-y border-line py-24" data-testid="impact-stats">
        <div className="lime-glow-soft absolute inset-0" aria-hidden />
        <div className="container-page relative">
          <div className="container-narrow">
            <Reveal>
              <h2>The work speaks. The <span className="font-display-italic text-lime">numbers</span> confirm.</h2>
            </Reveal>
            <Reveal delay={0.08}>
              <p className="mx-auto mt-5 max-w-2xl text-lg text-ink/85">
                Two decades. One mission. Helping people move from scattered to purposeful.
              </p>
            </Reveal>
          </div>

          <Stagger className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-3">
            {STATS.map((s, i) => (
              <StaggerItem key={s.label}>
                <div className="card-lift rounded-[20px] border border-line bg-surface p-8 text-center" data-testid={`stat-${i}`}>
                  <p className="font-display text-[clamp(3rem,6vw,5rem)] leading-none tracking-tight text-ink">
                    <CountUp value={s.value} suffix={s.suffix} />
                  </p>
                  <p className="mt-4 text-sm text-muted">{s.label}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* TESTIMONIALS — cream-toned for warmth */}
      <section className="cream-section py-24 md:py-32" data-testid="testimonials">
        <div className="container-page">
          <div className="container-narrow">
            <Reveal><SectionEyebrow>Voices</SectionEyebrow></Reveal>
            <Reveal delay={0.08}>
              <h2 className="mt-5">
                Real people. Real <span className="font-display-italic text-lime">results</span>.
              </h2>
            </Reveal>
          </div>

          <Stagger className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
            {testimonials.slice(0, 3).map((t) => (
              <StaggerItem key={t.id}>
                <figure
                  className="card-lift flex h-full flex-col gap-6 rounded-[20px] border border-line bg-surface p-8"
                  data-testid={`testimonial-${t.id}`}
                >
                  <span className="font-script text-6xl leading-none text-lime">&ldquo;</span>
                  <blockquote className="text-lg leading-relaxed">{t.quote}</blockquote>
                  <figcaption className="mt-auto text-sm muted">
                    — {t.attribution}{t.role ? ` · ${t.role}` : ""}
                  </figcaption>
                </figure>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* FROM THE JOURNAL */}
      <section className="border-t border-line bg-surface/30 py-24" data-testid="from-journal">
        <div className="container-page">
          <div className="container-narrow">
            <Reveal><SectionEyebrow>From the Journal</SectionEyebrow></Reveal>
            <Reveal delay={0.08}>
              <h2 className="mt-5">
                Thoughts that move people <span className="font-display-italic text-lime">forward</span>.
              </h2>
            </Reveal>
            <Reveal delay={0.16} className="mt-7 flex justify-center">
              <Link to="/journal" className="btn-ghost" data-testid="journal-read-latest">
                Read the journal <ArrowRight className="h-4 w-4" />
              </Link>
            </Reveal>
          </div>

          <Stagger className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
            {displayedPosts.map((p) => (
              <StaggerItem key={p.slug}>
                <Link
                  to={p.placeholder ? "/journal" : `/journal/${p.slug}`}
                  className="group flex flex-col gap-4"
                  data-testid={`home-journal-card-${p.slug}`}
                >
                  <div className="card-lift relative aspect-[4/3] overflow-hidden rounded-[16px] border border-line bg-surface">
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
                  <h3 className="text-2xl leading-tight text-ink group-hover:text-lime">
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
        </div>
      </section>

      {/* CTA BAND */}
      <a
        href={SYSTEME_BOOKING_URL}
        target="_blank"
        rel="noreferrer noopener"
        className="block overflow-hidden bg-lime"
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

      <VideoModal
        open={videoOpen}
        onClose={() => setVideoOpen(false)}
        url={VIDEO_URL}
        channelUrl={YOUTUBE_CHANNEL_URL}
      />
    </div>
  );
}
