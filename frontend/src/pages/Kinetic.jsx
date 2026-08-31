/* ==========================================================================
   KINETIC TYPOGRAPHY — showcase page
   --------------------------------------------------------------------------
   A self-contained demonstration of the Kinetic Typography design system,
   built with the site's existing stack (React + framer-motion + Tailwind) but
   fully scoped under `.kt` so it never disturbs the production dark/lime
   identity. Every "Bold Factor" signature is present:
     1. viewport-width headline (12vw)      5. uppercase display treatment
     2. two infinite marquees (fast/slow)   6. 8-10x scale hierarchy
     3. massive background numbers          7. sharp 2px brutalist borders
     4. hard black<->yellow hover flips
   ========================================================================== */
import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight, Plus, Minus } from "lucide-react";
import {
  KtButton,
  KtCard,
  KtMarquee,
  KtNoise,
  KtGiantNumber,
  KtReveal,
} from "@/components/kinetic";
import "@/components/kinetic/kinetic.css";

/* ------------------------------------------------------------------ data */
const STATS = [
  ["120K", "Words/min read"],
  ["8X", "Scale ratio"],
  ["0PX", "Border radius"],
  ["∞", "Marquee loops"],
  ["100%", "Uppercase"],
  ["2PX", "Hard borders"],
];

const FEATURES = [
  {
    n: "01",
    title: "Type as Structure",
    body: "Text is not decoration — it is the entire visual system. Headlines become heroes, numbers become graphic shapes, and the page is built from words.",
  },
  {
    n: "02",
    title: "Motion as Rhythm",
    body: "Marquees never stop. Hovers flip hard. Scroll drives scale and opacity. Nothing on the page is ever truly still — energy is the baseline state.",
  },
  {
    n: "03",
    title: "Contrast as Clarity",
    body: "Rich black, off-white, one acid accent. No mid-tones, no gradients, no soft shadows. The design screams rather than whispers — and stays legible doing it.",
  },
];

const STEPS = [
  { n: "01", t: "Set the Scale", d: "Push the headline to viewport units. Ten times body size, not two." },
  { n: "02", t: "Flood the Motion", d: "Add marquees and hard hover inversions until the page pulses." },
  { n: "03", t: "Cut the Corners", d: "Sharp 0px radius, 2px zinc borders, zero drop shadow. Brutal and flat." },
];

const TESTIMONIALS = [
  { q: "It stopped feeling like a website and started feeling like a poster you could walk into.", who: "Art Director" },
  { q: "The scale alone did the work. We barely wrote any copy.", who: "Brand Lead" },
  { q: "Every hover is a small event. People actually play with it.", who: "Product Designer" },
  { q: "Loud, fast, and somehow still readable. Exactly the brief.", who: "Creative Partner" },
];

const PLANS = [
  { name: "Solo", price: "09", tagline: "For the single loud page.", perks: ["1 project", "Core tokens", "Marquee kit"] },
  { name: "Studio", price: "29", tagline: "For teams that ship posters.", perks: ["10 projects", "Full component set", "Motion presets", "Priority support"], featured: true },
  { name: "Scale", price: "79", tagline: "For the whole kinetic system.", perks: ["Unlimited", "Design tokens API", "Custom accents", "White-glove onboarding"] },
];

const FAQS = [
  { q: "Isn't all-uppercase hard to read?", a: "Display text only — headings, buttons, labels. Body copy stays sentence-case at 18-24px for comfortable reading." },
  { q: "Do the marquees ever stop?", a: "Not for motion. But they freeze completely under prefers-reduced-motion, and the content stays fully legible in place." },
  { q: "Why acid yellow specifically?", a: "It clears WCAG AAA on rich black (~12:1) and reads as pure energy. One accent, used boldly, beats a palette of timid ones." },
  { q: "Can I use this on a real product?", a: "It is a personality-forward system. Land pages, campaigns and brand moments love it; dense data tables less so. Scope it deliberately." },
];

/* ------------------------------------------------------------- sections */

function TopBar() {
  return (
    <header className="sticky top-0 z-50 border-b-2 border-[var(--kt-border)] bg-[var(--kt-bg)]/90 backdrop-blur">
      <div className="mx-auto flex max-w-[95vw] items-center justify-between py-4">
        <Link to="/" className="kt-display text-lg tracking-tighter text-[var(--kt-fg)]">
          KINETIC<span className="text-[var(--kt-accent)]">*</span>
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          {["Features", "Process", "Pricing", "FAQ"].map((l) => (
            <a
              key={l}
              href={`#${l.toLowerCase()}`}
              className="kt-display text-sm tracking-tight text-[var(--kt-muted-fg)] transition-colors hover:text-[var(--kt-accent)]"
            >
              {l}
            </a>
          ))}
        </nav>
        <KtButton as="a" href="#cta" size="sm">
          Start
        </KtButton>
      </div>
    </header>
  );
}

function Hero() {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  // Dramatic zoom-out + fade as the viewer scrolls past the hero.
  const scale = useTransform(scrollYProgress, [0, 0.6], [1, 1.18]);
  const opacity = useTransform(scrollYProgress, [0, 0.55], [1, 0]);
  const motionStyle = reduce ? undefined : { scale, opacity };

  return (
    <section ref={ref} className="relative overflow-hidden border-b-2 border-[var(--kt-border)]">
      <motion.div style={motionStyle} className="mx-auto max-w-[97vw] px-2 pb-16 pt-20 md:pt-28">
        <p className="kt-display mb-6 text-sm tracking-[0.3em] text-[var(--kt-accent)] md:text-base">
          A design system that never sits still
        </p>
        <h1 className="kt-display text-[clamp(3rem,12vw,14rem)] text-[var(--kt-fg)]">
          Type
          <br />
          <span className="text-[var(--kt-accent)]">Screams</span>
          <br />
          Loud.
        </h1>
        <div className="mt-10 flex max-w-2xl flex-col gap-6 md:flex-row md:items-center">
          <p className="text-lg leading-tight text-[var(--kt-muted-fg)] md:text-xl">
            Kinetic Typography turns text into the entire visual structure — oversized,
            uppercase, and relentlessly in motion. This whole page is the proof.
          </p>
        </div>
        <div className="mt-8 flex flex-wrap gap-4">
          <KtButton as="a" href="#features" size="lg">
            See it move <ArrowUpRight className="h-5 w-5" />
          </KtButton>
          <KtButton as="a" href="#cta" variant="outline" size="lg">
            Get the kit
          </KtButton>
        </div>
      </motion.div>
    </section>
  );
}

function StatsMarquee() {
  return (
    <section aria-label="Statistics" className="border-b-2 border-[var(--kt-border)]">
      <KtMarquee accent speed={18}>
        {STATS.map(([n, l]) => (
          <span key={n} className="flex items-baseline gap-4 px-8 py-6">
            <span className="kt-display text-5xl md:text-7xl">{n}</span>
            <span className="kt-display text-sm tracking-tight md:text-lg">{l}</span>
            <span aria-hidden className="px-4 text-4xl md:text-6xl">✦</span>
          </span>
        ))}
      </KtMarquee>
    </section>
  );
}

function Features() {
  return (
    <section id="features" className="mx-auto max-w-[92vw] py-24 md:py-32">
      <KtReveal>
        <h2 className="kt-display mb-16 text-[clamp(2.5rem,8vw,6rem)] text-[var(--kt-fg)]">
          Three
          <br />
          Rules.
        </h2>
      </KtReveal>
      {/* Sticky stacking cards — later cards slide over earlier ones. */}
      <div className="space-y-6">
        {FEATURES.map((f, i) => (
          <div key={f.n} className="sticky" style={{ top: `${6 + i * 2}rem` }}>
            <KtCard className="group relative overflow-hidden p-8 md:p-12">
              <KtGiantNumber className="kt-ghost-num pointer-events-none absolute -right-2 -top-8 md:-top-16">
                {f.n}
              </KtGiantNumber>
              <div className="relative max-w-3xl">
                <h3 className="kt-display mb-5 text-3xl md:text-6xl">{f.title}</h3>
                <p className="kt-muted max-w-xl text-lg leading-tight md:text-2xl">{f.body}</p>
              </div>
            </KtCard>
          </div>
        ))}
      </div>
    </section>
  );
}

function Process() {
  return (
    <section id="process" className="border-y-2 border-[var(--kt-border)]">
      <div className="mx-auto max-w-[95vw] py-24 md:py-32">
        <KtReveal>
          <h2 className="kt-display mb-14 text-[clamp(2.5rem,8vw,6rem)] text-[var(--kt-fg)]">
            How it <span className="text-[var(--kt-accent)]">flows</span>
          </h2>
        </KtReveal>
        {/* gap-px over an accent container = hairline dividers between cells. */}
        <div className="kt-hairline-grid grid grid-cols-1 md:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.n} className="group relative overflow-hidden p-8 transition-colors md:p-10">
              <KtGiantNumber className="mb-6 text-[var(--kt-accent)]">{s.n}</KtGiantNumber>
              <h3 className="kt-display mb-3 text-2xl md:text-3xl text-[var(--kt-fg)]">{s.t}</h3>
              <p className="text-lg leading-tight text-[var(--kt-muted-fg)]">{s.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialsMarquee() {
  return (
    <section aria-label="Testimonials" className="border-b-2 border-[var(--kt-border)] py-16">
      <KtMarquee speed={44}>
        {TESTIMONIALS.map((t) => (
          <figure
            key={t.who}
            className="mx-4 flex w-[80vw] max-w-2xl flex-col justify-between border-2 border-[var(--kt-border)] p-8"
          >
            <blockquote className="text-2xl font-medium leading-tight text-[var(--kt-fg)] md:text-3xl">
              “{t.q}”
            </blockquote>
            <figcaption className="kt-display mt-6 text-sm tracking-tight text-[var(--kt-accent)]">
              {t.who}
            </figcaption>
          </figure>
        ))}
      </KtMarquee>
    </section>
  );
}

function Pricing() {
  return (
    <section id="pricing" className="mx-auto max-w-[92vw] py-24 md:py-32">
      <KtReveal>
        <h2 className="kt-display mb-14 text-[clamp(2.5rem,8vw,6rem)] text-[var(--kt-fg)]">
          Pick a<br />volume.
        </h2>
      </KtReveal>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {PLANS.map((p) => (
          <KtCard
            key={p.name}
            className={`group flex flex-col p-8 md:p-10 ${
              p.featured ? "border-[var(--kt-accent)]" : ""
            }`}
          >
            <div className="flex items-center justify-between">
              <h3 className="kt-display text-2xl md:text-3xl">{p.name}</h3>
              {p.featured && (
                <span className="kt-display border-2 border-current px-2 py-1 text-xs tracking-tight">
                  Popular
                </span>
              )}
            </div>
            <p className="kt-muted mt-2 text-base">{p.tagline}</p>
            <div className="mt-8 flex items-end gap-1">
              <span className="kt-display text-2xl">$</span>
              <span className="kt-display text-7xl leading-[0.8] md:text-8xl">{p.price}</span>
              <span className="kt-muted mb-2 text-sm">/mo</span>
            </div>
            <ul className="mt-8 flex-1 space-y-3">
              {p.perks.map((perk) => (
                <li key={perk} className="flex items-center gap-3 text-base">
                  <span aria-hidden className="kt-display text-[var(--kt-accent)] group-hover:text-current">
                    →
                  </span>
                  {perk}
                </li>
              ))}
            </ul>
            <KtButton
              as="a"
              href="#cta"
              variant={p.featured ? "accent" : "outline"}
              className="mt-8 w-full group-hover:border-current"
            >
              Choose {p.name}
            </KtButton>
          </KtCard>
        ))}
      </div>
    </section>
  );
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();
  return (
    <div className="border-b-2 border-[var(--kt-border)]">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-6 py-7 text-left"
      >
        <span className="kt-display text-xl tracking-tight text-[var(--kt-fg)] md:text-3xl">{q}</span>
        <span className="shrink-0 text-[var(--kt-accent)]">
          {open ? <Minus className="h-7 w-7" /> : <Plus className="h-7 w-7" />}
        </span>
      </button>
      <motion.div
        initial={false}
        animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
        transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 260, damping: 30 }}
        className="overflow-hidden"
      >
        <p className="max-w-2xl pb-7 text-lg leading-relaxed text-[var(--kt-muted-fg)]">{a}</p>
      </motion.div>
    </div>
  );
}

function Faq() {
  return (
    <section id="faq" className="border-t-2 border-[var(--kt-border)]">
      <div className="mx-auto max-w-[92vw] py-24 md:py-32">
        <KtReveal>
          <h2 className="kt-display mb-10 text-[clamp(2.5rem,8vw,6rem)] text-[var(--kt-fg)]">
            Questions
          </h2>
        </KtReveal>
        <div>
          {FAQS.map((f) => (
            <FaqItem key={f.q} {...f} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Cta() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  return (
    <section id="cta" className="bg-[var(--kt-accent)] text-[var(--kt-accent-fg)]">
      <div className="mx-auto max-w-[92vw] py-24 md:py-32">
        <h2 className="kt-display text-[clamp(2.5rem,10vw,8rem)]">
          Make it
          <br />
          move.
        </h2>
        <p className="mt-6 max-w-xl text-lg font-medium leading-tight md:text-2xl">
          Drop your email and we'll send the token set, the component kit, and the
          marquee presets. No static layouts allowed.
        </p>
        {sent ? (
          <p className="kt-display mt-12 text-3xl md:text-5xl" role="status">
            Sent. Watch your inbox ✦
          </p>
        ) : (
          <form
            className="mt-12 max-w-3xl"
            onSubmit={(e) => {
              e.preventDefault();
              if (email.trim()) setSent(true);
            }}
          >
            <label htmlFor="kt-email" className="kt-display mb-2 block text-sm tracking-widest">
              Your email
            </label>
            {/* Underline input inverts to black-on-yellow inside this section. */}
            <input
              id="kt-email"
              type="email"
              required
              placeholder="YOU@STUDIO.COM"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="kt-input"
              style={{
                color: "var(--kt-accent-fg)",
                borderBottomColor: "rgba(0,0,0,0.4)",
              }}
            />
            <button
              type="submit"
              className="kt-btn mt-8 h-20 border-2 border-current bg-[var(--kt-accent-fg)] px-12 text-lg text-[var(--kt-accent)] transition-transform hover:scale-105 active:scale-95"
            >
              Send it <ArrowUpRight className="h-5 w-5" />
            </button>
          </form>
        )}
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t-2 border-[var(--kt-border)]">
      <div className="mx-auto max-w-[95vw] py-16">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
          {[
            ["System", ["Tokens", "Type", "Color", "Motion"]],
            ["Components", ["Buttons", "Cards", "Marquee", "Inputs"]],
            ["Resources", ["Docs", "Figma", "Changelog", "Support"]],
            ["Company", ["About", "Careers", "Contact", "Legal"]],
          ].map(([head, links]) => (
            <div key={head}>
              <h3 className="kt-display mb-4 text-sm tracking-widest text-[var(--kt-muted-fg)]">{head}</h3>
              <ul className="space-y-2">
                {links.map((l) => (
                  <li key={l}>
                    <a href="#top" className="text-[var(--kt-fg)] transition-colors hover:text-[var(--kt-accent)]">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t-2 border-[var(--kt-border)] pt-8 md:flex-row md:items-center">
          <p className="kt-display text-4xl tracking-tighter text-[var(--kt-fg)] md:text-6xl">
            KINETIC<span className="text-[var(--kt-accent)]">*</span>
          </p>
          <Link to="/" className="kt-display text-sm tracking-tight text-[var(--kt-muted-fg)] hover:text-[var(--kt-accent)]">
            ← Back to debowoseni
          </Link>
        </div>
      </div>
    </footer>
  );
}

export default function Kinetic() {
  return (
    <div id="top" className="kt">
      <TopBar />
      <main>
        <Hero />
        <StatsMarquee />
        <Features />
        <Process />
        <TestimonialsMarquee />
        <Pricing />
        <Faq />
        <Cta />
      </main>
      <Footer />
      <KtNoise />
    </div>
  );
}
