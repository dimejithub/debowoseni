import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  AnimatePresence,
  motion,
  useScroll,
  useTransform,
  useMotionTemplate,
  useReducedMotion,
} from "framer-motion";
import { ArrowUpRight, Play } from "lucide-react";
import { EVENT_IMAGES, YOUTUBE_CHANNEL_URL } from "@/lib/data";
import { MagneticButton } from "@/components/site/MagneticButton";

const LINE1 = "Move from uncertainty";
const LINE2_WORDS = ["to", "confident,", "purposeful", "action."];
const SUBTEXT =
  "I help purpose-driven individuals and leaders define what matters, strengthen their confidence, and develop practical strategies for meaningful personal and professional growth.";
const CREDENTIALS = ["18+ years", "Coaching", "Academia", "Authorship"];

function Kicker() {
  return (
    <p className="inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.34em] text-ink/70">
      <span className="relative flex h-1.5 w-1.5">
        <span className="live-ping absolute inline-flex h-full w-full rounded-full bg-lime/70" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-lime" />
      </span>
      Transformation Coaching
    </p>
  );
}

function Ctas() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <MagneticButton
        as={Link}
        to="/expressions/life-transformation-enquiry"
        className="btn-lime"
        data-testid="hero-explore-programmes"
      >
        Explore Programmes
        <ArrowUpRight className="h-4 w-4" />
      </MagneticButton>
      <a
        href={YOUTUBE_CHANNEL_URL}
        target="_blank"
        rel="noreferrer noopener"
        className="btn-ghost backdrop-blur"
        data-testid="hero-watch-debo"
      >
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-line bg-bg/80">
          <Play className="h-3 w-3 fill-current text-lime" />
        </span>
        Watch Debo&apos;
      </a>
    </div>
  );
}

function Credentials() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[11px] uppercase tracking-[0.24em] text-ink/55">
      {CREDENTIALS.map((c, i) => (
        <span key={c} className="inline-flex items-center gap-4">
          {i > 0 && <span className="h-1 w-1 rounded-full bg-lime/50" aria-hidden />}
          {c}
        </span>
      ))}
    </div>
  );
}

// One word of the "confident, purposeful action" line, rising + sharpening into
// place across its own slice of the scroll — a kinetic, staggered reveal.
function ScrollWord({ progress, start, end, children }) {
  const opacity = useTransform(progress, [start, end], [0, 1]);
  const y = useTransform(progress, [start, end], [30, 0]);
  const blur = useTransform(progress, [start, end], [12, 0]);
  const filter = useMotionTemplate`blur(${blur}px)`;
  return (
    <motion.span className="mr-[0.24em] inline-block" style={{ opacity, y, filter }}>
      {children}
    </motion.span>
  );
}

function SessionBackdrop({ images, index }) {
  if (!images.length) return null;
  return (
    <AnimatePresence mode="sync">
      <motion.img
        key={images[index]}
        src={images[index]}
        alt=""
        initial={{ opacity: 0, scale: 1.05 }}
        animate={{ opacity: 1, scale: 1.16 }}
        exit={{ opacity: 0 }}
        transition={{ opacity: { duration: 1.6, ease: "easeInOut" }, scale: { duration: 8, ease: "linear" } }}
        className="absolute inset-0 h-full w-full object-cover"
        loading="eager"
        aria-hidden
      />
    </AnimatePresence>
  );
}

/**
 * StoryHero — a scroll-told hero. Opens on "Move from uncertainty" over a
 * blurred, dimmed session backdrop; scrolling clears the picture while
 * "to confident, purposeful action" builds in word by word and the supporting
 * copy + CTAs arrive. Falls back to a calm static hero for reduced-motion.
 */
export function StoryHero() {
  const images = EVENT_IMAGES || [];
  const reduce = useReducedMotion();
  const sectionRef = useRef(null);
  const [bgIndex, setBgIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return undefined;
    const id = setInterval(() => setBgIndex((i) => (i + 1) % images.length), 5500);
    return () => clearInterval(id);
  }, [images.length]);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  // Background: uncertainty (blurred, dim, over-scaled) → clarity (sharp, richer
  // — less scrim so Debo's session photo breathes through at the payoff).
  const bgBlur = useTransform(scrollYProgress, [0, 0.55], [16, 0]);
  const bgBright = useTransform(scrollYProgress, [0, 0.6], [0.42, 1]);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1.18, 1.02]);
  const bgY = useTransform(scrollYProgress, [0, 1], ["-2%", "3%"]);
  const bgFilter = useMotionTemplate`blur(${bgBlur}px) brightness(${bgBright})`;
  const scrimOpacity = useTransform(scrollYProgress, [0, 0.6], [0.78, 0.32]);
  const glowOpacity = useTransform(scrollYProgress, [0, 0.7], [0.12, 0.55]);

  // Content beats.
  const subOpacity = useTransform(scrollYProgress, [0.5, 0.72], [0, 1]);
  const subY = useTransform(scrollYProgress, [0.5, 0.72], [22, 0]);
  const ctaOpacity = useTransform(scrollYProgress, [0.64, 0.86], [0, 1]);
  const ctaY = useTransform(scrollYProgress, [0.64, 0.86], [22, 0]);
  const credOpacity = useTransform(scrollYProgress, [0.8, 0.98], [0, 1]);
  const contentY = useTransform(scrollYProgress, [0, 1], [12, -26]); // subtle depth parallax
  const cueOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0]);

  const WORD_START = 0.14;
  const WORD_STEP = 0.07;
  const WORD_WINDOW = 0.2;

  // Reduced motion / no-scroll fallback.
  if (reduce) {
    return (
      <section className="relative overflow-hidden" data-testid="hero-section">
        <div className="absolute inset-0">
          <SessionBackdrop images={images} index={bgIndex} />
          <div className="absolute inset-0 bg-bg/70" />
          <div className="absolute inset-0 bg-gradient-to-b from-bg/40 via-bg/60 to-bg" />
          <div className="hero-vignette absolute inset-0" aria-hidden />
        </div>
        <div className="hero-grid pointer-events-none absolute inset-0 z-[1]" aria-hidden />
        <div className="container-page relative z-10 pt-28 pb-24 text-center md:pt-36 md:pb-32">
          <div className="premium-card mx-auto max-w-4xl rounded-[28px] px-6 py-16 md:px-14 md:py-24">
            <Kicker />
            <h1 className="mx-auto mt-8 max-w-4xl leading-[0.98] tracking-tight">
              <span className="text-silver">{LINE1} </span>
              <span className="font-display-italic text-lime">to confident, purposeful action.</span>
            </h1>
            <p className="mx-auto mt-8 max-w-2xl text-lg md:text-xl text-ink/85">{SUBTEXT}</p>
            <div className="mt-10"><Ctas /></div>
            <div className="mt-10"><Credentials /></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="relative" style={{ height: "230vh" }} data-testid="hero-section">
      {/* Pinned stage */}
      <div className="sticky top-0 flex h-screen items-center overflow-hidden" style={{ perspective: "1400px" }}>
        {/* Session backdrop with scroll-driven clarity + parallax drift */}
        <motion.div className="absolute inset-0" style={{ filter: bgFilter, scale: bgScale, y: bgY }} aria-hidden>
          <SessionBackdrop images={images} index={bgIndex} />
        </motion.div>
        <motion.div className="absolute inset-0 bg-bg" style={{ opacity: scrimOpacity }} aria-hidden />
        <div className="absolute inset-0 bg-gradient-to-b from-bg/40 via-transparent to-bg" aria-hidden />
        <div className="hero-vignette pointer-events-none absolute inset-0 z-[1]" aria-hidden />
        <div className="hero-grid pointer-events-none absolute inset-0 z-[1]" aria-hidden />
        <motion.div
          className="lime-glow pointer-events-none absolute inset-x-0 top-0 h-[75vh]"
          style={{ opacity: glowOpacity }}
          aria-hidden
        />

        {/* Content */}
        <div className="container-page relative z-10 w-full">
          <motion.div style={{ y: contentY }}>
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="premium-card relative mx-auto max-w-4xl overflow-hidden rounded-[28px] px-6 py-16 text-center md:px-14 md:py-24"
            >
              <div
                aria-hidden
                className="pointer-events-none absolute left-1/2 top-0 h-px w-28 -translate-x-1/2 bg-gradient-to-r from-transparent via-lime to-transparent"
              />

              <Kicker />

              <h1 className="mx-auto mt-8 max-w-4xl leading-[0.98] tracking-tight">
                <span className="text-silver">{LINE1} </span>
                <span className="font-display-italic text-lime">
                  {LINE2_WORDS.map((w, i) => (
                    <ScrollWord
                      key={w + i}
                      progress={scrollYProgress}
                      start={WORD_START + i * WORD_STEP}
                      end={WORD_START + i * WORD_STEP + WORD_WINDOW}
                    >
                      {w}
                    </ScrollWord>
                  ))}
                </span>
              </h1>

              <motion.p
                className="mx-auto mt-8 max-w-2xl text-lg md:text-xl text-ink/85"
                style={{ opacity: subOpacity, y: subY }}
              >
                {SUBTEXT}
              </motion.p>

              <motion.div className="mt-10" style={{ opacity: ctaOpacity, y: ctaY }}>
                <Ctas />
              </motion.div>

              <motion.div className="mt-10" style={{ opacity: credOpacity }}>
                <Credentials />
              </motion.div>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll cue */}
        <motion.div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2" style={{ opacity: cueOpacity }} aria-hidden>
          <div className="flex h-10 w-6 items-start justify-center rounded-full border border-white/20 p-1.5">
            <motion.div
              className="h-2 w-1 rounded-full bg-lime"
              animate={{ y: [0, 12, 0], opacity: [1, 0.2, 1] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        </motion.div>

        {/* Scroll progress line */}
        <motion.div
          className="absolute bottom-0 left-0 h-0.5 w-full origin-left bg-lime"
          style={{ scaleX: scrollYProgress }}
          aria-hidden
        />
      </div>
    </section>
  );
}
