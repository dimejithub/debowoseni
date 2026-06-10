import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Clock, Search } from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "@/components/site/Reveal";
import { getPublishedPosts } from "@/lib/api";
import { FALLBACK_POST_COVER } from "@/lib/data";
import { readingTimeMin } from "@/lib/utils";

function formatDate(iso) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      day: "numeric", month: "long", year: "numeric",
    });
  } catch { return ""; }
}

const PREFERRED_ORDER = ["Leadership", "Relationships", "Transformation", "Inspirational"];

export default function Journal() {
  const [posts, setPosts] = useState(null);
  const [filter, setFilter] = useState("All Blogs");
  const [query, setQuery] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    getPublishedPosts(100)
      .then((p) => active && setPosts(p))
      .catch((e) => { if (active) { setError(e?.message || "Failed to load"); setPosts([]); } });
    return () => { active = false; };
  }, []);

  const categories = useMemo(() => {
    if (!posts) return ["All Blogs"];
    const set = new Set(posts.map((p) => p.category).filter(Boolean));
    const ordered = PREFERRED_ORDER.filter((c) => set.has(c));
    const rest = Array.from(set).filter((c) => !PREFERRED_ORDER.includes(c));
    return ["All Blogs", ...ordered, ...rest];
  }, [posts]);

  const visible = useMemo(() => {
    if (!posts) return [];
    let list = filter === "All Blogs" ? posts : posts.filter((p) => p.category === filter);
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (p) =>
          (p.title || "").toLowerCase().includes(q) ||
          (p.excerpt || "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [posts, filter, query]);

  return (
    <div data-testid="journal-page">
      <section className="relative overflow-hidden">
        <div className="lime-glow absolute inset-x-0 top-0 h-[45vh]" aria-hidden />
        <div className="container-page relative py-20 md:py-28">
          <div className="container-narrow">
            <Reveal><p className="text-xs uppercase tracking-[0.28em] text-muted">The Journal</p></Reveal>
            <Reveal delay={0.08}>
              <h1 className="mx-auto mt-7 max-w-4xl">
                Thoughts that move people <span className="font-display-italic text-lime">forward</span>.
              </h1>
            </Reveal>
            <Reveal delay={0.16}>
              <p className="mx-auto mt-7 max-w-2xl text-lg md:text-xl text-ink/85">
                Short pieces written at the intersection of faith, knowledge, and purpose.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="container-page pb-24">
        {posts !== null && (
          <div className="mx-auto mb-8 max-w-xl">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search the journal…"
                className="w-full rounded-full border border-line bg-surface py-3.5 pl-12 pr-5 text-sm text-ink placeholder:text-muted transition-colors focus:border-lime focus:outline-none"
                data-testid="journal-search-input"
              />
            </label>
          </div>
        )}

        {posts !== null && categories.length > 1 && (
          <div className="mb-12 flex flex-wrap justify-center gap-2">
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setFilter(c)}
                className={`rounded-full border px-4 py-2 text-sm transition ${
                  filter === c
                    ? "border-lime bg-lime text-bg"
                    : "border-line bg-surface text-ink hover:border-muted"
                }`}
                data-testid={`journal-filter-${c.toLowerCase().replace(/\s+/g, "-")}`}
              >
                {c}
              </button>
            ))}
          </div>
        )}

        {posts === null && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-72 animate-pulse rounded-[20px] border border-line bg-surface" />
            ))}
          </div>
        )}

        {posts !== null && visible.length === 0 && (
          <div className="mx-auto max-w-xl rounded-[20px] border border-line bg-surface px-8 py-16 text-center" data-testid="journal-empty">
            <span className="font-script text-5xl text-lime">soon</span>
            <p className="mt-3 text-muted">
              {error
                ? "The journal is being prepared. Please check back shortly."
                : query.trim()
                ? "No pieces match your search. Try a different word."
                : "No posts in this category yet. The first ones are on their way."}
            </p>
          </div>
        )}

        {posts !== null && visible.length > 0 && (
          <Stagger className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {visible.map((p) => (
              <StaggerItem key={p.slug}>
                <Link
                  to={`/journal/${p.slug}`}
                  className="group flex flex-col gap-4"
                  data-testid={`journal-card-${p.slug}`}
                >
                  <div className="relative aspect-[4/3] overflow-hidden rounded-[16px] border border-line bg-surface">
                    <img
                      src={p.cover_url || FALLBACK_POST_COVER}
                      alt={p.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                    />
                    {p.category && (
                      <span className="absolute right-4 top-4 inline-flex items-center rounded-full bg-lime px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-bg">
                        {p.category}
                      </span>
                    )}
                  </div>
                  <h3 className="text-2xl leading-tight text-ink group-hover:text-lime">
                    {p.title}
                  </h3>
                  <p className="line-clamp-3 text-muted">{p.excerpt}</p>
                  <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
                    <span>{p.author_name || "Debo Owoseni"} · {formatDate(p.published_at)}</span>
                    <span className="inline-flex items-center gap-1">
                      · <Clock className="h-3 w-3 text-lime" /> {readingTimeMin(p.body)} min read
                    </span>
                  </p>
                  <span className="mt-1 inline-flex items-center gap-2 text-sm text-lime opacity-0 transition group-hover:opacity-100">
                    Read post <ArrowRight className="h-4 w-4" />
                  </span>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        )}
      </section>
    </div>
  );
}
