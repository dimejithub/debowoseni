import { useEffect, useReducer } from "react";
import { Link, useParams } from "react-router-dom";
import DOMPurify from "isomorphic-dompurify";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Reveal } from "@/components/site/Reveal";
import { getPostBySlug, getPublishedPosts } from "@/lib/api";
import { FALLBACK_POST_COVER } from "@/lib/data";

function formatDate(iso) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      day: "numeric", month: "long", year: "numeric",
    });
  } catch { return ""; }
}

// Plain useReducer so the data fetch in useEffect dispatches actions
// instead of calling setState directly — keeps the lint quiet.
const initialState = { post: null, error: null, more: [] };
function reducer(state, action) {
  switch (action.type) {
    case "reset": return initialState;
    case "post": return { ...state, post: action.post, error: null };
    case "error": return { ...state, error: action.error };
    case "more": return { ...state, more: action.more };
    default: return state;
  }
}

export default function JournalPost() {
  const { slug } = useParams();
  const [state, dispatch] = useReducer(reducer, initialState);
  const { post, error, more } = state;

  useEffect(() => {
    let active = true;
    dispatch({ type: "reset" });
    getPostBySlug(slug).then(
      (p) => active && dispatch({ type: "post", post: p }),
      () => active && dispatch({ type: "error", error: "Post not found" })
    );
    getPublishedPosts(6).then((all) => {
      if (!active) return;
      dispatch({ type: "more", more: all.filter((p) => p.slug !== slug).slice(0, 3) });
    });
    return () => { active = false; };
  }, [slug]);

  if (error) {
    return (
      <div className="container-page py-32 text-center" data-testid="journal-post-missing">
        <h1>Post not found.</h1>
        <p className="mt-4 text-muted">It may have been unpublished or moved.</p>
        <Link to="/journal" className="btn-ghost mt-8 inline-flex">
          <ArrowLeft className="h-4 w-4" /> Back to journal
        </Link>
      </div>
    );
  }
  if (!post) {
    return (
      <div className="container-page py-32" data-testid="journal-post-loading">
        <div className="h-10 w-40 animate-pulse rounded-full bg-surface" />
        <div className="mt-6 h-16 w-3/4 animate-pulse rounded-2xl bg-surface" />
        <div className="mt-4 h-4 w-1/3 animate-pulse rounded-full bg-surface" />
      </div>
    );
  }

  const sanitized = DOMPurify.sanitize(post.body || "");

  return (
    <article className="pt-8" data-testid="journal-post">
      <div className="container-page">
        <Link to="/journal" className="inline-flex items-center gap-2 text-sm text-muted hover:text-lime">
          <ArrowLeft className="h-4 w-4" /> Back to journal
        </Link>
      </div>

      <header className="container-prose pt-10 pb-10 text-center md:pt-14">
        <Reveal><p className="text-xs uppercase tracking-[0.24em] text-lime">{post.category}</p></Reveal>
        <Reveal delay={0.08}><h1 className="mt-6">{post.title}</h1></Reveal>
        <Reveal delay={0.16}>
          <p className="mt-6 text-sm text-muted">{post.author_name} · {formatDate(post.published_at)}</p>
        </Reveal>
      </header>

      <div className="container-page">
        <Reveal className="overflow-hidden rounded-[20px] border border-line">
          <img src={post.cover_url || FALLBACK_POST_COVER} alt={post.title} className="aspect-[16/9] w-full object-cover" />
        </Reveal>
      </div>

      <div className="container-prose py-14">
        {post.excerpt && (<p className="mb-8 text-lg text-ink/85">{post.excerpt}</p>)}
        <div className="article-body" dangerouslySetInnerHTML={{ __html: sanitized }} data-testid="post-body" />
      </div>

      {more.length > 0 && (
        <section className="border-t border-line bg-surface/30 py-20">
          <div className="container-page">
            <div className="mb-10 flex items-end justify-between">
              <h2>More from the journal</h2>
              <Link to="/journal" className="inline-flex items-center gap-2 text-sm text-lime">
                All posts <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {more.map((p) => (
                <Link key={p.slug} to={`/journal/${p.slug}`} className="group flex flex-col gap-3" data-testid={`more-post-${p.slug}`}>
                  <div className="aspect-[4/3] overflow-hidden rounded-[16px] border border-line">
                    <img src={p.cover_url || FALLBACK_POST_COVER} alt={p.title}
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                  </div>
                  <p className="text-xs uppercase tracking-[0.18em] text-muted">{p.category}</p>
                  <h3 className="text-xl group-hover:text-lime">{p.title}</h3>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </article>
  );
}
