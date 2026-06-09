import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

export function BookCard({ book, large = false }) {
  return (
    <article
      data-testid={`book-card-${book.id}`}
      className={`group relative overflow-hidden rounded-[20px] border border-line bg-surface transition-colors hover:border-muted ${
        large ? "md:grid md:grid-cols-12 md:items-stretch" : ""
      }`}
    >
      <div
        className={`relative overflow-hidden ${
          large ? "md:col-span-6" : "aspect-[4/5]"
        }`}
      >
        <img
          src={book.cover}
          alt={book.title}
          loading="lazy"
          className={`h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 ${
            large ? "min-h-[420px]" : ""
          }`}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-bg/60 via-transparent to-transparent" />
        {book.featured && (
          <span className="absolute left-5 top-5 inline-flex items-center rounded-full bg-lime px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-bg">
            Featured
          </span>
        )}
        {book._todo && (
          <span className="absolute right-5 top-5 inline-flex items-center rounded-full border border-line bg-bg/70 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-muted backdrop-blur">
            Coming Soon
          </span>
        )}
      </div>

      <div className={`flex flex-col gap-4 p-6 md:p-8 ${large ? "md:col-span-6" : ""}`}>
        <h3 className="font-display text-2xl tracking-tight text-ink md:text-3xl">
          {book.title}
        </h3>
        <p className="text-ink/80">{book.oneLiner}</p>
        {large && <p className="text-muted">{book.description}</p>}

        <div className="mt-auto flex items-center gap-3 pt-4">
          {book.buyUrl ? (
            <a
              href={book.buyUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-2 rounded-full bg-lime px-5 py-2.5 text-sm font-semibold text-bg transition-all hover:-translate-y-0.5 hover:shadow-[0_0_24px_rgba(188,234,62,0.3)]"
              data-testid={`book-buy-${book.id}`}
            >
              Get the book <ArrowUpRight className="h-4 w-4" />
            </a>
          ) : (
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface-2 px-5 py-2.5 text-sm text-muted">
              Buy link · TBC
            </span>
          )}
          {!large && (
            <Link
              to="/books"
              className="text-sm text-muted underline decoration-line underline-offset-4 hover:text-lime hover:decoration-lime"
            >
              More
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
