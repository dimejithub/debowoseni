import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";

/**
 * BookCarousel — premium 3D-coverflow carousel for the bookshelf.
 *
 * Layout:
 *   ┌────────────────────────────────────────────────────────────┐
 *   │  ◐ peek-prev   ▰ ACTIVE (cover + editorial copy) ▰   peek-next ◑│
 *   │              ●  ○  ○  ○  ○  ○        ← Prev   Next →               │
 *   └────────────────────────────────────────────────────────────┘
 *
 * - Drag/swipe to navigate (mobile + desktop)
 * - Auto-rotates every AUTO_MS (pauses on hover or focus)
 * - Magnetic prev/next buttons + lime dot indicators
 * - Side covers tilt outward with reduced opacity for depth
 */

const AUTO_MS = 6500;
const SWIPE_PX = 60;

export function BookCarousel({ books = [] }) {
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);
  const [paused, setPaused] = useState(false);
  const trackRef = useRef(null);

  const total = books.length;
  const safe = useCallback((i) => ((i % total) + total) % total, [total]);

  const goTo = useCallback(
    (next, direction = 1) => {
      setDir(direction);
      setIndex((cur) => safe(typeof next === "function" ? next(cur) : next));
    },
    [safe]
  );

  const next = useCallback(() => goTo((i) => i + 1, 1), [goTo]);
  const prev = useCallback(() => goTo((i) => i - 1, -1), [goTo]);

  // Autoplay
  useEffect(() => {
    if (paused || total <= 1) return undefined;
    const id = setInterval(next, AUTO_MS);
    return () => clearInterval(id);
  }, [paused, next, total]);

  // Keyboard nav when carousel is focused
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return undefined;
    const onKey = (e) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        next();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        prev();
      }
    };
    el.addEventListener("keydown", onKey);
    return () => el.removeEventListener("keydown", onKey);
  }, [next, prev]);

  if (!total) return null;

  const current = books[index];
  const prevBook = books[safe(index - 1)];
  const nextBook = books[safe(index + 1)];

  return (
    <div
      ref={trackRef}
      tabIndex={0}
      role="region"
      aria-roledescription="carousel"
      aria-label="Books"
      className="relative outline-none"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      data-testid="book-carousel"
    >
      {/* lime glow background */}
      <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 h-[60%] bg-[radial-gradient(ellipse_at_center,rgba(188,234,62,0.10)_0%,transparent_70%)]" aria-hidden />

      {/* STAGE */}
      <div className="relative mx-auto flex h-[640px] max-w-6xl items-center justify-center md:h-[680px]">
        {/* peek previous (hidden on small screens) */}
        <button
          type="button"
          onClick={prev}
          aria-label={`Previous: ${prevBook.title}`}
          className="absolute left-0 top-1/2 hidden -translate-y-1/2 cursor-pointer lg:block"
          data-testid="book-peek-prev"
          tabIndex={-1}
        >
          <PeekCover book={prevBook} side="left" />
        </button>

        {/* peek next */}
        <button
          type="button"
          onClick={next}
          aria-label={`Next: ${nextBook.title}`}
          className="absolute right-0 top-1/2 hidden -translate-y-1/2 cursor-pointer lg:block"
          data-testid="book-peek-next"
          tabIndex={-1}
        >
          <PeekCover book={nextBook} side="right" />
        </button>

        {/* active card */}
        <div className="relative z-10 mx-auto h-full w-full max-w-3xl px-4 md:px-10">
          <AnimatePresence custom={dir} mode="popLayout">
            <motion.div
              key={current.id || current.slug}
              custom={dir}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.18}
              onDragEnd={(_, info) => {
                if (info.offset.x < -SWIPE_PX) next();
                else if (info.offset.x > SWIPE_PX) prev();
              }}
              className="absolute inset-0 grid cursor-grab grid-cols-1 gap-8 md:grid-cols-2 md:gap-12"
            >
              {/* cover */}
              <div className="relative h-full">
                <motion.div
                  className="relative mx-auto h-full max-h-[600px] w-full max-w-[360px] overflow-hidden rounded-[24px] border border-line bg-surface shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7),0_0_0_1px_rgba(255,255,255,0.04)]"
                  whileHover={{ rotateY: -4, rotateX: 2, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  style={{ transformStyle: "preserve-3d", perspective: 1000 }}
                >
                  <img
                    src={current.cover_url || current.cover}
                    alt={current.title}
                    loading="eager"
                    className="h-full w-full object-cover"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-bg/40 via-transparent to-transparent" />
                </motion.div>
              </div>

              {/* copy */}
              <div className="flex h-full flex-col justify-center text-left">
                <p className="font-display text-sm uppercase tracking-[0.28em] text-lime">
                  {String(index + 1).padStart(2, "0")}
                  <span className="ml-3 text-muted">/ {String(total).padStart(2, "0")}</span>
                </p>
                <h3 className="mt-4 font-display text-3xl leading-tight tracking-tight text-ink md:text-4xl">
                  {current.title}
                </h3>
                <p className="mt-5 text-lg text-ink/85">
                  {current.one_liner || current.oneLiner}
                </p>
                {current.description && (
                  <p className="mt-4 line-clamp-5 text-base leading-relaxed text-muted">
                    {current.description}
                  </p>
                )}

                <div className="mt-8 flex items-center gap-4">
                  {(current.buy_url || current.buyUrl) ? (
                    <a
                      href={current.buy_url || current.buyUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="inline-flex items-center gap-2 rounded-full bg-lime px-6 py-3 text-sm font-semibold text-bg transition-all hover:-translate-y-0.5 hover:shadow-[0_0_28px_rgba(188,234,62,0.35)]"
                      data-testid={`carousel-buy-${current.id || current.slug}`}
                    >
                      Get the book <ArrowUpRight className="h-4 w-4" />
                    </a>
                  ) : (
                    <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface-2 px-6 py-3 text-sm text-muted">
                      Buy link · TBC
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* CONTROLS */}
      <div className="mt-8 flex flex-col items-center gap-6 md:flex-row md:justify-between md:gap-4">
        {/* dots */}
        <div className="flex items-center gap-2" role="tablist">
          {books.map((b, i) => (
            <button
              key={b.id || b.slug}
              type="button"
              onClick={() => goTo(i, i > index ? 1 : -1)}
              role="tab"
              aria-selected={i === index}
              aria-label={`Go to ${b.title}`}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i === index
                  ? "w-10 bg-lime"
                  : "w-4 bg-white/15 hover:bg-white/40"
              }`}
              data-testid={`carousel-dot-${i}`}
            />
          ))}
        </div>

        {/* prev / next */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={prev}
            aria-label="Previous book"
            className="group inline-flex h-12 w-12 items-center justify-center rounded-full border border-line bg-surface/80 transition-all hover:border-lime hover:bg-lime/10"
            data-testid="carousel-prev"
          >
            <ArrowLeft className="h-4 w-4 text-ink transition-transform group-hover:-translate-x-0.5 group-hover:text-lime" />
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Next book"
            className="group inline-flex h-12 w-12 items-center justify-center rounded-full border border-line bg-surface/80 transition-all hover:border-lime hover:bg-lime/10"
            data-testid="carousel-next"
          >
            <ArrowRight className="h-4 w-4 text-ink transition-transform group-hover:translate-x-0.5 group-hover:text-lime" />
          </button>
        </div>
      </div>
    </div>
  );
}

const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 80 : -80,
    opacity: 0,
    scale: 0.96,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
  exit: (direction) => ({
    x: direction > 0 ? -80 : 80,
    opacity: 0,
    scale: 0.96,
    transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
  }),
};

function PeekCover({ book, side }) {
  const isLeft = side === "left";
  return (
    <motion.div
      whileHover={{ scale: 1.04, opacity: 0.9 }}
      transition={{ type: "spring", stiffness: 220, damping: 18 }}
      className="relative h-[360px] w-[240px] origin-center overflow-hidden rounded-[18px] border border-line bg-surface opacity-50"
      style={{
        transform: `rotate(${isLeft ? -6 : 6}deg) translateX(${isLeft ? "-30%" : "30%"})`,
      }}
    >
      <img
        src={book.cover_url || book.cover}
        alt=""
        aria-hidden
        className="h-full w-full object-cover"
      />
      <div className="pointer-events-none absolute inset-0 bg-bg/30" />
    </motion.div>
  );
}
