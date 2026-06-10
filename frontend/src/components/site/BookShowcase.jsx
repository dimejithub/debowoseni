import { ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";

/**
 * BookShowcase — clean editorial grid of all books, each rendered as a
 * 3D book mockup (cover + spine binding + ground shadow). Tilts on hover.
 * Pill action button + title + one-liner beneath each book.
 *
 * Layout mirrors the user-provided reference: 4-up on desktop, 2-up on
 * tablet, 1-up on mobile. No "featured" emphasis — every book gets the
 * same editorial treatment.
 */
export function BookShowcase({ books = [] }) {
  if (!books.length) return null;
  return (
    <div
      className="mx-auto grid max-w-7xl grid-cols-1 gap-x-10 gap-y-20 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-12"
      data-testid="book-showcase"
    >
      {books.map((b, i) => (
        <BookShowcaseItem key={b.id || b.slug} book={b} index={i} />
      ))}
    </div>
  );
}

function BookShowcaseItem({ book, index }) {
  const hasBuy = Boolean(book.buy_url || book.buyUrl);
  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{
        duration: 0.7,
        delay: Math.min(index * 0.08, 0.5),
        ease: [0.16, 1, 0.3, 1],
      }}
      className="group flex flex-col items-center text-center"
      data-testid={`book-showcase-${book.id || book.slug}`}
    >
      {/* 3D book — perspective wrapper */}
      <div
        className="relative mb-10 w-full"
        style={{ perspective: "1400px" }}
      >
        <motion.div
          className="relative mx-auto aspect-[3/4.4] w-full max-w-[260px]"
          style={{ transformStyle: "preserve-3d" }}
          initial={{ rotateY: -14, rotateX: 3 }}
          whileHover={{ rotateY: -6, rotateX: 1, scale: 1.02 }}
          transition={{ type: "spring", stiffness: 160, damping: 18 }}
        >
          {/* Cover (front face) */}
          <div
            className="absolute inset-0 overflow-hidden rounded-[2px] rounded-r-[4px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.75),0_0_0_1px_rgba(255,255,255,0.04)]"
            style={{ transform: "translateZ(0)" }}
          >
            <img
              src={book.cover_url || book.cover}
              alt={book.title}
              loading="lazy"
              className="h-full w-full object-cover"
            />
            {/* page-edge highlight (right side, simulating page block) */}
            <div className="pointer-events-none absolute inset-y-0 right-0 w-[2px] bg-gradient-to-l from-white/15 to-transparent" />
            {/* subtle inner glow */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-white/5" />
          </div>

          {/* Spine (left face) — the visible binding edge */}
          <div
            className="absolute inset-y-0 left-0 w-[14px] rounded-l-[2px] bg-gradient-to-r from-black via-black/90 to-black/40"
            style={{
              transform: "rotateY(-90deg) translateZ(7px)",
              transformOrigin: "left center",
            }}
            aria-hidden
          />

          {/* Hint of the back cover behind the page block (depth) */}
          <div
            className="absolute inset-0 rounded-[2px] rounded-r-[4px] bg-black"
            style={{ transform: "translateZ(-14px)" }}
            aria-hidden
          />
        </motion.div>

        {/* Soft ground shadow under the book */}
        <div
          className="pointer-events-none absolute inset-x-0 -bottom-3 mx-auto h-6 max-w-[200px] rounded-[100%] bg-black/50 blur-2xl"
          aria-hidden
        />
      </div>

      {/* Action pill */}
      {hasBuy ? (
        <a
          href={book.buy_url || book.buyUrl}
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex items-center gap-2 rounded-full border border-line bg-bg/70 px-5 py-2 text-[11px] uppercase tracking-[0.18em] text-ink/80 backdrop-blur transition-all hover:border-lime hover:bg-lime hover:text-bg"
          data-testid={`book-showcase-buy-${book.id || book.slug}`}
        >
          Available on Amazon
          <ArrowUpRight className="h-3 w-3" />
        </a>
      ) : (
        <span
          className="inline-flex items-center gap-2 rounded-full border border-dashed border-line bg-bg/40 px-5 py-2 text-[11px] uppercase tracking-[0.18em] text-muted"
          data-testid={`book-showcase-comingsoon-${book.id || book.slug}`}
        >
          Coming Soon
        </span>
      )}

      {/* Title */}
      <h3 className="mt-7 max-w-[260px] font-display text-2xl leading-tight tracking-tight text-ink md:text-[26px]">
        {book.title}
      </h3>

      {/* One-liner */}
      <p className="mt-4 max-w-[260px] text-sm leading-relaxed text-muted md:text-base">
        {book.one_liner || book.oneLiner}
      </p>
    </motion.article>
  );
}
