import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "@/components/site/Reveal";
import { BookCard } from "@/components/site/BookCard";
import { BOOKS, SYSTEME_BOOKING_URL } from "@/lib/data";

export default function Books() {
  const featured = BOOKS.find((b) => b.featured) || BOOKS[0];
  const others = BOOKS.filter((b) => b.id !== featured.id);

  return (
    <div data-testid="books-page">
      <section className="relative overflow-hidden">
        <div className="lime-glow absolute inset-x-0 top-0 h-[40vh]" aria-hidden />
        <div className="container-page relative py-20 md:py-28">
          <Reveal>
            <p className="text-xs uppercase tracking-[0.24em] text-muted">The Bookshelf</p>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="mt-6 max-w-4xl font-display">
              Explore my <span className="text-lime">writings</span>.
            </h1>
          </Reveal>
          <Reveal delay={0.18}>
            <p className="mt-6 max-w-2xl text-lg text-ink/85">
              Thoughtful resources for the journey of personal transformation, spiritual
              growth, and purposeful living.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="container-page pb-12">
        <Reveal>
          <BookCard book={featured} large />
        </Reveal>
      </section>

      <section className="container-page pb-24">
        <div className="mb-10 flex items-end justify-between">
          <Reveal>
            <h2 className="font-display text-3xl tracking-tight md:text-4xl">
              More from the shelf
            </h2>
          </Reveal>
          <Link
            to="/contact"
            className="text-sm text-muted hover:text-lime"
            data-testid="books-contact-link"
          >
            Request signed copies →
          </Link>
        </div>
        <Stagger className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {others.map((b) => (
            <StaggerItem key={b.id}>
              <BookCard book={b} />
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <section className="border-t border-line bg-surface/30 py-20">
        <div className="container-page flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-muted">Programmes</p>
            <h3 className="mt-3 max-w-2xl font-display text-2xl tracking-tight md:text-3xl">
              Want the work behind the books? Explore the coaching journeys.
            </h3>
          </div>
          <a
            href={SYSTEME_BOOKING_URL}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-2 rounded-full bg-lime px-6 py-3 text-sm font-semibold text-bg transition-all hover:-translate-y-0.5 hover:shadow-[0_0_28px_rgba(188,234,62,0.35)]"
            data-testid="books-explore-programmes"
          >
            See programmes <ArrowUpRight className="h-4 w-4" />
          </a>
        </div>
      </section>
    </div>
  );
}
