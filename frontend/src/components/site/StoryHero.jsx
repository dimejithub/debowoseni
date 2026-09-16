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
const LINE2 = "to confident, purposeful action";
const SUBTEXT =
  "I help purpose-driven individuals and leaders define what matters, strengthen their confidence, and develop practical strategies for meaningful personal and professional growth.";

function Eyebrow() {
  return (
    <p className="inline-flex items-center gap-3 text-xs uppercase tracking-[0.28em] text-ink/70">
      <span className="inline-block h-px w-8 bg-lime/60" />
      Transformation Coaching
      <span className="inline-block h-px w-8 bg-lime/60" />
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

// Slow crossfade of session photos — the "past session" backdrop, kept from the
// original hero. Ken-Burns drift on the visible frame.
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
 * StoryHero — a scroll-told hero. It opens on "Move from uncertainty" over a
 * blurred, dimmed session backdrop, then as you scroll the picture sharpens and
 * "to confident, purposeful action" resolves in, the deep premium card settles,
 * and the supporting copy + CTAs arrive. Falls back to a calm static hero for
 * reduced-motion.
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

  // Background: uncertainty (blurred, dim, over-scaled) → clarity (sharp, bright).
  const bgBlur = useTransform(scrollYProgress, [0, 0.55], [14, 0]);
  const bgBright = useTransform(scrollYProgress, [0, 0.6], [0.5, 1]);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1.14, 1]);
  const bgFilter = useMotionTemplate`blur(${bgBlur}px) brightness(${bgBright})`;
  const scrimOpacity = useTransform(scrollYProgress, [0, 0.6], [0.7, 0.42]);

  // Content beats. The eyebrow, "Move from uncertainty" and the card are visible
  // from the first frame; scrolling resolves the rest of the story.
  const line2Opacity = useTransform(scrollYProgress, [0.14, 0.5], [0.12, 1]);
  const line2Blur = useTransform(scrollYProgress, [0.14, 0.55], [16, 0]);
  const line2Filter = useMotionTemplate`blur(${line2Blur}px)`;
  const line2Y = useTransform(scrollYProgress, [0.14, 0.5], [24, 0]);
  const subOpacity = useTransform(scrollYProgress, [0.42, 0.64], [0, 1]);
  const subY = useTransform(scrollYProgress, [0.42, 0.64], [20, 0]);
  const ctaOpacity = useTransform(scrollYProgress, [0.56, 0.8], [0, 1]);
  const ctaY = useTransform(scrollYProgress, [0.56, 0.8], [20, 0]);
  const cueOpacity = useTransform(scrollYProgress, [0, 0.12], [1, 0]);

  // Reduced motion / no-JS-scroll fallback: a calm, fully-visible hero.
  if (reduce) {
    return (
      <section className="relative overflow-hidden" data-testid="hero-section">
        <div className="absolute inset-0">
          <SessionBackdrop images={images} index={bgIndex} />
          <div className="absolute inset-0 bg-bg/70" />
          <div className="absolute inset-0 bg-gradient-to-b from-bg/40 via-bg/60 to-bg" />
        </div>
        <div className="hero-grid pointer-events-none absolute inset-0 z-[1]" aria-hidden />
        <div className="container-page relative z-10 pt-28 pb-24 text-center md:pt-36 md:pb-32">
          <div className="premium-card mx-auto max-w-4xl rounded-[32px] px-6 py-14 md:px-12 md:py-20">
            <Eyebrow />
            <h1 className="mx-auto mt-7 max-w-4xl">
              <span className="text-silver">{LINE1} </span>
              <span className="font-display-italic text-lime">{LINE2}</span>
              <span className="text-silver">.</span>
            </h1>
            <p className="mx-auto mt-8 max-w-2xl text-lg md:text-xl text-ink/85">{SUBTEXT}</p>
            <div className="mt-10"><Ctas /></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      className="relative"
      style={{ height: "200vh" }}
      data-testid="hero-section"
    >
      {/* Pinned stage */}
      <div className="sticky top-0 flex h-screen items-center overflow-hidden" style={{ perspective: "1400px" }}>
        {/* Session backdrop with scroll-driven clarity */}
        <motion.div className="absolute inset-0" style={{ filter: bgFilter, scale: bgScale }} aria-hidden>
          <SessionBackdrop images={images} index={bgIndex} />
        </motion.div>
        <motion.div className="absolute inset-0 bg-bg" style={{ opacity: scrimOpacity }} aria-hidden />
        <div className="absolute inset-0 bg-gradient-to-b from-bg/30 via-transparent to-bg" aria-hidden />
        <div className="hero-grid pointer-events-none absolute inset-0 z-[1]" aria-hidden />
        <div className="lime-glow pointer-events-none absolute inset-x-0 top-0 h-[70vh]" aria-hidden />

        {/* Card */}
        <div className="container-page relative z-10 w-full">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="premium-card relative mx-auto max-w-4xl overflow-hidden rounded-[32px] px-6 py-14 text-center md:px-12 md:py-20"
          >
            <div className="pointer-events-none absolute -inset-px rounded-[32px] ring-1 ring-inset ring-white/5" />
            <div
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-0 h-px w-28 -translate-x-1/2 bg-gradient-to-r from-transparent via-lime to-transparent"
            />

            <Eyebrow />

            <h1 className="mx-auto mt-7 max-w-4xl">
              <span className="text-silver">{LINE1} </span>
              <motion.span
                className="font-display-italic text-lime"
                style={{ opacity: line2Opacity, y: line2Y, filter: line2Filter, display: "inline-block" }}
              >
                {LINE2}.
              </motion.span>
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
          </motion.div>
        </div>

        {/* Scroll cue — fades out as the story begins */}
        <motion.div
          className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2"
          style={{ opacity: cueOpacity }}
          aria-hidden
        >
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
