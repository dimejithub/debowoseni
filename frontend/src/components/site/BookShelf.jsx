import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

/**
 * BookShelf — interactive "library aisle".
 *
 * Each book is a tall 3D mockup that reacts to mouse position with parallax
 * tilt (rotateX / rotateY based on the pointer's distance from the card
 * centre). Hovering lifts the book off the shelf, fires a lime glow, and
 * fades in the description + buy pill from beneath. A lime hairline below
 * all books visually anchors them to a "shelf".
 *
 * Layout: 3 columns desktop, 2 tablet, 1 mobile. Generous vertical rhythm.
 */
export function BookShelf({ books = [] }) {
  if (!books.length) return null;

  return (
    <div
      className="relative mx-auto max-w-7xl"
      data-testid="book-shelf"
    >
      {/* lime shelf line — anchors all books visually */}
      <div
        className="pointer-events-none absolute inset-x-0 top-[58%] hidden h-px bg-gradient-to-r from-transparent via-lime/40 to-transparent lg:block"
        aria-hidden
      />

      <div className="grid grid-cols-1 gap-x-10 gap-y-24 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-14">
        {books.map((b, i) => (
          <BookShelfItem key={b.id || b.slug} book={b} index={i} />
        ))}
      </div>
    </div>
  );
}

function BookShelfItem({ book, index }) {
  const cardRef = useRef(null);
  const [hovered, setHovered] = useState(false);

  // Mouse-tracked tilt
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [10, -10]), { stiffness: 240, damping: 22 });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-14, 14]), { stiffness: 240, damping: 22 });
  const lift = useSpring(hovered ? -12 : 0, { stiffness: 240, damping: 22 });

  // Reset tilt when leaving — useEffect handles ref-based reset on hover off
  useEffect(() => {
    if (!hovered) {
      mx.set(0);
      my.set(0);
    }
  }, [hovered, mx, my]);

  const handleMove = (e) => {
    const el = cardRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };

  const hasBuy = Boolean(book.buy_url || book.buyUrl);

  return (
    <motion.article
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{
        duration: 0.8,
        delay: Math.min(index * 0.08, 0.5),
        ease: [0.16, 1, 0.3, 1],
      }}
      className="group relative flex flex-col items-center text-center"
      data-testid={`book-shelf-${book.id || book.slug}`}
    >
      {/* 3D book */}
      <div
        ref={cardRef}
        className="relative w-full"
        style={{ perspective: 1500 }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onMouseMove={handleMove}
        data-cursor="hover"
      >
        <motion.div
          className="relative mx-auto aspect-[3/4.4] w-full max-w-[280px]"
          style={{
            transformStyle: "preserve-3d",
            rotateX: rx,
            rotateY: ry,
            y: lift,
          }}
        >
          {/* depth back-plate (so the tilt has dimensional weight) */}
          <div
            className="absolute inset-0 rounded-[2px] rounded-r-[6px] bg-black"
            style={{ transform: "translateZ(-22px)" }}
            aria-hidden
          />

          {/* spine */}
          <div
            className="absolute inset-y-0 left-0 w-[18px] rounded-l-[2px] bg-gradient-to-r from-black via-black/95 to-black/40"
            style={{
              transform: "rotateY(-90deg) translateZ(9px)",
              transformOrigin: "left center",
            }}
            aria-hidden
          />

          {/* front cover */}
          <div
            className="absolute inset-0 overflow-hidden rounded-[2px] rounded-r-[6px] shadow-[0_30px_70px_-18px_rgba(0,0,0,0.85),0_0_0_1px_rgba(255,255,255,0.04)]"
            style={{ transform: "translateZ(0)" }}
          >
            <img
              src={book.cover_url || book.cover}
              alt={book.title}
              loading="lazy"
              className="h-full w-full object-cover"
            />
            {/* dynamic light sweep on hover */}
            <motion.div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.18) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.25) 100%)",
                opacity: hovered ? 1 : 0,
              }}
              transition={{ duration: 0.4 }}
            />
            {/* page-edge highlight */}
            <div className="pointer-events-none absolute inset-y-0 right-0 w-[2px] bg-gradient-to-l from-white/20 to-transparent" />
          </div>

          {/* lime glow under the book when hovered */}
          <motion.div
            className="pointer-events-none absolute -inset-6 -z-10 rounded-[16px] blur-2xl"
            animate={{
              opacity: hovered ? 0.55 : 0,
              backgroundColor: "rgba(188, 234, 62, 0.35)",
            }}
            transition={{ duration: 0.4 }}
            aria-hidden
          />
        </motion.div>

        {/* ground shadow that scales with hover lift */}
        <motion.div
          className="pointer-events-none absolute inset-x-0 -bottom-2 mx-auto h-5 max-w-[220px] rounded-[100%] bg-black/70 blur-2xl"
          animate={{ scale: hovered ? 1.15 : 1, opacity: hovered ? 0.55 : 0.85 }}
          transition={{ duration: 0.4 }}
          aria-hidden
        />
      </div>

      {/* Title — always visible */}
      <h3 className="mt-10 max-w-[280px] font-display text-2xl leading-tight tracking-tight text-ink transition-colors duration-300 group-hover:text-lime md:text-[26px]">
        {book.title}
      </h3>

      {/* Description + action — slides up on hover */}
      <motion.div
        className="relative flex w-full flex-col items-center"
        initial={false}
        animate={{
          opacity: hovered ? 1 : 0.75,
          y: hovered ? 0 : 6,
        }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <p className="mt-4 max-w-[280px] text-sm leading-relaxed text-muted md:text-base">
          {book.one_liner || book.oneLiner}
        </p>

        <div className="mt-5 h-9">
          <motion.div
            initial={false}
            animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 8 }}
            transition={{ duration: 0.35 }}
          >
            {hasBuy ? (
              <a
                href={book.buy_url || book.buyUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-2 rounded-full border border-lime/70 bg-lime/10 px-4 py-1.5 text-[11px] uppercase tracking-[0.18em] text-lime backdrop-blur transition-all hover:bg-lime hover:text-bg"
                data-testid={`book-shelf-buy-${book.id || book.slug}`}
                data-cursor="hover"
              >
                Read on Amazon
                <ArrowUpRight className="h-3 w-3" />
              </a>
            ) : (
              <span className="inline-flex items-center gap-2 rounded-full border border-dashed border-line bg-bg/40 px-4 py-1.5 text-[11px] uppercase tracking-[0.18em] text-muted">
                Coming Soon
              </span>
            )}
          </motion.div>
        </div>
      </motion.div>

      {/* hairline index label */}
      <span className="pointer-events-none absolute -top-2 right-0 hidden font-display text-xs uppercase tracking-[0.22em] text-muted opacity-0 transition-opacity duration-500 group-hover:opacity-60 lg:block">
        {String(index + 1).padStart(2, "0")}
      </span>
    </motion.article>
  );
}
