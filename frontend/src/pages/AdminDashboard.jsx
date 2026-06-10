import { Link, Navigate, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, LogOut, FileText, Quote, BookOpen, GraduationCap, Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { getHealth } from "@/lib/api";

const CARDS = [
  { to: "/admin/posts", title: "Journal posts", desc: "Categories, drafts, publishes.", Icon: FileText, testId: "card-posts" },
  { to: "/admin/testimonials", title: "Testimonials", desc: "Quotes shown on the home page.", Icon: Quote, testId: "card-testimonials" },
  { to: "/admin/books", title: "Books", desc: "Featured book + bookshelf.", Icon: BookOpen, testId: "card-books" },
  { to: "/admin/publications", title: "Publications", desc: "Academic papers + Scholar links.", Icon: GraduationCap, testId: "card-publications" },
  { to: "/admin/events", title: "Events", desc: "Past & live events with image galleries.", Icon: Calendar, testId: "card-events" },
];

export default function AdminDashboard() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [health, setHealth] = useState(null);

  useEffect(() => {
    if (loading || !user) return;
    getHealth().then(setHealth).catch(() => setHealth(null));
  }, [loading, user]);

  if (!loading && !user) return <Navigate to="/admin/login" replace />;

  const missingTables = health?.tables
    ? Object.entries(health.tables).filter(([, ok]) => !ok).map(([t]) => t)
    : [];

  return (
    <div className="grain relative min-h-screen bg-bg text-ink" data-testid="admin-dashboard">
      <header className="border-b border-line bg-surface/60 backdrop-blur">
        <div className="container-page flex h-16 items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted hover:text-lime">
            <ArrowLeft className="h-4 w-4" /> Site
          </Link>
          <p className="font-display text-sm tracking-tight">CMS · Admin</p>
          <div className="flex items-center gap-2 text-sm">
            <span className="hidden text-muted md:inline">{user?.email}</span>
            <button
              onClick={async () => { await signOut(); navigate("/admin/login"); }}
              className="inline-flex items-center gap-1 rounded-full border border-line bg-surface px-4 py-2 hover:border-lime hover:text-lime"
              data-testid="admin-signout"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="container-page py-12">
        {missingTables.length > 0 && (
          <div className="mb-6 rounded-[16px] border border-line bg-surface p-5 text-sm" data-testid="schema-warning">
            <p className="font-semibold text-lime">Some Supabase tables are not initialised.</p>
            <p className="mt-2 text-muted">
              Missing: <code className="text-ink">{missingTables.join(", ")}</code>. Paste{" "}
              <code className="rounded bg-bg px-2 py-0.5 text-ink">/app/backend/supabase_schema_phase2.sql</code>{" "}
              into the Supabase SQL editor and Run.
            </p>
          </div>
        )}

        <div className="mb-10">
          <h1>CMS</h1>
          <p className="mt-3 max-w-2xl text-muted">
            Manage every piece of content on debowoseni.com — journal posts, testimonials,
            books, publications, and events.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {CARDS.map(({ to, title, desc, Icon, testId }) => (
            <Link
              key={to}
              to={to}
              className="card-lift group flex h-full flex-col justify-between rounded-[20px] border border-line bg-surface p-7"
              data-testid={testId}
            >
              <div className="flex items-center justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-bg">
                  <Icon className="h-4 w-4 text-lime" />
                </span>
                <ArrowRight className="h-4 w-4 text-muted transition group-hover:translate-x-1 group-hover:text-lime" />
              </div>
              <div className="mt-8">
                <h3 className="text-2xl">{title}</h3>
                <p className="mt-2 text-muted">{desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
