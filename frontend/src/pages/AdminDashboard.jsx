import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowLeft,
  Edit3,
  Eye,
  EyeOff,
  LogOut,
  Plus,
  Trash2,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import {
  adminDeletePost,
  adminListPosts,
  adminUpdatePost,
  getHealth,
} from "@/lib/api";

export default function AdminDashboard() {
  const { user, loading, signOut } = useAuth();
  const [posts, setPosts] = useState([]);
  const [busy, setBusy] = useState(true);
  const [health, setHealth] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) return;
    refresh();
    getHealth().then(setHealth).catch(() => setHealth(null));
  }, [loading, user]);

  async function refresh() {
    setBusy(true);
    try {
      const list = await adminListPosts();
      setPosts(list);
    } catch (err) {
      toast.error("Couldn't load posts", { description: err?.message || "" });
    } finally {
      setBusy(false);
    }
  }

  if (!loading && !user) return <Navigate to="/admin/login" replace />;

  const togglePublish = async (post) => {
    try {
      const next = post.status === "published" ? "draft" : "published";
      await adminUpdatePost(post.id, { status: next });
      toast.success(next === "published" ? "Published." : "Reverted to draft.");
      refresh();
    } catch (err) {
      toast.error("Couldn't update", { description: err?.message || "" });
    }
  };

  const remove = async (post) => {
    if (!window.confirm(`Delete "${post.title}"? This can't be undone.`)) return;
    try {
      await adminDeletePost(post.id);
      toast.success("Deleted.");
      refresh();
    } catch (err) {
      toast.error("Couldn't delete", { description: err?.message || "" });
    }
  };

  return (
    <div className="grain relative min-h-screen bg-bg text-ink" data-testid="admin-dashboard">
      <header className="border-b border-line bg-surface/60 backdrop-blur">
        <div className="container-page flex h-16 items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted hover:text-lime">
            <ArrowLeft className="h-4 w-4" /> Site
          </Link>
          <p className="font-display text-sm tracking-tight">Journal · Admin</p>
          <div className="flex items-center gap-2 text-sm">
            <span className="hidden text-muted md:inline">{user?.email}</span>
            <button
              onClick={async () => {
                await signOut();
                navigate("/admin/login");
              }}
              className="inline-flex items-center gap-1 rounded-full border border-line bg-surface px-4 py-2 hover:border-lime hover:text-lime"
              data-testid="admin-signout"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="container-page py-12">
        {health && !health.schema_ready && (
          <div
            className="mb-6 rounded-[16px] border border-line bg-surface p-5 text-sm"
            data-testid="schema-warning"
          >
            <p className="font-semibold text-lime">Supabase schema not initialised.</p>
            <p className="mt-2 text-muted">
              Open Supabase → SQL Editor → New query, paste the contents of{" "}
              <code className="rounded bg-bg px-2 py-0.5 text-ink">/app/backend/supabase_schema.sql</code>{" "}
              and click Run. The journal will be live the moment it&apos;s done.
            </p>
          </div>
        )}

        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-display text-4xl tracking-tight">Posts</h1>
            <p className="text-muted">Drafts, publishes, and edits live here.</p>
          </div>
          <Link
            to="/admin/new"
            className="inline-flex items-center gap-2 rounded-full bg-lime px-5 py-3 text-sm font-semibold text-bg hover:-translate-y-0.5 hover:shadow-[0_0_24px_rgba(188,234,62,0.35)]"
            data-testid="admin-new-post"
          >
            <Plus className="h-4 w-4" /> New post
          </Link>
        </div>

        {busy ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-[16px] border border-line bg-surface" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div
            className="rounded-[20px] border border-line bg-surface p-12 text-center"
            data-testid="admin-empty"
          >
            <span className="font-script text-5xl text-lime">begin</span>
            <p className="mt-3 text-muted">No posts yet. Create the first one.</p>
            <Link
              to="/admin/new"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-lime px-5 py-3 text-sm font-semibold text-bg"
            >
              <Plus className="h-4 w-4" /> New post
            </Link>
          </div>
        ) : (
          <ul className="space-y-3" data-testid="admin-post-list">
            {posts.map((p) => (
              <li
                key={p.id}
                className="flex flex-col items-start gap-4 rounded-[16px] border border-line bg-surface px-5 py-4 md:flex-row md:items-center md:justify-between"
                data-testid={`admin-post-${p.id}`}
              >
                <div className="min-w-0">
                  <div className="mb-1 flex items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] ${
                        p.status === "published"
                          ? "bg-lime text-bg"
                          : "border border-line text-muted"
                      }`}
                    >
                      {p.status}
                    </span>
                    <span className="text-xs text-muted">{p.category}</span>
                  </div>
                  <p className="truncate font-display text-xl tracking-tight">{p.title}</p>
                  <p className="text-xs text-muted">/{p.slug}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => togglePublish(p)}
                    className="inline-flex items-center gap-1 rounded-full border border-line bg-bg px-3 py-2 text-xs text-ink hover:border-lime hover:text-lime"
                    data-testid={`toggle-publish-${p.id}`}
                  >
                    {p.status === "published" ? (
                      <>
                        <EyeOff className="h-3.5 w-3.5" /> Unpublish
                      </>
                    ) : (
                      <>
                        <Eye className="h-3.5 w-3.5" /> Publish
                      </>
                    )}
                  </button>
                  <Link
                    to={`/admin/edit/${p.id}`}
                    className="inline-flex items-center gap-1 rounded-full border border-line bg-bg px-3 py-2 text-xs text-ink hover:border-lime hover:text-lime"
                    data-testid={`edit-${p.id}`}
                  >
                    <Edit3 className="h-3.5 w-3.5" /> Edit
                  </Link>
                  <button
                    onClick={() => remove(p)}
                    className="inline-flex items-center gap-1 rounded-full border border-line bg-bg px-3 py-2 text-xs text-ink hover:border-destructive hover:text-destructive"
                    data-testid={`delete-${p.id}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
