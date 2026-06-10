import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/site/Reveal";
import { BookCarousel } from "@/components/site/BookCarousel";
import { FALLBACK_BOOKS, SYSTEME_BOOKING_URL } from "@/lib/data";
import { getPublishedBooks } from "@/lib/api";

export default function Books() {
  const [books, setBooks] = useState(FALLBACK_BOOKS);

  useEffect(() => {
    let active = true;
    getPublishedBooks()
      .then((b) => active && b.length && setBooks(b))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  // Bring the featured book to the front so the carousel opens on it.
  const ordered = (() => {
    const featuredIdx = books.findIndex((b) => b.is_featured ?? b.featured);
    if (featuredIdx <= 0) return books;
    return [books[featuredIdx], ...books.slice(0, featuredIdx), ...books.slice(featuredIdx + 1)];
  })();

  return (
    <div data-testid="books-page">
      <section className="relative overflow-hidden">
        <div className="lime-glow absolute inset-x-0 top-0 h-[45vh]" aria-hidden />
        <div className="container-page relative py-20 md:py-28">
          <div className="container-narrow">
            <Reveal>
              <p className="text-xs uppercase tracking-[0.28em] text-muted">
                The Bookshelf
              </p>
            </Reveal>
            <Reveal delay={0.08}>
              <h1 className="mx-auto mt-7 max-w-4xl">
                Explore my <span className="font-display-italic text-lime">writings</span>.
              </h1>
            </Reveal>
            <Reveal delay={0.16}>
              <p className="mx-auto mt-7 max-w-2xl text-lg md:text-xl text-ink/85">
                Thoughtful resources for the journey of personal transformation,
                spiritual growth, and purposeful living.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* PREMIUM CAROUSEL — all books, cinematic */}
      <section className="relative pb-20 md:pb-28">
        <Reveal>
          <BookCarousel books={ordered} />
        </Reveal>
      </section>

      {/* CTA */}
      <section className="border-t border-line bg-surface/30 py-20">
        <div className="container-narrow">
          <p className="text-xs uppercase tracking-[0.28em] text-muted">Programmes</p>
          <h3 className="mt-5">
            Want the work behind the books? Explore the coaching journeys.
          </h3>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href={SYSTEME_BOOKING_URL}
              target="_blank"
              rel="noreferrer noopener"
              className="btn-lime"
              data-testid="books-explore-programmes"
            >
              See programmes <ArrowUpRight className="h-4 w-4" />
            </a>
            <Link to="/contact" className="btn-ghost" data-testid="books-contact-link">
              Request signed copies <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
