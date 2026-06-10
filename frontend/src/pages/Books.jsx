import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "@/components/site/Reveal";
import { BookCard } from "@/components/site/BookCard";
import { FALLBACK_BOOKS, SYSTEME_BOOKING_URL } from "@/lib/data";
import { getPublishedBooks } from "@/lib/api";

export default function Books() {
  const [books, setBooks] = useState(FALLBACK_BOOKS);

  useEffect(() => {
    let active = true;
    getPublishedBooks().then((b) => active && b.length && setBooks(b)).catch(() => {});
    return () => { active = false; };
  }, []);

  const featured = books.find((b) => b.is_featured) || books[0];
  const others = books.filter((b) => (b.id || b.slug) !== (featured?.id || featured?.slug));

  return (
    <div data-testid="books-page">
      <section className="relative overflow-hidden">
        <div className="lime-glow absolute inset-x-0 top-0 h-[45vh]" aria-hidden />
        <div className="container-page relative py-20 md:py-28">
          <div className="container-narrow">
            <Reveal><p className="text-xs uppercase tracking-[0.28em] text-muted">The Bookshelf</p></Reveal>
            <Reveal delay={0.08}>
              <h1 className="mx-auto mt-7 max-w-4xl">
                Explore my <span className="font-display-italic text-lime">writings</span>.
              </h1>
            </Reveal>
            <Reveal delay={0.16}>
              <p className="mx-auto mt-7 max-w-2xl text-lg md:text-xl text-ink/85">
                Thoughtful resources for the journey of personal transformation, spiritual
                growth, and purposeful living.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {featured && (
        <section className="cream-section py-16 md:py-24">
          <div className="container-page">
            <Reveal><BookCard book={featured} large /></Reveal>
          </div>
        </section>
      )}

      <section className="container-page py-20">
        <div className="container-narrow mb-12">
          <Reveal><h2>More from the shelf</h2></Reveal>
          <Reveal delay={0.06}>
            <p className="mt-5 text-lg text-ink/85">
              Slow, honest reading for the person who wants to be different on the other side.
            </p>
          </Reveal>
        </div>
        <Stagger className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {others.map((b) => (
            <StaggerItem key={b.id || b.slug}><BookCard book={b} /></StaggerItem>
          ))}
        </Stagger>
        <Reveal className="mt-12 flex justify-center">
          <Link to="/contact" className="btn-ghost" data-testid="books-contact-link">
            Request signed copies <ArrowUpRight className="h-4 w-4" />
          </Link>
        </Reveal>
      </section>

      <section className="border-t border-line bg-surface/30 py-20">
        <div className="container-narrow">
          <p className="text-xs uppercase tracking-[0.28em] text-muted">Programmes</p>
          <h3 className="mt-5">Want the work behind the books? Explore the coaching journeys.</h3>
          <div className="mt-8 flex justify-center">
            <a
              href={SYSTEME_BOOKING_URL}
              target="_blank"
              rel="noreferrer noopener"
              className="btn-lime"
              data-testid="books-explore-programmes"
            >
              See programmes <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
