import { useEffect, useReducer } from "react";
import { Link, useParams } from "react-router-dom";
import DOMPurify from "isomorphic-dompurify";
import { ArrowLeft, ArrowRight, Link2, Linkedin, MessageCircle, Twitter } from "lucide-react";
import { toast } from "sonner";
import { Reveal } from "@/components/site/Reveal";
import { Seo } from "@/components/site/Seo";
import { getPostBySlug, getPublishedPosts } from "@/lib/api";
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
        <Link to="/articles" className="btn-ghost mt-8 inline-flex">
          <ArrowLeft className="h-4 w-4" /> Back to articles
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
      <Seo
        title={post.title}
        description={post.excerpt || undefined}
        image={post.cover_url || FALLBACK_POST_COVER}
        type="article"
      />
      <div className="container-page">
        <Link to="/articles" className="inline-flex items-center gap-2 text-sm text-muted hover:text-lime">
          <ArrowLeft className="h-4 w-4" /> Back to articles
        </Link>
      </div>

      <header className="container-prose pt-10 pb-10 text-center md:pt-14">
        <Reveal><p className="text-xs uppercase tracking-[0.24em] text-lime">{post.category}</p></Reveal>
        <Reveal delay={0.08}><h1 className="mt-6">{post.title}</h1></Reveal>
        <Reveal delay={0.16}>
          <p className="mt-6 text-sm text-muted">
            {post.author_name} · {formatDate(post.published_at)} · {readingTimeMin(post.body)} min read
          </p>
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
        <ShareRow title={post.title} />
      </div>

      {more.length > 0 && (
        <section className="border-t border-line bg-surface/30 py-20">
          <div className="container-page">
            <div className="mb-10 flex items-end justify-between">
              <h2>More articles</h2>
              <Link to="/articles" className="inline-flex items-center gap-2 text-sm text-lime">
                All articles <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {more.map((p) => (
                <Link key={p.slug} to={`/articles/${p.slug}`} className="group flex flex-col gap-3" data-testid={`more-post-${p.slug}`}>
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

function ShareRow({ title }) {
  const url = typeof window !== "undefined" ? window.location.href : "";
  const t = encodeURIComponent(title);
  const u = encodeURIComponent(url);
  const networks = [
    { label: "WhatsApp", href: `https://wa.me/?text=${t}%20—%20${u}`, Icon: MessageCircle },
    { label: "X", href: `https://twitter.com/intent/tweet?text=${t}&url=${u}`, Icon: Twitter },
    { label: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`, Icon: Linkedin },
  ];

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied.", { description: "Share it anywhere." });
    } catch {
      toast.error("Couldn't copy the link.");
    }
  };

  return (
    <div className="mt-12 flex flex-wrap items-center gap-3 border-t border-line pt-8" data-testid="share-row">
      <p className="mr-2 text-xs uppercase tracking-[0.24em] text-muted">Share this piece</p>
      {networks.map(({ label, href, Icon }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noreferrer noopener"
          aria-label={`Share on ${label}`}
          data-cursor="hover"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface text-ink transition hover:border-lime hover:text-lime"
          data-testid={`share-${label.toLowerCase()}`}
        >
          <Icon className="h-4 w-4" />
        </a>
      ))}
      <button
        type="button"
        onClick={copyLink}
        aria-label="Copy link"
        data-cursor="hover"
        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface text-ink transition hover:border-lime hover:text-lime"
        data-testid="share-copy-link"
      >
        <Link2 className="h-4 w-4" />
      </button>
    </div>
  );
}
