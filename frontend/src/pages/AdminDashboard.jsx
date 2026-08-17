import { Link, Navigate, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Calendar,
  Contact,
  FileText,
  GraduationCap,
  LogOut,
  Mail,
  Quote,
  Send,
  Users,
  Workflow,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { adminStats, getHealth } from "@/lib/api";

const CARDS = [
  { to: "/admin/posts", title: "Journal posts", desc: "Categories, drafts, publishes.", Icon: FileText, testId: "card-posts" },
  { to: "/admin/testimonials", title: "Testimonials", desc: "Quotes shown on the home page.", Icon: Quote, testId: "card-testimonials" },
  { to: "/admin/books", title: "Books", desc: "Featured book + bookshelf.", Icon: BookOpen, testId: "card-books" },
  { to: "/admin/publications", title: "Publications", desc: "Academic papers + Scholar links.", Icon: GraduationCap, testId: "card-publications" },
  { to: "/admin/events", title: "Events", desc: "Events, galleries and registration settings.", Icon: Calendar, testId: "card-events" },
  { to: "/admin/registrations", title: "Registrations", desc: "Who signed up, who attended.", Icon: Users, testId: "card-registrations" },
  { to: "/admin/people", title: "People", desc: "Every contact, with their full history.", Icon: Contact, testId: "card-people" },
  { to: "/admin/emails", title: "Emails", desc: "Write and send to the list.", Icon: Send, testId: "card-emails" },
  { to: "/admin/automations", title: "Automations", desc: "Triggered email sequences.", Icon: Workflow, testId: "card-automations" },
  { to: "/admin/subscribers", title: "Subscribers", desc: "The whole mailing list, exportable.", Icon: Mail, testId: "card-subscribers" },
];

/** Tiny inline sparkline — 30 days of sign-ups, no charting library needed. */
function Sparkline({ points }) {
  if (!points || points.length < 2) return null;
  const max = Math.max(...points.map((p) => p.count), 1);
  const w = 240;
  const h = 40;
  const step = w / (points.length - 1);
  const d = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${(i * step).toFixed(1)},${(h - (p.count / max) * h).toFixed(1)}`)
    .join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="mt-4 h-10 w-full" preserveAspectRatio="none" aria-hidden>
      <path d={d} fill="none" stroke="currentColor" strokeWidth="1.5" className="text-lime" />
    </svg>
  );
}

function Stat({ label, value, sub, children }) {
  return (
    <div className="rounded-[20px] border border-line bg-surface p-6">
      <p className="text-xs uppercase tracking-[0.2em] text-muted">{label}</p>
      <p className="mt-3 font-display text-4xl text-ink">{value}</p>
      {sub && <p className="mt-1 text-xs text-muted">{sub}</p>}
      {children}
    </div>
  );
}

export default function AdminDashboard() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [health, setHealth] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (loading || !user) return;
    getHealth().then(setHealth).catch(() => setHealth(null));
    adminStats().then(setStats).catch(() => setStats(null));
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
              <code className="rounded bg-bg px-2 py-0.5 text-ink">backend/supabase_schema_phase3.sql</code>{" "}
              into the Supabase SQL editor and Run.
            </p>
          </div>
        )}

        {stats && stats.mail_configured && !stats.automation_scheduler_configured && (
          <div className="mb-6 rounded-[16px] border border-line bg-surface p-5 text-sm" data-testid="scheduler-warning">
            <p className="font-semibold text-lime">Automations are not being driven.</p>
            <p className="mt-2 text-muted">
              Sequences will enrol people but never send. Set{" "}
              <code className="rounded bg-bg px-2 py-0.5 text-ink">AUTOMATION_TOKEN</code> on the
              backend and add the matching <code className="rounded bg-bg px-2 py-0.5 text-ink">AUTOMATION_TOKEN</code>{" "}
              and <code className="rounded bg-bg px-2 py-0.5 text-ink">BACKEND_URL</code> repository
              secrets so the hourly GitHub Action can run them.
            </p>
          </div>
        )}

        {stats && !stats.mail_configured && (
          <div className="mb-6 rounded-[16px] border border-line bg-surface p-5 text-sm" data-testid="mail-warning">
            <p className="font-semibold text-lime">Email sending is not configured.</p>
            <p className="mt-2 text-muted">
              Registration confirmations and broadcasts are being logged instead of sent. Set{" "}
              <code className="rounded bg-bg px-2 py-0.5 text-ink">RESEND_API_KEY</code> on the
              backend and verify the sending domain in Resend.
            </p>
          </div>
        )}

        <div className="mb-10">
          <h1>CMS</h1>
          <p className="mt-3 max-w-2xl text-muted">
            Everything on debowoseni.com — content, events, registrations and the mailing list.
          </p>
        </div>

        {/* Metrics */}
        <div className="mb-12 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4" data-testid="admin-stats">
          <Stat
            label="Mailing list"
            value={stats ? stats.subscribers.active : "—"}
            sub={stats ? `+${stats.subscribers.last_30_days} in the last 30 days` : ""}
          >
            {stats && <Sparkline points={stats.subscribers.growth} />}
          </Stat>
          <Stat
            label="Registrations"
            value={stats ? stats.registrations.total : "—"}
            sub={
              stats
                ? `${stats.registrations.attended} attended · ${stats.registrations.waitlisted} waitlisted`
                : ""
            }
          />
          <Stat
            label="Emails sent"
            value={stats ? stats.campaigns.sent : "—"}
            sub={stats ? `${stats.campaigns.total} campaigns created` : ""}
          />
          <Stat
            label="Community"
            value={stats ? stats.community.members : "—"}
            sub={stats ? `${stats.enrolments.total} programme enrolments` : ""}
          />
        </div>

        <div className="mb-12 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
          <Stat
            label="Automations running"
            value={stats ? stats.automations.sequences : "—"}
            sub={stats ? `${stats.automations.enrolled} people part-way through` : ""}
          />
          <Stat
            label="Programmes in progress"
            value={stats ? stats.enrolments.active : "—"}
            sub={stats ? `${stats.enrolments.completed} completed` : ""}
          />
          <Stat
            label="Enquiries"
            value={stats ? stats.contact_messages : "—"}
            sub="via the contact form"
          />
          <Stat
            label="Published content"
            value={stats ? stats.content.posts + stats.content.events + stats.content.books : "—"}
            sub={
              stats
                ? `${stats.content.posts} posts · ${stats.content.events} events · ${stats.content.books} books`
                : ""
            }
          />
        </div>

        {stats && stats.subscribers.by_source.length > 0 && (
          <div className="mb-12 rounded-[20px] border border-line bg-surface p-7" data-testid="stats-by-source">
            <p className="text-xs uppercase tracking-[0.2em] text-muted">Where subscribers come from</p>
            <div className="mt-5 space-y-3">
              {stats.subscribers.by_source.slice(0, 6).map(({ source, count }) => {
                const pct = Math.round((count / Math.max(stats.subscribers.total, 1)) * 100);
                return (
                  <div key={source}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-ink/85">{source}</span>
                      <span className="text-muted">{count}</span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-bg">
                      <div className="h-full rounded-full bg-lime" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

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
