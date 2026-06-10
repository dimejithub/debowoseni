import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/site/Reveal";
import { BookShelf } from "@/components/site/BookShelf";
import { FALLBACK_BOOKS } from "@/lib/data";
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

      {/* All books — interactive 3D shelf with mouse-tracked tilt + hover reveal */}
      <section className="container-page pb-24 md:pb-32">
        <BookShelf books={books} />
      </section>

      {/* CTA */}
      <section className="border-t border-line bg-surface/30 py-20">
        <div className="container-narrow">
          <p className="text-xs uppercase tracking-[0.28em] text-muted">Expressions</p>
          <h3 className="mt-5">
            Want the work behind the books? Explore the Expressions.
          </h3>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/expressions/life-transformation-enquiry"
              className="btn-lime"
              data-testid="books-explore-programmes"
            >
              Life Transformation Enquiry™ <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link to="/contact" className="btn-ghost" data-testid="books-contact-link">
              Request signed copies <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
